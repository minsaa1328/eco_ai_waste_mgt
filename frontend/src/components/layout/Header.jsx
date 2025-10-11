import React, { useState } from 'react';
import { RecycleIcon, MenuIcon, XIcon } from 'lucide-react';
export const Header = ({
  setCurrentPage
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
              <RecycleIcon size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">EcoSmart AI</span>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-800 hover:text-green-600 font-medium">
              Home
            </a>
            <a href="#features" className="text-gray-600 hover:text-green-600">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-green-600">
              How It Works
            </a>
            <a href="#awareness" className="text-gray-600 hover:text-green-600">
              Awareness
            </a>
            <a href="#contact" className="text-gray-600 hover:text-green-600">
              Contact Us
            </a>
          </nav>
          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => setCurrentPage('dashboard')} className="px-4 py-2 text-green-600 font-medium hover:text-green-700 transition-colors">
              Login
            </button>
            <button onClick={() => setCurrentPage('dashboard')} className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
              Register
            </button>
          </div>
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <XIcon size={24} className="text-gray-800" /> : <MenuIcon size={24} className="text-gray-800" />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && <div className="md:hidden bg-white border-t border-gray-100 py-4">
          <div className="container mx-auto px-4 space-y-3">
            <a href="#" className="block text-gray-800 font-medium py-2">
              Home
            </a>
            <a href="#features" className="block text-gray-600 py-2">
              Features
            </a>
            <a href="#how-it-works" className="block text-gray-600 py-2">
              How It Works
            </a>
            <a href="#awareness" className="block text-gray-600 py-2">
              Awareness
            </a>
            <a href="#contact" className="block text-gray-600 py-2">
              Contact Us
            </a>
            <div className="pt-4 flex flex-col space-y-3">
              <button onClick={() => setCurrentPage('dashboard')} className="w-full px-4 py-2 text-green-600 font-medium border border-green-600 rounded-lg">
                Login
              </button>
              <button onClick={() => setCurrentPage('dashboard')} className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg">
                Register
              </button>
            </div>
          </div>
        </div>}
    </header>;
};