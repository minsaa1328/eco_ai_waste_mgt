import React from 'react';
import { Card } from '../ui/Card.jsx';
import { StatCard } from '../ui/StatCard.jsx';
import { Badge } from '../ui/Badge.jsx';
import { ImageIcon, RecycleIcon, LeafIcon, TrophyIcon, BarChart3Icon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
export const Dashboard = () => {
  // Sample data for charts
  const weeklyData = [{
    name: 'Mon',
    items: 12
  }, {
    name: 'Tue',
    items: 19
  }, {
    name: 'Wed',
    items: 15
  }, {
    name: 'Thu',
    items: 21
  }, {
    name: 'Fri',
    items: 25
  }, {
    name: 'Sat',
    items: 18
  }, {
    name: 'Sun',
    items: 14
  }];
  const categoryData = [{
    name: 'Plastic',
    value: 40
  }, {
    name: 'Paper',
    value: 25
  }, {
    name: 'Organic',
    value: 20
  }, {
    name: 'Metal',
    value: 10
  }, {
    name: 'E-Waste',
    value: 5
  }];
  const COLORS = ['#4ade80', '#60a5fa', '#fcd34d', '#f87171', '#a78bfa'];
  const badges = [{
    name: 'Recycling Rookie',
    icon: <TrophyIcon size={14} />,
    color: 'green'
  }, {
    name: 'Knowledge Seeker',
    icon: <LeafIcon size={14} />,
    color: 'blue'
  }, {
    name: 'Consistent Classifier',
    icon: <ImageIcon size={14} />,
    color: 'yellow'
  }];
  return <div className="space-y-6">
      {/* Banner Image */}
      <div className="relative rounded-xl overflow-hidden h-48 md:h-64">
        <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" alt="Waste Sorting and Recycling" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-800/80 to-transparent flex flex-col justify-center p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Welcome to EcoSmart AI
          </h1>
          <p className="text-white/90 max-w-md">
            Your intelligent companion for waste management education and
            sustainable living.
          </p>
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Items Classified Today" value={42} trend={{
        value: '8%',
        positive: true
      }} icon={<ImageIcon size={20} className="text-green-600" />} />
        <StatCard title="Recycled Items" value="78%" trend={{
        value: '3%',
        positive: true
      }} icon={<RecycleIcon size={20} className="text-green-600" />} />
        <StatCard title="Awareness Tips Viewed" value={15} trend={{
        value: '2%',
        positive: false
      }} icon={<LeafIcon size={20} className="text-green-600" />} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Weekly Classification Activity">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="items" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Waste Categories Breakdown">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Eco Achievements" className="lg:col-span-1">
          <div className="space-y-4">
            {badges.map((badge, index) => <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`h-10 w-10 rounded-full bg-${badge.color}-100 flex items-center justify-center`}>
                  {badge.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">{badge.name}</p>
                  <Badge color={badge.color} className="mt-1">
                    Earned
                  </Badge>
                </div>
              </div>)}
            <button className="w-full mt-2 py-2 text-sm text-green-600 hover:text-green-800 font-medium">
              View all achievements
            </button>
          </div>
        </Card>
        <Card title="Recent Activities" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <ImageIcon size={16} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">Plastic bottle classified</p>
                <p className="text-xs text-gray-500">Today, 10:30 AM</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <RecycleIcon size={16} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">
                  Cardboard box recycling guide viewed
                </p>
                <p className="text-xs text-gray-500">Today, 09:45 AM</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <LeafIcon size={16} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium">
                  Eco tip about water conservation read
                </p>
                <p className="text-xs text-gray-500">Yesterday, 04:20 PM</p>
              </div>
            </div>
            <button className="w-full mt-2 py-2 text-sm text-green-600 hover:text-green-800 font-medium">
              View all activity
            </button>
          </div>
        </Card>
      </div>
      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <ImageIcon size={20} className="text-green-600" />
          </div>
          <h3 className="font-medium text-gray-800">Classify Waste</h3>
          <p className="mt-1 text-xs text-gray-500">
            Identify and sort your waste items
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <RecycleIcon size={20} className="text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-800">Recycling Guide</h3>
          <p className="mt-1 text-xs text-gray-500">
            Learn how to properly recycle
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
            <LeafIcon size={20} className="text-yellow-600" />
          </div>
          <h3 className="font-medium text-gray-800">Eco Tips</h3>
          <p className="mt-1 text-xs text-gray-500">
            Discover sustainable practices
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
            <BarChart3Icon size={20} className="text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-800">View Reports</h3>
          <p className="mt-1 text-xs text-gray-500">
            Track your recycling impact
          </p>
        </div>
      </div>
    </div>;
};