import React from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { TrophyIcon, AwardIcon, RecycleIcon, LeafIcon, UserIcon, StarIcon, CheckIcon, XIcon, BriefcaseIcon, BuildingIcon, CreditCardIcon } from 'lucide-react';
export const RewardsAndCommercial = () => {
  // Sample leaderboard data
  const leaderboardData = [{
    rank: 1,
    username: 'EcoWarrior',
    points: 1250,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  }, {
    rank: 2,
    username: 'GreenThumb',
    points: 980,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  }, {
    rank: 3,
    username: 'RecycleKing',
    points: 845,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  }, {
    rank: 4,
    username: 'EarthSaver',
    points: 790,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  }, {
    rank: 5,
    username: 'GreenPlanet',
    points: 720,
    avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  }];
  // User's current eco points
  const userPoints = {
    current: 320,
    target: 500
  };
  // User's earned badges
  const userBadges = [{
    id: 'eco-hero',
    name: 'Eco Hero',
    description: 'Maintained a 7-day streak of eco-friendly activities',
    icon: <TrophyIcon size={24} className="text-yellow-600" />,
    color: 'bg-gradient-to-br from-yellow-300 to-yellow-500'
  }, {
    id: 'recycler-pro',
    name: 'Recycler Pro',
    description: 'Classified over 100 waste items correctly',
    icon: <RecycleIcon size={24} className="text-blue-600" />,
    color: 'bg-gradient-to-br from-blue-300 to-blue-500'
  }, {
    id: 'plastic-buster',
    name: 'Plastic Buster',
    description: 'Completed 5 weekly plastic reduction challenges',
    icon: <LeafIcon size={24} className="text-green-600" />,
    color: 'bg-gradient-to-br from-green-300 to-green-500'
  }];
  // Pricing plans
  const pricingPlans = [{
    name: 'Free',
    price: 'Free',
    description: 'Basic features for eco-conscious individuals',
    icon: <LeafIcon size={28} className="text-green-500" />,
    features: ['Waste classification', 'Environmental awareness content', 'Basic eco quiz access', 'Community forums'],
    notIncluded: ['Leaderboard participation', 'Advanced analytics', 'Reward redemption', 'Premium content'],
    buttonText: 'Current Plan',
    buttonColor: 'bg-gray-200 text-gray-700',
    popular: false
  }, {
    name: 'Pro',
    price: '₨ 1,500',
    period: 'month',
    description: 'Advanced features for dedicated eco-enthusiasts',
    icon: <BriefcaseIcon size={28} className="text-blue-500" />,
    features: ['All Free features', 'Leaderboard participation', 'Personalized eco analytics', 'Reward redemption', 'Premium educational content'],
    notIncluded: ['Custom branding', 'API access'],
    buttonText: 'Upgrade Now',
    buttonColor: 'bg-orange-500 hover:bg-orange-600 text-white',
    popular: true
  }, {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Complete solution for organizations and institutions',
    icon: <BuildingIcon size={28} className="text-purple-500" />,
    features: ['All Pro features', 'Custom branding', 'API access', 'Dedicated support', 'Bulk user management', 'Custom analytics and reporting'],
    notIncluded: [],
    buttonText: 'Contact Sales',
    buttonColor: 'bg-gray-800 hover:bg-gray-700 text-white',
    popular: false
  }];
  return <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Rewards & Premium</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Card */}
        <Card title="Eco Leaderboard" className="lg:col-span-1">
          <div className="bg-gradient-to-br from-green-50 to-amber-50 -mt-5 -mx-5 p-5 rounded-t-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">Top Eco Warriors</h3>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {leaderboardData.map(user => <div key={user.rank} className="flex items-center p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {user.rank === 1 ? <TrophyIcon size={20} className="text-yellow-500" /> : user.rank === 2 ? <TrophyIcon size={20} className="text-gray-400" /> : user.rank === 3 ? <TrophyIcon size={20} className="text-amber-700" /> : <span className="text-gray-500 font-medium">
                        {user.rank}
                      </span>}
                  </div>
                  <div className="h-10 w-10 rounded-full overflow-hidden ml-2">
                    <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{user.username}</p>
                    <div className="flex items-center">
                      <LeafIcon size={14} className="text-green-500 mr-1" />
                      <span className="text-xs text-green-700">
                        {user.points} points
                      </span>
                    </div>
                  </div>
                  <Badge color={user.rank === 1 ? 'green' : user.rank === 2 ? 'blue' : user.rank === 3 ? 'yellow' : 'gray'}>
                    {user.rank === 1 ? 'Gold' : user.rank === 2 ? 'Silver' : user.rank === 3 ? 'Bronze' : 'Top 5'}
                  </Badge>
                </div>)}
            </div>
          </div>
        </Card>
        {/* User Progress and Badges */}
        <Card className="lg:col-span-2">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Your EcoProgress
              </h3>
              {/* EcoPoints Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">EcoPoints</p>
                  <p className="text-sm text-gray-600">
                    {userPoints.current} / {userPoints.target}
                  </p>
                </div>
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{
                  width: `${userPoints.current / userPoints.target * 100}%`
                }}></div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Earn {userPoints.target - userPoints.current} more points to
                  reach the next level
                </p>
              </div>
              {/* Redeem Rewards Button */}
              <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors mb-4 flex items-center justify-center">
                <CreditCardIcon size={18} className="mr-2" />
                Redeem Your Rewards
              </button>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="flex items-start">
                  <StarIcon size={20} className="text-amber-500 mt-1 flex-shrink-0" />
                  <p className="ml-2 text-sm text-amber-800">
                    Complete daily eco-challenges to earn more points and unlock
                    exclusive rewards!
                  </p>
                </div>
              </div>
            </div>
            {/* Badge Showcase */}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Your Eco Badges
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {userBadges.map(badge => <div key={badge.id} className="flex flex-col items-center">
                    <div className={`h-16 w-16 rounded-full ${badge.color} flex items-center justify-center shadow-lg relative`}>
                      <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm"></div>
                      <div className="relative">{badge.icon}</div>
                      <div className="absolute inset-0 rounded-full animate-pulse bg-white/10 backdrop-blur-sm"></div>
                    </div>
                    <p className="mt-2 text-xs font-medium text-center">
                      {badge.name}
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-1 hidden md:block">
                      {badge.description}
                    </p>
                  </div>)}
              </div>
            </div>
          </div>
        </Card>
      </div>
      {/* Pricing & Commercialization Cards */}
      <div className="mt-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Upgrade Your Eco Journey
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Choose the plan that fits your sustainability goals and get access
            to premium features
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map(plan => <div key={plan.name} className={`bg-white rounded-xl shadow-sm border ${plan.popular ? 'border-orange-200 ring-2 ring-orange-500 ring-opacity-50' : 'border-gray-100'} overflow-hidden`}>
              {plan.popular && <div className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wider py-1 text-center">
                  Most Popular
                </div>}
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      {plan.period && <span className="text-gray-500 text-sm ml-1">
                          / {plan.period}
                        </span>}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                <div className="space-y-3 mb-6">
                  {plan.features.map(feature => <div key={feature} className="flex items-center">
                      <CheckIcon size={18} className="text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>)}
                  {plan.notIncluded.map(feature => <div key={feature} className="flex items-center opacity-60">
                      <XIcon size={18} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </div>)}
                </div>
                <button className={`w-full py-2 ${plan.buttonColor} rounded-lg font-medium transition-colors`}>
                  {plan.buttonText}
                </button>
              </div>
            </div>)}
        </div>
      </div>
      {/* FAQ Section */}
      <div className="bg-gradient-to-br from-green-50 to-amber-50 rounded-xl p-6 mt-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            Frequently Asked Questions
          </h3>
          <p className="text-gray-600 mt-1">
            Learn more about our premium features and rewards
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">
              How do I earn EcoPoints?
            </h4>
            <p className="text-gray-600 text-sm">
              You can earn points by classifying waste items, completing daily
              challenges, reading educational content, and participating in
              community activities.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">
              What can I redeem with my points?
            </h4>
            <p className="text-gray-600 text-sm">
              Points can be redeemed for eco-friendly products, discount codes
              from our partners, premium content access, and exclusive badges.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">
              Can I upgrade or downgrade my plan?
            </h4>
            <p className="text-gray-600 text-sm">
              Yes, you can change your plan at any time. Your benefits will be
              adjusted at the start of your next billing cycle.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">
              How do I earn badges?
            </h4>
            <p className="text-gray-600 text-sm">
              Badges are awarded for specific achievements like maintaining
              streaks, reaching classification milestones, and completing
              special challenges.
            </p>
          </div>
        </div>
      </div>
    </div>;
};