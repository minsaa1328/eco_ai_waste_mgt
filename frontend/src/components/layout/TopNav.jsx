import React from 'react';
import { SearchIcon, BellIcon, RecycleIcon } from 'lucide-react';
import { SignedIn, UserButton, useUser } from '@clerk/clerk-react';
export const TopNav = () => {
  const { user } = useUser();
  return <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex items-center mr-8">
          <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
            <RecycleIcon size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-800 hidden md:block">
            EcoSmart AI
          </h1>
        </div>
        <div className="relative w-full max-w-md">
          <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100">
          <BellIcon size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-3">
          <SignedIn>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user?.fullName ?? user?.firstName ?? 'User'}</p>
              <p className="text-xs text-gray-500">Eco Enthusiast</p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          {/* When signed out, intentionally show nothing here so dashboard header doesn't display login controls */}
        </div>
      </div>
    </header>;
};