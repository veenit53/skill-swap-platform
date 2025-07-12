
"use client";

import { useState, useEffect } from 'react';
import type { Profile, SwapRequest } from '@/lib/types';
import { ProfileCard } from '@/components/profile-card';
import { Input } from '@/components/ui/input';
import { Search, Users, Mail, ArrowRight, Check, X, Trash2, Clock } from 'lucide-react';
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
import { getSwapRequests, updateSwapRequest, deleteSwapRequest } from '@/services/requests';


const availabilityOptions = [
  "All",
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const router = useRouter();

  const allProfiles = getProfiles();
  const otherProfiles = allProfiles.filter(p => p.id !== currentUserId);


   useEffect(() => {
    // This effect runs on the client after hydration, so `localStorage` is available.
    const checkLoginStatus = () => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userId = localStorage.getItem('currentUserId');
        setIsLoggedIn(loggedIn);
        setCurrentUserId(userId);
        if (loggedIn && userId) {
            setSwapRequests(getSwapRequests(userId));
        }
    };
    checkLoginStatus();

    // This makes sure the component re-renders if the login state changes in another component.
    window.addEventListener('authChange', checkLoginStatus);

    return () => {
        window.removeEventListener('authChange', checkLoginStatus);
    };
  }, []);

  const filteredProfiles = otherProfiles.filter(profile => {
    const searchMatch = profile.isPublic && (
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
      updateSwapRequest(id, newStatus);
    }
    setSwapRequests(getSwapRequests(currentUserId));
  };

  const handleRequestClick = (e: React.MouseEvent<HTMLButtonElement>, profile: Profile) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
    } else {
      router.push(`/profile/${profile.id}`);
    }
  };

  const gridContainerClass = isLoggedIn 
    ? "container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 py-8 items-start" 
    : "container mx-auto py-8";

  const discoverProfilesClass = isLoggedIn ? "lg:col-span-2 space-y-8" : "space-y-8";

  return (
    <div className={gridContainerClass}>
      {isLoggedIn && (
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
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 transition-all">
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
                        {req.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleRequestAction(req.id, 'accepted')}><Check className="h-4 w-4" /></Button>
                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleRequestAction(req.id, 'rejected')}><X className="h-4 w-4" /></Button>
                          </div>
                        ) : (
                          <Badge variant={req.status === 'accepted' ? 'default' : 'destructive'} className="capitalize">{req.status}</Badge>
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
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
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
                         {req.status === 'pending' ? (
                            <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => handleRequestAction(req.id, 'deleted')}><Trash2 className="h-4 w-4" /></Button>
                         ) : (
                          <Badge variant={req.status === 'accepted' ? 'default' : 'destructive'} className="capitalize">{req.status}</Badge>
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
              {filteredProfiles.length > 0 ? filteredProfiles.map(profile => (
                  <div key={profile.id} className="relative group">
                      <ProfileCard profile={profile} isLoggedIn={isLoggedIn} />
                      <div className="absolute bottom-4 right-4">
                          <Button 
                              variant="default" 
                              size="sm" 
                              onClick={(e) => handleRequestClick(e, profile)}
                          >
                              Request
                          </Button>
                      </div>
                  </div>
              )) : <p className="text-muted-foreground col-span-full text-center py-12">No public profiles match your search.</p>}
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
