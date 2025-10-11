import React, { useState } from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { ChevronLeftIcon, ChevronRightIcon, BookmarkIcon, ShareIcon, ThumbsUpIcon } from 'lucide-react';
export const Awareness = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const ecoTips = [{
    title: 'Reduce Single-Use Plastics',
    content: 'Replace plastic water bottles with a reusable one. A single person using a reusable water bottle can save an average of 156 plastic bottles annually.',
    image: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    category: 'Daily Habits'
  }, {
    title: 'Composting Basics',
    content: 'Composting can divert up to 30% of household waste away from the garbage can. Start with fruit and vegetable scraps, coffee grounds, and yard trimmings.',
    image: 'https://images.unsplash.com/photo-1591634616938-1dde473609a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    category: 'Home Practices'
  }, {
    title: 'E-Waste Management',
    content: 'Only 17% of e-waste is properly recycled globally. Donate working electronics or find certified e-waste recyclers for broken devices.',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    category: 'Electronics'
  }, {
    title: 'Plastic Pollution in Oceans',
    content: 'About 8 million metric tons of plastic enter our oceans every year. This plastic can harm marine life and enter our food chain.',
    image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'Environmental Impact'
  }, {
    title: 'The Lifecycle of Waste',
    content: 'Understanding how waste moves from creation to disposal helps us make better decisions about what we buy and how we discard it.',
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'Education'
  }];
  const facts = [{
    fact: 'Americans throw away enough plastic bottles each year to circle the Earth four times.',
    source: 'Earth Day Network',
    category: 'Plastic Waste'
  }, {
    fact: 'The average person generates over 4 pounds of trash every day.',
    source: 'EPA',
    category: 'General Waste'
  }, {
    fact: 'Recycling one aluminum can saves enough energy to run a TV for three hours.',
    source: 'Environmental Protection Agency',
    category: 'Recycling Impact'
  }, {
    fact: 'About 8 million metric tons of plastic enter our oceans every year.',
    source: 'Science Magazine',
    category: 'Ocean Pollution'
  }, {
    fact: 'Plastic takes approximately 450 years to decompose in the environment.',
    source: 'National Geographic',
    category: 'Environmental Impact'
  }, {
    fact: 'Glass bottles can take up to 1 million years to decompose naturally.',
    source: 'National Oceanic and Atmospheric Administration',
    category: 'Environmental Impact'
  }];
  const nextSlide = () => {
    setCurrentSlide(prev => prev === ecoTips.length - 1 ? 0 : prev + 1);
  };
  const prevSlide = () => {
    setCurrentSlide(prev => prev === 0 ? ecoTips.length - 1 : prev - 1);
  };
  return <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Environmental Awareness
      </h1>
      {/* Featured Infographic */}
      <Card>
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <h2 className="text-lg font-bold text-green-800 mb-3">
            Waste Decomposition Timeline
          </h2>
          <div className="relative">
            <div className="h-16 bg-gradient-to-r from-green-100 to-red-100 rounded-lg relative">
              <div className="absolute top-0 left-0 h-full w-full flex items-center justify-between px-4">
                <div className="text-center">
                  <div className="h-3 w-3 rounded-full bg-green-600 mx-auto"></div>
                  <p className="text-xs font-medium mt-1">Paper</p>
                  <p className="text-xs text-gray-600">2-6 weeks</p>
                </div>
                <div className="text-center">
                  <div className="h-3 w-3 rounded-full bg-yellow-600 mx-auto"></div>
                  <p className="text-xs font-medium mt-1">Aluminum</p>
                  <p className="text-xs text-gray-600">200 years</p>
                </div>
                <div className="text-center">
                  <div className="h-3 w-3 rounded-full bg-orange-600 mx-auto"></div>
                  <p className="text-xs font-medium mt-1">Plastic</p>
                  <p className="text-xs text-gray-600">450 years</p>
                </div>
                <div className="text-center">
                  <div className="h-3 w-3 rounded-full bg-red-600 mx-auto"></div>
                  <p className="text-xs font-medium mt-1">Glass</p>
                  <p className="text-xs text-gray-600">1M+ years</p>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-green-700">
            Understanding how long different materials take to decompose helps
            us make better choices about the products we use and how we dispose
            of them.
          </p>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="relative">
              <div className="relative h-64 md:h-80 overflow-hidden rounded-lg">
                <img src={ecoTips[currentSlide].image} alt={ecoTips[currentSlide].title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <Badge color="green" className="mb-2 w-fit">
                    {ecoTips[currentSlide].category}
                  </Badge>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {ecoTips[currentSlide].title}
                  </h3>
                  <p className="mt-2 text-white/90">
                    {ecoTips[currentSlide].content}
                  </p>
                </div>
              </div>
              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-colors">
                <ChevronLeftIcon size={24} className="text-white" />
              </button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-colors">
                <ChevronRightIcon size={24} className="text-white" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {ecoTips.map((_, index) => <button key={index} onClick={() => setCurrentSlide(index)} className={`h-2 rounded-full transition-all ${currentSlide === index ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}></button>)}
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <div className="flex space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <BookmarkIcon size={20} className="text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <ShareIcon size={20} className="text-gray-600" />
                </button>
              </div>
              <button className="flex items-center space-x-1 text-green-600">
                <ThumbsUpIcon size={18} />
                <span>Helpful</span>
              </button>
            </div>
          </Card>
        </div>
        <div>
          <Card title="Did You Know?">
            <div className="space-y-4">
              {facts.map((item, index) => <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800">{item.fact}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge color="blue" className="text-xs">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Source: {item.source}
                    </span>
                  </div>
                </div>)}
              <button className="w-full py-2 text-sm text-green-600 hover:text-green-800 font-medium">
                View more facts
              </button>
            </div>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 rounded-full bg-blue-100 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-blue-800">
              Energy Conservation
            </h3>
            <p className="mt-2 text-sm text-blue-600">
              Simple ways to reduce energy consumption in your daily life.
            </p>
            <button className="mt-4 text-sm text-blue-700 font-medium">
              Learn more
            </button>
          </div>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 rounded-full bg-green-100 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-green-800">
              Sustainable Living
            </h3>
            <p className="mt-2 text-sm text-green-600">
              Practical tips for a more sustainable lifestyle at home.
            </p>
            <button className="mt-4 text-sm text-green-700 font-medium">
              Learn more
            </button>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-yellow-100">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 rounded-full bg-yellow-100 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-yellow-800">
              Waste Reduction
            </h3>
            <p className="mt-2 text-sm text-yellow-600">
              Strategies to minimize waste generation in your household.
            </p>
            <button className="mt-4 text-sm text-yellow-700 font-medium">
              Learn more
            </button>
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 rounded-full bg-purple-100 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-purple-800">
              Community Action
            </h3>
            <p className="mt-2 text-sm text-purple-600">
              Ways to get involved in environmental initiatives locally.
            </p>
            <button className="mt-4 text-sm text-purple-700 font-medium">
              Learn more
            </button>
          </div>
        </Card>
      </div>
    </div>;
};