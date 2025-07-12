
import type { Profile, Review } from '@/lib/types';
import { deleteAllUserRequests } from './requests';

const PROFILES_STORAGE_KEY = 'skill_swap_profiles';

// This is a mock database. In a real application, you would use a real database.
let allProfiles: Profile[] = [];

function loadProfiles() {
    if (typeof window === 'undefined') {
        allProfiles = [];
        return;
    }

    try {
        const storedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
        allProfiles = storedProfiles ? JSON.parse(storedProfiles) : [];
    } catch (error) {
        console.error("Failed to load profiles from localStorage", error);
        allProfiles = [];
    }
}


function saveProfiles() {
    if (typeof window !== 'undefined') {
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(allProfiles, null, 2));
        window.dispatchEvent(new Event('dataChanged'));
    }
}

// Load profiles when the module is imported on the client side
loadProfiles();

export function getProfiles(): Profile[] {
    return allProfiles;
}

export function getProfileById(id: string): Profile | null {
    return allProfiles.find(p => p.id === id) || null;
}

export function getProfileByEmail(email: string): Profile | null {
    return allProfiles.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
}

export function updateProfile(updatedProfile: Profile) {
    const profileIndex = allProfiles.findIndex(p => p.id === updatedProfile.id);
    if (profileIndex !== -1) {
      allProfiles[profileIndex] = updatedProfile;
      saveProfiles();
    }
}

export function createProfile(data: { name: string; email: string; password?: string; }): Profile {
    const newProfile: Profile = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        password: data.password,
        location: '',
        avatarUrl: `https://placehold.co/128x128.png`,
        skillsOffered: [],
        skillsWanted: [],
        availability: 'Flexible',
        isPublic: true,
        reviews: [],
    };
    allProfiles.push(newProfile);
    saveProfiles();
    return newProfile;
}

export function deleteProfile(id: string) {
    allProfiles = allProfiles.filter(p => p.id !== id);
    deleteAllUserRequests(id);
    saveProfiles();
}

export function addReviewToProfile(profileId: string, review: Review) {
    const profile = getProfileById(profileId);
    if (profile) {
        if (!profile.reviews) {
            profile.reviews = [];
        }
        profile.reviews.push(review);
        updateProfile(profile);
    }
}

    