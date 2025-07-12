export type Review = {
  fromUserId: string;
  fromUserName: string;
  fromUserAvatarUrl?: string;
  rating: number;
  comment: string;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  password?: string;
  location?: string;
  avatarUrl?: string;
  skillsOffered: string[];
  skillsWanted:string[];
  availability: string;
  isPublic: boolean;
  reviews: Review[];
};

export type SwapRequest = {
  id:string;
  fromUser: Pick<Profile, 'id' | 'name' | 'avatarUrl'>;
  toUser: Pick<Profile, 'id' | 'name' | 'avatarUrl'>;
  offeredSkill: string;
  wantedSkill: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  type: 'incoming' | 'outgoing';
  fromUserReviewed: boolean;
  toUserReviewed: boolean;
};