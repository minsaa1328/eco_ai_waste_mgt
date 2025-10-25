import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboardIcon,
  ImageIcon,
  RecycleIcon,
  LeafIcon,
  BarChart3Icon,
  SettingsIcon,
  TrophyIcon,
} from "lucide-react";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboardIcon size={20} /> },
    { path: "/classifier", label: "Classifier", icon: <ImageIcon size={20} /> },
    { path: "/recycling-guide", label: "Recycling Guide", icon: <RecycleIcon size={20} /> },
    { path: "/awareness", label: "Quiz", icon: <LeafIcon size={20} /> },
    { path: "/rewards", label: "Rewards", icon: <TrophyIcon size={20} /> },
    { path: "/reports", label: "Reports", icon: <BarChart3Icon size={20} /> },
    { path: "/settings", label: "Settings", icon: <SettingsIcon size={20} /> },
  ];

  return (
    <aside className="w-16 md:w-64 bg-green-800 text-white flex flex-col transition-all duration-300">
      <div className="p-4 flex items-center justify-center md:justify-start">
        <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
          <RecycleIcon size={20} className="text-green-800" />
        </div>
        <h1 className="ml-3 text-xl font-bold hidden md:block">EcoLearn AI</h1>
      </div>

      <nav className="flex-1 pt-6">
        <ul>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 ${
                    active
                      ? "bg-green-700 border-l-4 border-white"
                      : "hover:bg-green-700"
                  }`}
                >
                  <span className="flex items-center justify-center md:justify-start w-full md:w-auto">
                    {item.icon}
                    <span className="ml-4 hidden md:block">{item.label}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 hidden md:block">
        <div className="bg-green-700 rounded-lg p-3 text-sm">
          <p className="font-medium">Eco Tip of the Day</p>
          <p className="mt-1 text-xs text-green-100">
            Rinse plastic containers before recycling to prevent contamination.
          </p>
        </div>
      </div>
    </aside>
  );
};
