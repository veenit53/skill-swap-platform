
"use client";

import { LogOut, Home as HomeIcon, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SkillVerseLogo } from './skillverse-logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Profile } from '@/lib/types';
import { getProfileById } from '@/services/profile';


export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [initials, setInitials] = useState('');

  const isLoginPage = pathname === '/login';
  const isProfilePage = pathname.startsWith('/profile/');
  const isHomePage = pathname === '/';

  useEffect(() => {
    // This effect will run on the client side after hydration
    const checkLoginStatus = () => {
        const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn !== loggedIn) {
          setIsLoggedIn(loggedIn);
        }
        if (loggedIn) {
          const currentUserId = localStorage.getItem('currentUserId');
          if (currentUserId) {
            const userProfile = getProfileById(currentUserId);
            setCurrentUser(userProfile);
            if (userProfile) {
                setInitials(userProfile.name.split(' ').map(n => n[0]).join(''));
            }
          }
        } else {
            setCurrentUser(null);
        }
    };
    checkLoginStatus();

    // Listen for custom event to update header on login/logout
    window.addEventListener('authChange', checkLoginStatus);

    // Cleanup listener on component unmount
    return () => {
        window.removeEventListener('authChange', checkLoginStatus);
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserId');
    setIsLoggedIn(false);
    setCurrentUser(null);
    toast({
      title: "Successfully logged out",
    });
    // The authChange event will be caught by the useEffect to update the state
    window.dispatchEvent(new Event('authChange')); 
    router.push('/login');
  };
  
  return (
    <header className="py-4 border-b">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
                <SkillVerseLogo className="h-10 w-10" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Skill Swap Platform</h1>
                </div>
            </Link>
        </div>
        <div className="flex items-center gap-4">
            {isLoginPage ? (
                <Button asChild variant="outline">
                    <Link href="/">
                        <HomeIcon className="mr-2 h-4 w-4" />
                        Home
                    </Link>
                </Button>
            ) : isLoggedIn && currentUser ? (
            <>
              <div className="flex items-center gap-4">
                 {isHomePage && (
                    <Button variant="ghost" asChild>
                        <Link href="/">
                            Swap Requests
                        </Link>
                    </Button>
                 )}
                { isProfilePage ? (
                    <Button variant="ghost" asChild>
                        <Link href="/">
                            Home
                        </Link>
                    </Button>
                ) : (
                    !isHomePage && <Button variant="ghost" asChild>
                        <Link href="/">
                            Home
                        </Link>
                    </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button>
                      <Avatar className="h-9 w-9 cursor-pointer">
                        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="person portrait"/>
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                       <Link href={`/profile/${currentUser.id}`}>
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
            ) : (
            <Button asChild>
                <Link href="/login">Login</Link>
            </Button>
            )}
        </div>
      </div>
    </header>
  );
}
