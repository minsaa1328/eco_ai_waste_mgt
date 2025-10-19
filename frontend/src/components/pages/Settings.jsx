import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card.jsx';
import { BellIcon, GlobeIcon, UserIcon, ShieldIcon, SaveIcon } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, isLoaded } = useUser();

  // Local controlled state for the profile form so we can prefill with the signed-in user's info
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: ''
  });

  useEffect(() => {
    if (!isLoaded || !user) return;
    setProfile({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      // Clerk exposes primaryEmailAddress on the user object in many setups
      email: user.primaryEmailAddress?.emailAddress || (user.emailAddresses?.[0]?.emailAddress) || '',
      // Keep bio in publicMetadata if present
      bio: (user.publicMetadata && user.publicMetadata.bio) || ''
    });
  }, [isLoaded, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    // Try to update the Clerk user if supported. If not available, just log the values.
    try {
      if (user && typeof user.update === 'function') {
        await user.update({
          firstName: profile.firstName,
          lastName: profile.lastName,
          publicMetadata: { ...(user.publicMetadata || {}), bio: profile.bio }
        });
        // Optionally show a toast or confirmation here — omitted to keep this minimal
        return;
      }
      console.log('Save profile (no user.update available):', profile);
    } catch (err) {
      console.error('Failed to update user profile', err);
    }
  };
  const tabs = [{
    id: 'profile',
    label: 'Profile',
    icon: <UserIcon size={18} />
  }, {
    id: 'notifications',
    label: 'Notifications',
    icon: <BellIcon size={18} />
  }, {
    id: 'preferences',
    label: 'Preferences',
    icon: <GlobeIcon size={18} />
  }, {
    id: 'security',
    label: 'Security',
    icon: <ShieldIcon size={18} />
  }];
  return <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 p-0">
          <nav className="p-2">
            {tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center px-4 py-3 rounded-lg text-left ${activeTab === tab.id ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'}`}>
                <span className="mr-3">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>)}
          </nav>
        </Card>
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && <Card title="Profile Information">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                      <UserIcon size={40} className="text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input name="firstName" type="text" value={profile.firstName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input name="lastName" type="text" value={profile.lastName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      {/* Email updates generally require a verification flow; show as read-only here */}
                      <input name="email" type="email" value={profile.email} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea name="bio" rows={4} value={profile.bio} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"></textarea>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSaveProfile} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <SaveIcon size={18} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </Card>}
          {activeTab === 'notifications' && <Card title="Notification Settings">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">
                    Email Notifications
                  </h3>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">
                        Weekly Summary
                      </p>
                      <p className="text-sm text-gray-500">
                        Receive a weekly summary of your recycling activity
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">New Eco Tips</p>
                      <p className="text-sm text-gray-500">
                        Get notified when new eco tips are available
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">
                        Achievement Notifications
                      </p>
                      <p className="text-sm text-gray-500">
                        Get notified when you earn a new achievement
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">
                    App Notifications
                  </h3>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">
                        Daily Reminders
                      </p>
                      <p className="text-sm text-gray-500">
                        Get daily reminders to classify waste items
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">Local Events</p>
                      <p className="text-sm text-gray-500">
                        Get notified about local recycling events
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <SaveIcon size={18} className="mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </Card>}
          {activeTab === 'preferences' && <Card title="System Preferences">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">
                    Display Settings
                  </h3>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">Dark Mode</p>
                      <p className="text-sm text-gray-500">
                        Switch between light and dark theme
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">Language</p>
                      <p className="text-sm text-gray-500 mb-2">
                        Select your preferred language
                      </p>
                    </div>
                    <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">
                    AI Assistant Settings
                  </h3>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">
                        Voice Feedback
                      </p>
                      <p className="text-sm text-gray-500">
                        Enable voice responses from the AI assistant
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <div className="py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">
                        AI Response Detail Level
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Select how detailed you want the AI responses to be
                      </p>
                    </div>
                    <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                      <option value="basic">Basic - Quick answers</option>
                      <option value="standard" selected>
                        Standard - Balanced detail
                      </option>
                      <option value="detailed">
                        Detailed - In-depth information
                      </option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <SaveIcon size={18} className="mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </Card>}
          {activeTab === 'security' && <Card title="Security Settings">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">Password</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input type="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input type="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input type="password" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">
                    Two-Factor Authentication
                  </h3>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">Enable 2FA</p>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800">Data Privacy</h3>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">
                        Data Collection
                      </p>
                      <p className="text-sm text-gray-500">
                        Allow anonymous data collection to improve the app
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <SaveIcon size={18} className="mr-2" />
                    Update Security Settings
                  </button>
                </div>
              </div>
            </Card>}
        </div>
      </div>
    </div>;
};