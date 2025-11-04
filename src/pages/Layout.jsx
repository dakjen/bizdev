import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#510069]/5 via-white to-[#9ab292]/10">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              to={createPageUrl('MyJourneys')} 
              className="flex items-center gap-2 text-xl font-bold text-[#510069] hover:text-[#510069]/80 transition-colors"
            >
              <Rocket className="w-6 h-6" />
                              Where2Start: Journey            </Link>

            <div className="flex items-center gap-4">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button>Sign In</Button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {children}
      </main>
    </div>
  );
}