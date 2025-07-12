
import type { SwapRequest } from '@/lib/types';

const REQUESTS_STORAGE_KEY = 'skill_swap_requests';

// This is a mock database. In a real application, you would use a real database.
let swapRequests: Omit<SwapRequest, 'type'>[] = [];

function loadRequests() {
    if (typeof window === 'undefined') {
        swapRequests = [];
        return;
    }
    try {
        const storedRequests = localStorage.getItem(REQUESTS_STORAGE_KEY);
        swapRequests = storedRequests ? JSON.parse(storedRequests) : [];
    } catch (error) {
        console.error("Failed to load requests from localStorage", error);
        swapRequests = [];
    }
}

function saveRequests() {
    if (typeof window !== 'undefined') {
        localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(swapRequests, null, 2));
        window.dispatchEvent(new Event('dataChanged'));
    }
}

// Load requests when the module is imported on the client side
loadRequests();


export function getSwapRequests(currentUserId: string): SwapRequest[] {
    return swapRequests
        .filter(req => req.fromUser.id === currentUserId || req.toUser.id === currentUserId)
        .map(req => ({
        ...req,
        type: req.fromUser.id === currentUserId ? 'outgoing' : 'incoming',
    }));
}

export function createSwapRequest(request: Omit<SwapRequest, 'id' | 'status' | 'type' | 'fromUserReviewed' | 'toUserReviewed'>) {
    const newRequest = {
        id: `req-${Date.now()}`,
        status: 'pending' as const,
        fromUserReviewed: false,
        toUserReviewed: false,
        ...request,
    };
    swapRequests.push(newRequest);
    saveRequests();
    return newRequest;
}

export function updateSwapRequestStatus(id: string, status: 'accepted' | 'rejected') {
    const requestIndex = swapRequests.findIndex(req => req.id === id);
    if (requestIndex !== -1) {
        // In this simplified app, 'accepted' immediately becomes 'completed'
        // to allow for feedback.
        swapRequests[requestIndex].status = status === 'accepted' ? 'completed' : 'rejected';
        saveRequests();
    }
}

export function markReviewSubmitted(requestId: string, userId: string) {
    const requestIndex = swapRequests.findIndex(req => req.id === requestId);
    if (requestIndex !== -1) {
        const request = swapRequests[requestIndex];
        if (request.fromUser.id === userId) {
            request.fromUserReviewed = true;
        } else if (request.toUser.id === userId) {
            request.toUserReviewed = true;
        }
        saveRequests();
    }
}

export function deleteSwapRequest(id: string) {
    swapRequests = swapRequests.filter(req => req.id !== id);
    saveRequests();
}

export function deleteAllUserRequests(userId: string) {
    swapRequests = swapRequests.filter(req => req.fromUser.id !== userId && req.toUser.id !== userId);
    saveRequests();
}

    