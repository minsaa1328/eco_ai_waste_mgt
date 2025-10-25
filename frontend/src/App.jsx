import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { Dashboard } from './components/pages/Dashboard';
import { Classifier } from './components/pages/Classifier';
import { RecyclingGuide } from './components/pages/RecyclingGuide';
import { Quiz } from './components/pages/quiz.jsx';
import { Reports } from './components/pages/Reports';
import { Settings } from './components/pages/Settings';
import { HomePage } from './components/pages/HomePage';
import { RewardsAndCommercial } from './components/pages/RewardsAndCommercial';
import { useAuth, SignInButton } from '@clerk/clerk-react';

// Import missing React Router components
import { Routes, Route, Navigate } from 'react-router-dom';

function AuthGuard({ children }) {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return children;

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-center">
        <p className="mb-4">You must sign in to view this page.</p>
        <SignInButton>
          <button className="px-4 py-2 bg-green-600 text-white rounded">
            Sign in
          </button>
        </SignInButton>
      </div>
    </div>
  );
}

export function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/classifier"
              element={
                <AuthGuard>
                  <Classifier />
                </AuthGuard>
              }
            />
            <Route path="/recycling-guide" element={<RecyclingGuide />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/rewards" element={<RewardsAndCommercial />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
