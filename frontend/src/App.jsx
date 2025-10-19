import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { TopNav } from "./components/layout/TopNav";
import { Dashboard } from "./components/pages/Dashboard";
import { Classifier } from "./components/pages/Classifier";
import { RecyclingGuide } from "./components/pages/RecyclingGuide";
import { Awareness } from "./components/pages/Awareness";
import { Reports } from "./components/pages/Reports";
import { Settings } from "./components/pages/Settings";
import { HomePage } from "./components/pages/HomePage";
import { RewardsAndCommercial } from "./components/pages/RewardsAndCommercial";

export function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/classifier" element={<Classifier />} />
            <Route path="/recycling-guide" element={<RecyclingGuide />} />
            <Route path="/awareness" element={<Awareness />} />
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
