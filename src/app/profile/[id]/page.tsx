
"use client"

import { useParams } from 'next/navigation'
import type { Profile, Review } from '@/lib/types';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Edit, Star, ArrowLeft, MessageSquare } from 'lucide-react';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { RequestSwapDialog } from '@/components/request-swap-dialog';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getProfileById, updateProfile, getProfiles } from '@/services/profile';
import Link from 'next/link';
import { LeaveFeedbackDialog } from '@/components/leave-feedback-dialog';

const StarRating = ({ rating }: { rating: number }) => {
    const totalStars = 5;
    return (
        <div className="flex text-yellow-400">
            {[...Array(totalStars)].map((_, i) => (
                <Star key={i} className={i < Math.round(rating) ? "fill-current" : "text-muted-foreground/50"} />
            ))}
        </div>
    );
};

const ReviewCard = ({ review }: { review: Review }) => (
    <Card className="bg-secondary/50">
        <CardContent className="p-4">
            <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={review.fromUserAvatarUrl} alt={review.fromUserName} data-ai-hint="person" />
                    <AvatarFallback>{review.fromUserName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold">{review.fromUserName}</p>
                        <StarRating rating={review.rating} />
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">{review.comment}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null | undefined>(undefined);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchProfileData = () => {
    const userId = localStorage.getItem('currentUserId');
    setCurrentUserId(userId);
    
    const foundProfile = getProfileById(profileId);
    setProfile(foundProfile);

    if (userId) {
      const foundCurrentUserProfile = getProfileById(userId);
      setCurrentUserProfile(foundCurrentUserProfile);
    }
  }

  useEffect(() => {
    fetchProfileData();
    window.addEventListener('dataChanged', fetchProfileData);
    return () => {
        window.removeEventListener('dataChanged', fetchProfileData);
    }
  }, [profileId]);


  const isCurrentUser = profileId === currentUserId;
  const isLoggedIn = !!currentUserId;

  const handleProfileUpdate = (updatedProfile: Profile) => {
    updateProfile(updatedProfile);
    fetchProfileData();
  };

  const handleFeedbackSubmitted = () => {
    fetchProfileData();
  }

  if (profile === undefined) {
    return (
        <>
            <Header />
            <main className="container mx-auto py-8 text-center">
                <p>Loading...</p>
            </main>
        </>
    )
  }

  if (!profile) {
    return (
        <>
            <Header />
            <main className="container mx-auto py-8 text-center">
                <h1 className="text-2xl font-bold">Profile not found</h1>
                <p className="text-muted-foreground">The profile you are looking for does not exist.</p>
            </main>
        </>
    )
  }
  
  const initials = profile.name.split(' ').map(n => n[0]).join('');
  const averageRating = profile.reviews?.length > 0
    ? profile.reviews.reduce((acc, review) => acc + review.rating, 0) / profile.reviews.length
    : 0;
  const reviewCount = profile.reviews?.length || 0;

  const hasUserAlreadyReviewed = currentUserId && profile.reviews?.some(r => r.fromUserId === currentUserId);
  const canLeaveReview = isLoggedIn && !isCurrentUser && !hasUserAlreadyReviewed;


  return (
    <>
        <Header />
        <main className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <Card className="w-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                       <Avatar className="h-32 w-32 border-2">
                          <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="person portrait" />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 pt-2">
                          <div className="flex justify-between items-start">
                             <div>
                                <h1 className="text-3xl font-bold">{profile.name}</h1>
                                {isCurrentUser && currentUserProfile && (
                                  <EditProfileDialog profile={currentUserProfile} onProfileUpdate={handleProfileUpdate}>
                                      <Button variant="ghost" size="sm" className="mt-1 -ml-2">
                                          <Edit className="mr-2 h-4 w-4" /> Edit Profile
                                      </Button>
                                  </EditProfileDialog>
                                )}
                              </div>
                             {!isLoggedIn ? (
                                <Button asChild variant="outline">
                                    <Link href="/">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Discover
                                    </Link>
                                </Button>
                             ) : !isCurrentUser && currentUserProfile ? (
                                <RequestSwapDialog
                                  targetProfile={profile}
                                  currentUserProfile={currentUserProfile}
                                >
                                  <Button>Request Swap</Button>
                                </RequestSwapDialog>
                              ) : null }
                          </div>
                        </div>
                    </div>
                    
                    <Separator className="my-6" />

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Skills Offered</h3>
                         <div className="flex flex-wrap gap-2">
                            {profile.skillsOffered.map(skill => <Badge key={skill} variant="secondary" className="text-base py-1 px-3">{skill}</Badge>)}
                          </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Skills Wanted</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skillsWanted.map(skill => <Badge key={skill} variant="outline" className="text-base py-1 px-3">{skill}</Badge>)}
                          </div>
                      </div>
                    </div>

                    <Separator className="my-6" />
                    
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Rating and Feedback</h3>
                        {canLeaveReview && currentUserId && (
                           <LeaveFeedbackDialog
                                fromUserId={currentUserId}
                                toProfile={profile}
                                onFeedbackSubmitted={handleFeedbackSubmitted}
                            >
                                <Button size="sm" variant="outline"><MessageSquare className="mr-1 h-4 w-4" /> Leave a Review</Button>
                            </LeaveFeedbackDialog>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <StarRating rating={averageRating} />
                        <span className="text-muted-foreground">({averageRating.toFixed(1)} from {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                      </div>
                      <div className="mt-4 space-y-4">
                        {reviewCount > 0 ? (
                            profile.reviews.slice().reverse().map(review => (
                                <ReviewCard key={review.fromUserId} review={review} />
                            ))
                        ) : (
                            <p className="text-muted-foreground italic">No feedback yet. Be the first to leave a review!</p>
                        )}
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </div>
            </div>
        </main>
    </>
  );
}
