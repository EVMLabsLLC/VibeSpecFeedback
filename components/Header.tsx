"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { LogIn, LogOut, User, MessageSquare } from "lucide-react";

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  const handleAuthClick = () => {
    if (user) {
      logout();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 min-w-0 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-background"></div>
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="text-base sm:text-xl font-bold gradient-text truncate">feedback.vibespec</h1>
                <p className="text-xs text-muted-foreground leading-none hidden sm:block">Community Feedback</p>
              </div>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <div className="hidden lg:flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Powered by</span>
              <a 
                href="https://www.vibespec.build" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                VibeSpec
              </a>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 bg-secondary/50 rounded-lg border">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium truncate max-w-20 sm:max-w-none">{user.username}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAuthClick}
                  disabled={loading}
                  className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive text-xs sm:text-sm px-2 sm:px-3"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleAuthClick}
                disabled={loading}
                className="button-glow text-xs sm:text-sm px-3 sm:px-4"
                size="sm"
              >
                <LogIn className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
} 