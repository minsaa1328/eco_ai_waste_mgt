import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import {
  TrophyIcon, AwardIcon, RecycleIcon, LeafIcon, UserIcon, StarIcon,
  CheckIcon, XIcon, BriefcaseIcon, BuildingIcon, CreditCardIcon,
  RefreshCwIcon, GiftIcon, PackageIcon, ShoppingCartIcon
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const API_BASE_URL = 'http://localhost:8000';

// Reward Redemption Modal Component
const RewardRedemptionModal = ({ reward, userPoints, onClose, onRedeem }) => {
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (reward.category === 'keytag' || reward.category === 'merchandise') {
      // Validate shipping address for physical items
      if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
        alert('Please fill in all required shipping information');
        return;
      }
    }

    setLoading(true);
    await onRedeem(reward._id, shippingAddress);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Redeem Reward</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XIcon size={24} />
            </button>
          </div>

          {/* Reward Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-4">
              <img
                src={reward.image}
                alt={reward.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-800">{reward.name}</h4>
                <p className="text-sm text-gray-600">{reward.description}</p>
                <div className="flex items-center mt-1">
                  <StarIcon size={16} className="text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{reward.points_required} points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Points Balance */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-800">Your Points Balance:</span>
              <span className="font-semibold text-blue-800">{userPoints} points</span>
            </div>
            {userPoints < reward.points_required && (
              <p className="text-red-600 text-sm mt-1">
                You need {reward.points_required - userPoints} more points to redeem this reward
              </p>
            )}
          </div>

          {/* Shipping Information for Physical Items */}
          {(reward.category === 'keytag' || reward.category === 'merchandise') && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-3">Shipping Information</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress(prev => ({...prev, fullName: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <textarea
                  placeholder="Address *"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress(prev => ({...prev, address: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="2"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City *"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({...prev, city: e.target.value}))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress(prev => ({...prev, postalCode: e.target.value}))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Country"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress(prev => ({...prev, country: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRedeem}
              disabled={userPoints < reward.points_required || loading}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                userPoints < reward.points_required || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {loading ? (
                <RefreshCwIcon size={16} className="animate-spin mx-auto" />
              ) : (
                `Redeem for ${reward.points_required} points`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rewards Store Component
const RewardsStore = ({ userPoints, onRedeem }) => {
  const [rewards, setRewards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const [rewardsResponse, categoriesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/rewards/`),
        fetch(`${API_BASE_URL}/api/rewards/categories`)
      ]);

      if (rewardsResponse.ok) {
        const rewardsData = await rewardsResponse.json();
        setRewards(rewardsData.rewards || []);
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(['all', ...categoriesData.categories]);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRewards = selectedCategory === 'all'
    ? rewards
    : rewards.filter(reward => reward.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <RefreshCwIcon size={24} className="animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? 'All Rewards' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map(reward => (
          <div key={reward._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 overflow-hidden">
              <img
                src={reward.image}
                alt={reward.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{reward.name}</h3>
                <Badge color={reward.category === 'keytag' ? 'green' : 'blue'}>
                  {reward.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{reward.description}</p>

              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <StarIcon size={16} className="text-yellow-500 mr-1" />
                  <span className="font-semibold">{reward.points_required} points</span>
                </div>
                {reward.stock > 0 && (
                  <span className="text-xs text-green-600">{reward.stock} left</span>
                )}
                {reward.stock === 0 && (
                  <span className="text-xs text-red-600">Out of stock</span>
                )}
              </div>

              <button
                onClick={() => onRedeem(reward)}
                disabled={userPoints < reward.points_required || reward.stock === 0}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  userPoints < reward.points_required || reward.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {userPoints < reward.points_required ? 'Need More Points' : 'Redeem Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRewards.length === 0 && (
        <div className="text-center py-12">
          <GiftIcon size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No rewards found in this category</p>
        </div>
      )}
    </div>
  );
};

// Main RewardsAndCommercial Component
export const RewardsAndCommercial = () => {
  const { user, isLoaded } = useUser();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userPoints, setUserPoints] = useState({ current: 0, target: 500 });
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showRewardsStore, setShowRewardsStore] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaderboard/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLeaderboardData(data.leaderboard || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard');
      setLeaderboardData([]);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    if (!user) return;

    try {
      const [pointsResponse, badgesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/leaderboard/user/${user.id}`),
        fetch(`${API_BASE_URL}/api/leaderboard/badges/${user.id}`)
      ]);

      if (!pointsResponse.ok) {
        throw new Error(`User data error: ${pointsResponse.status}`);
      }
      if (!badgesResponse.ok) {
        throw new Error(`Badges error: ${badgesResponse.status}`);
      }

      const pointsData = await pointsResponse.json();
      const badgesData = await badgesResponse.json();

      setUserPoints(prev => ({
        ...prev,
        current: pointsData.points || 0
      }));
      setUserBadges(badgesData.badges || []);
      setError(null);

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
      setUserPoints(prev => ({ ...prev, current: 0 }));
      setUserBadges([]);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setRefreshing(true);
    setError(null);
    await Promise.all([fetchLeaderboard(), fetchUserData()]);
    setRefreshing(false);
  };

  // Handle reward redemption
  const handleRedeemReward = async (rewardId, shippingAddress = null) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/rewards/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reward_id: rewardId,
          shipping_address: shippingAddress
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`🎉 ${result.message}`);
        setSelectedReward(null);
        // Refresh user data to show updated points
        await refreshData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward. Please try again.');
    }
  };

  // Add test points (for development)
  const addTestPoints = async (points = 10) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/points/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points })
      });

      if (response.ok) {
        // Refresh data to show updated points
        await refreshData();
      }
    } catch (error) {
      console.error('Error adding points:', error);
      setError('Failed to add points');
    }
  };

  useEffect(() => {
    if (isLoaded) {
      const loadData = async () => {
        setLoading(true);
        await refreshData();
        setLoading(false);
      };
      loadData();

      // Set up interval to refresh leaderboard every 30 seconds
      const interval = setInterval(fetchLeaderboard, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoaded, user]);

  // Render icon based on badge icon name
  const renderBadgeIcon = (iconName, className = "") => {
    switch (iconName) {
      case 'TrophyIcon':
        return <TrophyIcon size={24} className={className} />;
      case 'RecycleIcon':
        return <RecycleIcon size={24} className={className} />;
      case 'LeafIcon':
        return <LeafIcon size={24} className={className} />;
      case 'AwardIcon':
        return <AwardIcon size={24} className={className} />;
      case 'StarIcon':
        return <StarIcon size={24} className={className} />;
      default:
        return <AwardIcon size={24} className={className} />;
    }
  };

  // Sample pricing plans
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <span className="ml-3 text-gray-600">Loading rewards...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Rewards & Premium</h1>
        <div className="flex gap-2">
          {/* Test button for development */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => addTestPoints(10)}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
            >
              +10 Test Points
            </button>
          )}
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors flex items-center"
          >
            {refreshing ? (
              <RefreshCwIcon size={16} className="animate-spin mr-1" />
            ) : (
              <RefreshCwIcon size={16} className="mr-1" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XIcon size={20} className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Card */}
        <Card title="Eco Leaderboard" className="lg:col-span-1">
          <div className="bg-gradient-to-br from-green-50 to-amber-50 -mt-5 -mx-5 p-5 rounded-t-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">Top Eco Warriors</h3>
              <span className="text-xs text-gray-500">
                {leaderboardData.length} users
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {leaderboardData.map(leaderboardUser => (
                <div
                  key={`${leaderboardUser.rank}-${leaderboardUser.clerk_id}`}
                  className={`flex items-center p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border ${
                    user && leaderboardUser.clerk_id === user.id ? 'border-green-300 bg-green-50' : 'border-transparent'
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    {leaderboardUser.rank === 1 ? (
                      <TrophyIcon size={20} className="text-yellow-500" />
                    ) : leaderboardUser.rank === 2 ? (
                      <TrophyIcon size={20} className="text-gray-400" />
                    ) : leaderboardUser.rank === 3 ? (
                      <TrophyIcon size={20} className="text-amber-700" />
                    ) : (
                      <span className="text-gray-500 font-medium text-sm">
                        {leaderboardUser.rank}
                      </span>
                    )}
                  </div>
                  <div className="h-10 w-10 rounded-full overflow-hidden ml-2 bg-gray-200 flex-shrink-0">
                    <img
                      src={leaderboardUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderboardUser.username)}&background=random`}
                      alt={leaderboardUser.username}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderboardUser.username)}&background=random`;
                      }}
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {leaderboardUser.username}
                      {user && leaderboardUser.clerk_id === user.id && (
                        <span className="ml-1 text-xs text-green-600">(You)</span>
                      )}
                    </p>
                    <div className="flex items-center">
                      <LeafIcon size={14} className="text-green-500 mr-1 flex-shrink-0" />
                      <span className="text-xs text-green-700 truncate">
                        {leaderboardUser.points} points
                      </span>
                    </div>
                  </div>
                  <Badge
                    color={
                      leaderboardUser.rank === 1 ? 'green' :
                      leaderboardUser.rank === 2 ? 'blue' :
                      leaderboardUser.rank === 3 ? 'yellow' : 'gray'
                    }
                    className="flex-shrink-0"
                  >
                    {leaderboardUser.rank === 1 ? 'Gold' :
                     leaderboardUser.rank === 2 ? 'Silver' :
                     leaderboardUser.rank === 3 ? 'Bronze' : `Top ${leaderboardUser.rank}`}
                  </Badge>
                </div>
              ))}
              {leaderboardData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TrophyIcon size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No users on leaderboard yet</p>
                  <p className="text-sm">Be the first to earn points!</p>
                </div>
              )}
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

              {/* User Info */}
              {user && (
                <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {user.firstName?.[0]}{user.lastName?.[0] || user.username?.[0] || 'U'}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username || 'User'
                      }
                    </p>
                    <p className="text-sm text-gray-600">{userPoints.current} total points</p>
                  </div>
                </div>
              )}

              {/* EcoPoints Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">EcoPoints Progress</p>
                  <p className="text-sm text-gray-600">
                    {userPoints.current} / {userPoints.target}
                  </p>
                </div>
                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((userPoints.current / userPoints.target) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {userPoints.current >= userPoints.target ? (
                    "🎉 You've reached your target! Keep going!"
                  ) : (
                    `Earn ${userPoints.target - userPoints.current} more points to reach the next level`
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowRewardsStore(true)}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                >
                  <CreditCardIcon size={18} className="mr-2" />
                  Redeem Your Rewards
                </button>

                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={() => addTestPoints(25)}
                    className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                  >
                    🚀 Quick +25 Points (Test)
                  </button>
                )}
              </div>

              {/* Tip Box */}
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg mt-4">
                <div className="flex items-start">
                  <StarIcon size={20} className="text-amber-500 mt-1 flex-shrink-0" />
                  <p className="ml-2 text-sm text-amber-800">
                    Complete daily eco-challenges to earn more points and unlock exclusive rewards!
                    Classify waste items, take quizzes, and learn about recycling to level up faster.
                  </p>
                </div>
              </div>
            </div>

            {/* Badge Showcase */}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Your Eco Badges
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {userBadges.map(badge => (
                  <div key={badge.id} className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className={`h-16 w-16 rounded-full ${badge.color} flex items-center justify-center shadow-lg relative mb-2`}>
                      <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm"></div>
                      <div className="relative">
                        {renderBadgeIcon(badge.icon, "text-white")}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-center mb-1">
                      {badge.name}
                    </p>
                    <p className="text-xs text-gray-500 text-center leading-tight">
                      {badge.description}
                    </p>
                  </div>
                ))}
                {userBadges.length === 0 && (
                  <div className="col-span-2 md:col-span-3 text-center py-8">
                    <AwardIcon size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium mb-2">No badges yet</p>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto">
                      Start classifying waste items and complete activities to earn your first badge!
                    </p>
                    {userPoints.current > 0 && (
                      <p className="text-xs text-green-600 mt-2">
                        You need {25 - userPoints.current} more points for your first badge
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Badge Progress */}
              {userBadges.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm text-green-800 text-center">
                    🎉 You've earned {userBadges.length} badge{userBadges.length !== 1 ? 's' : ''}!
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Rewards Store Section - Only shown when user clicks "Redeem Your Rewards" */}
      {showRewardsStore && (
        <Card title="Rewards Store">
          <div className="text-center mb-6">
            <GiftIcon size={48} className="mx-auto text-orange-500 mb-3" />
            <h2 className="text-2xl font-bold text-gray-800">Redeem Your Eco Points</h2>
            <p className="text-gray-600 mt-2">
              Exchange your hard-earned points for exclusive eco-friendly rewards
            </p>
            <button
              onClick={() => setShowRewardsStore(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← Back to Dashboard
            </button>
          </div>

          <RewardsStore
            userPoints={userPoints.current}
            onRedeem={setSelectedReward}
          />
        </Card>
      )}

      {/* Redemption Modal */}
      {selectedReward && (
        <RewardRedemptionModal
          reward={selectedReward}
          userPoints={userPoints.current}
          onClose={() => setSelectedReward(null)}
          onRedeem={handleRedeemReward}
        />
      )}

      {/* Pricing & Commercialization Cards */}
      {!showRewardsStore && (
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
            {pricingPlans.map(plan => (
              <div key={plan.name} className={`bg-white rounded-xl shadow-sm border ${plan.popular ? 'border-orange-200 ring-2 ring-orange-500 ring-opacity-50' : 'border-gray-100'} overflow-hidden hover:shadow-md transition-shadow`}>
                {plan.popular && (
                  <div className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wider py-2 text-center">
                    Most Popular
                  </div>
                )}
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
                        {plan.period && (
                          <span className="text-gray-500 text-sm ml-1">
                            / {plan.period}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckIcon size={18} className="text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feature, index) => (
                      <div key={index} className="flex items-center opacity-60">
                        <XIcon size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-500 line-through">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button className={`w-full py-3 ${plan.buttonColor} rounded-lg font-medium transition-colors`}>
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {!showRewardsStore && (
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
      )}
    </div>
  );
};