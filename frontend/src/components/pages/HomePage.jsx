import React from 'react';
import { Header } from '../layout/Header';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Footer } from '../layout/Footer';
import { ImageIcon, RecycleIcon, LeafIcon, ArrowRightIcon, UsersIcon, BuildingIcon, GlobeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();

  return <div className="min-h-screen flex flex-col bg-white">
      <Header />
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" alt="Eco-friendly city with recycling" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/80 to-green-800/40"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              AI for Smarter Waste Management
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-lg">
              Join the revolution in sustainable living with EcoSmart AI. Learn
              to classify waste, follow recycling guides, and make a positive
              impact on our planet.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/classifier')} className="px-6 py-3 bg-white text-green-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">
                Try Classifier
              </button>
              <SignedIn>
                <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center">
                  Get Started <ArrowRightIcon size={18} className="ml-2" />
                </button>
              </SignedIn>
              <SignedOut>
                <SignInButton>
                  <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center">
                    Get Started <ArrowRightIcon size={18} className="ml-2" />
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Smart Features for Smart Recycling
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered tools make waste management education easy,
              interactive, and effective.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-48 bg-green-100 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                  <ImageIcon size={48} className="text-green-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Waste Category Classifier
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload images of waste items and our AI will instantly
                  classify them into the correct recycling category.
                </p>
                <button onClick={() => navigate('/classifier')} className="text-green-600 font-medium flex items-center hover:text-green-700">
                  Try It Now <ArrowRightIcon size={16} className="ml-2" />
                </button>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-48 bg-blue-100 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                  <RecycleIcon size={48} className="text-blue-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Recycling Guide
                </h3>
                <p className="text-gray-600 mb-4">
                  Get step-by-step instructions on how to properly recycle
                  different types of materials and items.
                </p>
                <button onClick={() => navigate('/recycling-guide')} className="text-blue-600 font-medium flex items-center hover:text-blue-700">
                  View Guides <ArrowRightIcon size={16} className="ml-2" />
                </button>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-48 bg-yellow-100 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                  <LeafIcon size={48} className="text-yellow-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Awareness Agent
                </h3>
                <p className="text-gray-600 mb-4">
                  Learn eco-friendly tips, facts about waste management, and how
                  small changes can make a big difference.
                </p>
                <button onClick={() => navigate('/awareness')} className="text-yellow-600 font-medium flex items-center hover:text-yellow-700">
                  Explore Tips <ArrowRightIcon size={16} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              EcoSmart AI makes waste management education simple and effective
              in just a few steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-bold text-green-600">1</span>
                </div>
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-green-100">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-green-500"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Upload or Describe
              </h3>
              <p className="text-gray-600">
                Upload an image of your waste item or describe it in detail
                using our AI classifier.
              </p>
            </div>
            <div className="text-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-bold text-green-600">2</span>
                </div>
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-green-100">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-green-500"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Get Classification
              </h3>
              <p className="text-gray-600">
                Our AI instantly identifies the waste category and provides
                detailed information.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Follow Recycling Guide
              </h3>
              <p className="text-gray-600">
                Access step-by-step instructions for properly recycling or
                disposing of the item.
              </p>
            </div>
          </div>
          <div className="mt-16 text-center">
            <SignedIn>
              <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                Try It Yourself
              </button>
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                  Try It Yourself
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </section>
      {/* Quiz Section */}
      <section id="awareness" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Environmental Awareness
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn about the impact of waste on our environment and how proper
              recycling can help.
            </p>
          </div>
          <div className="relative px-4 md:px-12">
            {/* Carousel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Poster 1 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="h-64 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1604187351574-c75ca79f5807?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" alt="Plastic pollution in ocean" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Ocean Plastic Crisis
                  </h3>
                  <p className="text-gray-600">
                    By 2050, there could be more plastic than fish in our
                    oceans. Your recycling efforts can help prevent this.
                  </p>
                </div>
              </div>
              {/* Poster 2 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="h-64 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" alt="Waste sorting" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Proper Waste Sorting
                  </h3>
                  <p className="text-gray-600">
                    Sorting your waste correctly can increase recycling
                    efficiency by up to 40% and reduce landfill usage.
                  </p>
                </div>
              </div>
              {/* Poster 3 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="h-64 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1550358864-518f202c02ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" alt="Composting" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Composting Benefits
                  </h3>
                  <p className="text-gray-600">
                    Composting organic waste reduces methane emissions from
                    landfills and creates nutrient-rich soil.
                  </p>
                </div>
              </div>
            </div>
            {/* Navigation dots */}
            <div className="flex justify-center mt-8 space-x-2">
              <button className="w-8 h-2 rounded-full bg-green-600"></button>
              <button className="w-2 h-2 rounded-full bg-green-300"></button>
              <button className="w-2 h-2 rounded-full bg-green-300"></button>
            </div>
            <div className="mt-12 text-center">
              <button onClick={() => navigate('/awareness')} className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                Explore More Eco Tips
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Impact Section */}
      <section className="py-16 md:py-24 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Together with our users, we're making a difference in waste
              management education.
            </p>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 rounded-full bg-green-100 items-center justify-center mb-4">
                <ImageIcon size={32} className="text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">500+</h3>
              <p className="text-gray-600">Items Classified Today</p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-16 w-16 rounded-full bg-blue-100 items-center justify-center mb-4">
                <UsersIcon size={32} className="text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">10k+</h3>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-16 w-16 rounded-full bg-yellow-100 items-center justify-center mb-4">
                <BuildingIcon size={32} className="text-yellow-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">50+</h3>
              <p className="text-gray-600">Partner Organizations</p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-16 w-16 rounded-full bg-purple-100 items-center justify-center mb-4">
                <GlobeIcon size={32} className="text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800">25+</h3>
              <p className="text-gray-600">Countries Reached</p>
            </div>
          </div>
          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <span className="text-green-600 font-bold">JD</span>
                </div>
                <div>
                  <h4 className="font-medium">Jane Doe</h4>
                  <p className="text-sm text-gray-500">
                    Environmental Educator
                  </p>
                </div>
              </div>
              <p className="text-gray-600">
                "EcoSmart AI has transformed how I teach students about
                recycling. The visual classification tool makes learning
                engaging and memorable."
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">MS</span>
                </div>
                <div>
                  <h4 className="font-medium">Mike Smith</h4>
                  <p className="text-sm text-gray-500">Community Leader</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Our neighborhood recycling rates have improved by 30% since we
                started using EcoSmart AI for community education workshops."
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                  <span className="text-yellow-600 font-bold">LK</span>
                </div>
                <div>
                  <h4 className="font-medium">Lisa Kim</h4>
                  <p className="text-sm text-gray-500">
                    Sustainability Director
                  </p>
                </div>
              </div>
              <p className="text-gray-600">
                "The detailed recycling guides have been invaluable for our
                corporate sustainability program. Clear, concise, and
                effective."
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Join thousands of individuals and organizations using EcoSmart AI to
            improve waste management education.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <SignedIn>
              <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-white text-green-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">
                Get Started for Free
              </button>
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="px-6 py-3 bg-white text-green-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">
                  Get Started for Free
                </button>
              </SignInButton>
            </SignedOut>
            <button className="px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
              Schedule a Demo
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16">
          <Footer />
        </div>
      </section>
    </div>;
};

