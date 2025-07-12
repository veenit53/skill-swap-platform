"use client";

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export function ProfileVisibilityToggle({ profileId, isInitiallyPublic }: { profileId: string, isInitiallyPublic: boolean }) {
  const [isPublic, setIsPublic] = useState(isInitiallyPublic);

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`visibility-${profileId}`}
        checked={isPublic}
        onCheckedChange={setIsPublic}
        aria-label="Profile visibility"
      />
      <Label htmlFor={`visibility-${profileId}`} className="flex items-center gap-1 cursor-pointer">
        {isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        <span className="text-sm text-muted-foreground">{isPublic ? 'Public' : 'Private'}</span>
      </Label>
    </div>
  );
}
