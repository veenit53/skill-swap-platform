
"use client";

import { useState, useEffect } from 'react';
import type { Profile, SwapRequest } from '@/lib/types';
import { ProfileCard } from '@/components/profile-card';
import { Input } from '@/components/ui/input';
import { Search, Users, Mail, ArrowRight, Check, X, Trash2, Clock, MessageSquare, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getProfiles } from '@/services/profile';
import { getSwapRequests, updateSwapRequestStatus, deleteSwapRequest } from '@/services/requests';
import { LeaveFeedbackDialog } from './leave-feedback-dialog';


const availabilityOptions = [
  "All",
  "1-2 hours per week",
  "3-5 hours per week",
  "5-10 hours per week",
  "8 hours per week",
  "10+ hours per week",
  "Flexible",
];


export function SkillSwapDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const router = useRouter();
  
  const fetchAllData = () => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userId = localStorage.getItem('currentUserId');
    setCurrentUserId(userId);

    const allProfiles = getProfiles();
    setProfiles(allProfiles);

    if (loggedIn && userId) {
        setSwapRequests(getSwapRequests(userId));
    } else {
        setSwapRequests([]);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchAllData();

    const handleDataChange = () => fetchAllData();
    window.addEventListener('authChange', handleDataChange);
    window.addEventListener('dataChanged', handleDataChange);

    return () => {
        window.removeEventListener('authChange', handleDataChange);
        window.removeEventListener('dataChanged', handleDataChange);
    };
  }, []);

  const filteredProfiles = profiles.filter(profile => {
    // Don't show the current user in the discover list
    if (currentUserId && profile.id === currentUserId) {
      return false;
    }
    
    const searchMatch = (
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.skillsOffered.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      profile.skillsWanted.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const availabilityMatch = availabilityFilter === 'All' || profile.availability === availabilityFilter;

    return searchMatch && availabilityMatch;
  });

  const incomingRequests = swapRequests.filter(req => req.type === 'incoming');
  const outgoingRequests = swapRequests.filter(req => req.type === 'outgoing');

  const handleRequestAction = (id: string, newStatus: 'accepted' | 'rejected' | 'deleted') => {
    if (!currentUserId) return;
    if (newStatus === 'deleted') {
      deleteSwapRequest(id);
    } else {
      updateSwapRequestStatus(id, newStatus);
    }
    fetchAllData();
  };

  const handleRequestClick = (e: React.MouseEvent<HTMLButtonElement>, profileId: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!currentUserId) {
      setShowLoginPrompt(true);
    } else {
      router.push(`/profile/${profileId}`);
    }
  };

  const gridContainerClass = currentUserId 
    ? "container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 py-8 items-start" 
    : "container mx-auto py-8";

  const discoverProfilesClass = currentUserId ? "lg:col-span-2 space-y-8" : "space-y-8";
  
  const getBadgeForStatus = (status: SwapRequest['status']) => {
    switch(status) {
        case 'pending': return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
        case 'accepted': return <Badge variant="default"><Check className="h-3 w-3 mr-1" />Accepted</Badge>
        case 'rejected': return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>
        case 'completed': return <Badge variant="outline" className="border-green-500 text-green-600"><Star className="h-3 w-3 mr-1" />Completed</Badge>
    }
  }

  return (
    <div className={gridContainerClass}>
      {currentUserId && (
        <div className="lg:col-span-1 space-y-8 sticky top-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                    <Mail className="h-6 w-6 text-primary" />
                    <CardTitle>Swap Requests</CardTitle>
                </div>
                <CardDescription>Manage your incoming and outgoing skill swap proposals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4 text-lg">Incoming ({incomingRequests.length})</h4>
                  <div className="space-y-4">
                    {incomingRequests.length > 0 ? incomingRequests.map(req => (
                      <div key={req.id} className="flex flex-col p-3 rounded-lg bg-secondary/50 transition-all gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage src={req.fromUser.avatarUrl} data-ai-hint="person" />
                                <AvatarFallback>{req.fromUser.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{req.fromUser.name}</p>
                                <span className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                  <span>Offers: <Badge variant="outline">{req.offeredSkill}</Badge></span>
                                  <ArrowRight className="h-3 w-3" />
                                  <span>Wants: <Badge variant="outline">{req.wantedSkill}</Badge></span>
                                </span>
                              </div>
                            </div>
                            {getBadgeForStatus(req.status)}
                        </div>
                        {req.status === 'pending' && (
                          <div className="flex gap-2 self-end">
                            <Button size="sm" variant="default" onClick={() => handleRequestAction(req.id, 'accepted')}><Check className="mr-1 h-4 w-4" /> Accept</Button>
                            <Button size="sm" variant="outline" onClick={() => handleRequestAction(req.id, 'rejected')}><X className="mr-1 h-4 w-4"/> Reject</Button>
                          </div>
                        )}
                        {req.status === 'completed' && !req.toUserReviewed && currentUserId && (
                           <LeaveFeedbackDialog
                                requestId={req.id}
                                fromUserId={currentUserId}
                                toProfile={req.fromUser}
                                onFeedbackSubmitted={fetchAllData}
                            >
                                <Button size="sm" variant="outline" className="self-end"><MessageSquare className="mr-1 h-4 w-4" /> Leave Feedback</Button>
                            </LeaveFeedbackDialog>
                        )}
                      </div>
                    )) : <p className="text-muted-foreground text-sm">No incoming requests.</p>}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-4 text-lg">Outgoing ({outgoingRequests.length})</h4>
                  <div className="space-y-4">
                    {outgoingRequests.length > 0 ? outgoingRequests.map(req => (
                      <div key={req.id} className="flex flex-col p-3 rounded-lg bg-secondary/50 gap-3">
                         <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage src={req.toUser.avatarUrl} data-ai-hint="person" />
                                <AvatarFallback>{req.toUser.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">To: {req.toUser.name}</p>
                                <span className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
                                  <span>Offering: <Badge variant="outline">{req.offeredSkill}</Badge></span>
                                  <ArrowRight className="h-3 w-3" />
                                  <span>Wanting: <Badge variant="outline">{req.wantedSkill}</Badge></span>
                                </span>
                              </div>
                            </div>
                            {getBadgeForStatus(req.status)}
                        </div>
                        {req.status === 'pending' && (
                            <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive self-end" onClick={() => handleRequestAction(req.id, 'deleted')}><Trash2 className="h-4 w-4" /></Button>
                        )}
                        {req.status === 'completed' && !req.fromUserReviewed && currentUserId && (
                            <LeaveFeedbackDialog
                                requestId={req.id}
                                fromUserId={currentUserId}
                                toProfile={req.toUser}
                                onFeedbackSubmitted={fetchAllData}
                            >
                                <Button size="sm" variant="outline" className="self-end"><MessageSquare className="mr-1 h-4 w-4" /> Leave Feedback</Button>
                            </LeaveFeedbackDialog>
                        )}
                      </div>
                    )) : <p className="text-muted-foreground text-sm">No outgoing requests.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      )}
      <div className={discoverProfilesClass}>
          <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 self-start">
                        <Users className="h-6 w-6 text-primary" />
                        <CardTitle>Discover Profiles</CardTitle>
                    </div>
                    <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by skill or name..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                                <SelectValue placeholder="Availability" />
                            </SelectTrigger>
                            <SelectContent>
                                {availabilityOptions.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              {!isClient ? (
                  <p className="text-muted-foreground col-span-full text-center py-12">Loading profiles...</p>
              ) : filteredProfiles.length > 0 ? filteredProfiles.map(profile => (
                  <div key={profile.id} className="relative group">
                      <ProfileCard profile={profile} />
                      <div className="absolute bottom-4 right-4">
                          <Button 
                              variant="default" 
                              size="sm" 
                              onClick={(e) => handleRequestClick(e, profile.id)}
                          >
                              Request
                          </Button>
                      </div>
                  </div>
              )) : <p className="text-muted-foreground col-span-full text-center py-12">No public profiles found. Sign up to be the first!</p>}
          </CardContent>
          </Card>
      </div>
      
      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              You need to be logged in to request a skill swap.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/login')}>
              Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

    