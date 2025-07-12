import type { SwapRequest } from '@/lib/types';

let swapRequests: Omit<SwapRequest, 'type'>[] = [
  { id: 'req-1', fromUser: { id: 'user-2', name: 'Jane Smith', avatarUrl: 'https://placehold.co/128x128.png' }, toUser: { id: 'user-1', name: 'Alex Doe', avatarUrl: 'https://placehold.co/128x128.png' }, offeredSkill: 'React Native', wantedSkill: 'UI/UX Design', status: 'pending' },
  { id: 'req-2', fromUser: { id: 'user-1', name: 'Alex Doe', avatarUrl: 'https://placehold.co/128x128.png' }, toUser: { id: 'user-3', name: 'Sam Wilson', avatarUrl: 'https://placehold.co/128x128.png' }, offeredSkill: 'Figma', wantedSkill: 'Python', status: 'pending' },
];

export function getSwapRequests(currentUserId: string): SwapRequest[] {
    return swapRequests.map(req => ({
        ...req,
        type: req.fromUser.id === currentUserId ? 'outgoing' : 'incoming',
    }));
}

export function createSwapRequest(request: Omit<SwapRequest, 'id' | 'status' | 'type'>) {
    const newRequest = {
        id: `req-${Date.now()}`,
        status: 'pending' as const,
        ...request,
    };
    swapRequests.push(newRequest);
    return newRequest;
}

export function updateSwapRequest(id: string, status: 'accepted' | 'rejected') {
    const requestIndex = swapRequests.findIndex(req => req.id === id);
    if (requestIndex !== -1) {
        swapRequests[requestIndex].status = status;
    }
}

export function deleteSwapRequest(id: string) {
    swapRequests = swapRequests.filter(req => req.id !== id);
}
