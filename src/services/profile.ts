import type { Profile } from '@/lib/types';

// This is a mock database. In a real application, you would use a real database.
let allProfiles: Profile[] = [
  { id: 'user-1', name: 'Alex Doe', email: 'alex.doe@example.com', location: 'San Francisco, CA', avatarUrl: 'https://placehold.co/128x128.png', skillsOffered: ['UI/UX Design', 'Figma', 'Prototyping'], skillsWanted: ['React Native', 'Firebase'], availability: '5-10 hours per week', isPublic: true },
  { id: 'user-2', name: 'Jane Smith', email: 'jane.smith@example.com', location: 'New York, NY', avatarUrl: 'https://placehold.co/128x128.png', skillsOffered: ['React Native', 'TypeScript'], skillsWanted: ['Figma', 'Web Accessibility'], availability: '3-5 hours per week', isPublic: true },
  { id: 'user-3', name: 'Sam Wilson', email: 'sam.wilson@example.com', location: 'Chicago, IL', avatarUrl: 'https://placehold.co/128x128.png', skillsOffered: ['Python', 'Data Analysis', 'Machine Learning'], skillsWanted: ['Project Management', 'Agile'], availability: '10+ hours per week', isPublic: true },
  { id: 'user-4', name: 'Maria Garcia', email: 'maria.garcia@example.com', location: 'Austin, TX', avatarUrl: 'https://placehold.co/128x128.png', skillsOffered: ['Content Writing', 'SEO Strategy'], skillsWanted: ['Graphic Design', 'Video Editing'], availability: 'Flexible', isPublic: false },
  { id: 'user-5', name: 'Kenji Tanaka', email: 'kenji.tanaka@example.com', location: 'Tokyo, Japan', avatarUrl: 'https://placehold.co/128x128.png', skillsOffered: ['Firebase', 'Google Cloud', 'Node.js'], skillsWanted: ['Go', 'Kubernetes'], availability: '8 hours per week', isPublic: true },
];

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
    }
}
