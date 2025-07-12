export type Profile = {
  id: string;
  name: string;
  email: string;
  location?: string;
  avatarUrl?: string;
  skillsOffered: string[];
  skillsWanted:string[];
  availability: string;
  isPublic: boolean;
};

export type SwapRequest = {
  id: string;
  fromUser: Pick<Profile, 'id' | 'name' | 'avatarUrl'>;
  toUser: Pick<Profile, 'id' | 'name' | 'avatarUrl'>;
  offeredSkill: string;
  wantedSkill: string;
  status: 'pending' | 'accepted' | 'rejected';
  type: 'incoming' | 'outgoing';
};
