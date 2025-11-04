import React from 'react';
import { UserProfile } from '@clerk/clerk-react';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#510069]/5 via-white to-[#9ab292]/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <UserProfile />
      </div>
    </div>
  );
}