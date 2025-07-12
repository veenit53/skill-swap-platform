
"use client"

import { useParams } from 'next/navigation'
import type { Profile } from '@/lib/types';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Edit, Star } from 'lucide-react';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { RequestSwapDialog } from '@/components/request-swap-dialog';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getProfileById, updateProfile, getProfiles } from '@/services/profile';

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null | undefined>(undefined);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    setCurrentUserId(userId);
    
    const foundProfile = getProfileById(profileId);
    setProfile(foundProfile);

    if (userId) {
      const foundCurrentUserProfile = getProfileById(userId);
      setCurrentUserProfile(foundCurrentUserProfile);
    }
  }, [profileId]);


  const isCurrentUser = profileId === currentUserId;

  const handleProfileUpdate = (updatedProfile: Profile) => {
    // In a real app, you'd also update this in your backend.
    updateProfile(updatedProfile);
    setProfile(updatedProfile);
  };

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
                             {!isCurrentUser && currentUserProfile && (
                                <RequestSwapDialog
                                  targetProfile={profile}
                                  currentUserProfile={currentUserProfile}
                                >
                                  <Button>Request</Button>
                                </RequestSwapDialog>
                              )}
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
                      <h3 className="text-lg font-semibold mb-4">Rating and Feedback</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400">
                          <Star />
                          <Star />
                          <Star />
                          <Star />
                          <Star className="text-muted" />
                        </div>
                        <span className="text-muted-foreground">(4.0 from 12 reviews)</span>
                      </div>
                      <div className="mt-4 space-y-4 text-sm">
                        <p className="text-muted-foreground italic">No feedback yet. Be the first to leave a review after a successful swap!</p>
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
