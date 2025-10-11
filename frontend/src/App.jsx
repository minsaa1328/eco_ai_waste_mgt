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
                <RecyclingGuide />
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