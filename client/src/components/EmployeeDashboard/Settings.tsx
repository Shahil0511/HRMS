import React, { useState } from 'react';

interface EmployeeSettingsData {
    name: string;
    email: string;
    department: string;
    notifications: boolean;
    darkMode: boolean;
}

const EmployeeSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
    const [formData, setFormData] = useState<EmployeeSettingsData>({
        name: 'Alex Johnson',
        email: 'alex.johnson@company.com',
        department: 'Engineering',
        notifications: true,
        darkMode: false
    });
    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        setIsEditing(false);
        // Here you would typically send data to your backend
        console.log('Settings saved:', formData);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-l from-indigo-900 via-blue-900 to-gray-900 p-6 flex justify-center items-center">
            <div className="w-full max-w-md backdrop-blur-sm bg-white/10 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                {/* Header */}
                <div className="p-6 bg-white/5 border-b border-white/10">
                    <h1 className="text-2xl font-bold text-white">Employee Settings</h1>
                    <p className="text-white/70">Manage your account preferences</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'profile' ? 'text-white border-b-2 border-blue-400' : 'text-white/60 hover:text-white'}`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'security' ? 'text-white border-b-2 border-blue-400' : 'text-white/60 hover:text-white'}`}
                    >
                        Security
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'preferences' ? 'text-white border-b-2 border-blue-400' : 'text-white/60 hover:text-white'}`}
                    >
                        Preferences
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-4">
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-indigo-500/30 flex items-center justify-center text-2xl text-white">
                                        {formData.name.charAt(0)}
                                    </div>
                                    {isEditing && (
                                        <button className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-white/5 rounded-md text-white">{formData.name}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-white/5 rounded-md text-white">{formData.email}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-1">Department</label>
                                {isEditing ? (
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    >
                                        <option value="Engineering">Engineering</option>
                                        <option value="Design">Design</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="HR">Human Resources</option>
                                    </select>
                                ) : (
                                    <div className="px-3 py-2 bg-white/5 rounded-md text-white">{formData.department}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">Dark Mode</h3>
                                    <p className="text-white/60 text-sm">Switch between light and dark theme</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="darkMode"
                                        checked={formData.darkMode}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">Notifications</h3>
                                    <p className="text-white/60 text-sm">Enable or disable notifications</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="notifications"
                                        checked={formData.notifications}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <h3 className="text-white font-medium mb-2">Password</h3>
                                <p className="text-white/60 text-sm mb-3">Last changed 3 months ago</p>
                                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                    Change Password
                                </button>
                            </div>

                            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                <h3 className="text-white font-medium mb-2">Two-Factor Authentication</h3>
                                <p className="text-white/60 text-sm mb-3">Add an extra layer of security</p>
                                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                    Enable 2FA
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        {isEditing ? (
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                            >
                                Save Changes
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors border border-white/20"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeSettings;