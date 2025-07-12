
"use client";

import type { Profile } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function ProfileCard({ profile, isLoggedIn = false }: { profile: Profile; isLoggedIn?: boolean; }) {
  const initials = profile.name.split(' ').map(n => n[0]).join('');

  return (
    <Link href={`/profile/${profile.id}`} className="block transition-all hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg">
      <Card className="w-full flex items-center p-4 bg-card cursor-pointer h-full">
        <Avatar className="h-16 w-16 border">
          <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="person portrait" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <CardContent className="p-0 pl-4 flex-1">
          <h3 className="text-lg font-semibold">{profile.name}</h3>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-sm font-medium mr-2">Offers:</span>
            {profile.skillsOffered.slice(0, 3).map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
            {profile.skillsOffered.length > 3 && <Badge variant="outline">+{profile.skillsOffered.length - 3}</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
