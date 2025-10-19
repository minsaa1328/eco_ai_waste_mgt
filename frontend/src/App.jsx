import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { Dashboard } from './components/pages/Dashboard';
import { Classifier } from './components/pages/Classifier';
import { RecyclingGuide } from './components/pages/RecyclingGuide';
import { Awareness } from './components/pages/Awareness';
import { Reports } from './components/pages/Reports';
import { Settings } from './components/pages/Settings';
import { HomePage } from './components/pages/HomePage';
import { RewardsAndCommercial } from './components/pages/RewardsAndCommercial';
import { useAuth, SignInButton } from '@clerk/clerk-react';

function AuthGuard({ children }) {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return children;
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-center">
        <p className="mb-4">You must sign in to view this page.</p>
        <SignInButton>
          <button className="px-4 py-2 bg-green-600 text-white rounded">Sign in</button>
        </SignInButton>
      </div>
    </div>
  );
}

export function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return <div className="flex h-screen bg-gray-50">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopNav />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <Dashboard />
              </main>
            </div>
          </div>;
      case 'classifier':
        return <div className="flex h-screen bg-gray-50">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopNav />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <Classifier />
              </main>
            </div>
          </div>;
      case 'recycling-guide':
        return <div className="flex h-screen bg-gray-50">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopNav />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <AuthGuard>
                  <RecyclingGuide />
                </AuthGuard>
              </main>
            </div>
          </div>;
      case 'awareness':
        return <div className="flex h-screen bg-gray-50">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopNav />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <Awareness />
              </main>
            </div>
          </div>;
      case 'rewards':
        return <div className="flex h-screen bg-gray-50">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopNav />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <RewardsAndCommercial />
              </main>
            </div>
          </div>;
      case 'reports':
        return <div className="flex h-screen bg-gray-50">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopNav />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <Reports />
              </main>
            </div>
          </div>;
      case 'settings':
        return <div className="flex h-screen bg-gray-50">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <div className="flex flex-col flex-1 overflow-hidden">
              <TopNav />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <Settings />
              </main>
            </div>
          </div>;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };
  return renderPage();
}