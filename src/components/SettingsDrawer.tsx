import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, User, FileText, Link as LinkIcon, AlertCircle, Check, Briefcase } from 'lucide-react';
import { UserStats } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserStats;
  onUpdateUser: (updatedData: Partial<UserStats>) => Promise<void>;
}

const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Willow', 'Scooter', 'Bandit', 'Buster', 'Coco', 'Lola', 'Misty', 'Shadow',
  'Simba', 'Tigger', 'Bella', 'Charlie', 'Daisy', 'Ginger', 'Jack', 'Jasper', 'Lily', 'Lucky',
  'Max', 'Milo', 'Molly', 'Oliver', 'Oscar', 'Pepper', 'Rocky', 'Rosie', 'Ruby', 'Sam',
  'Sasha', 'Smokey', 'Sophie'
];

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');
  const [name, setName] = useState(user.name);
  const [description, setDescription] = useState(user.description || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarSeed || user.name);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Upgrade Request State
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [reason, setReason] = useState('');
  const [telegram, setTelegram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState('');

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await onUpdateUser({
        name,
        description,
        avatarSeed: selectedAvatar
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingUpgrade(true);
    setUpgradeSuccess('');
    
    try {
      const response = await fetch('/api/user/upgrade-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          companyName,
          businessType,
          reason,
          telegram,
          whatsapp
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setUpgradeSuccess('Request sent successfully! Please wait for review.');
        setCompanyName('');
        setBusinessType('');
        setReason('');
        setTelegram('');
        setWhatsapp('');
      } else {
        alert(data.message || 'Error sending request.');
      }
    } catch (err) {
      alert('Error connecting to the server.');
    } finally {
      setIsSubmittingUpgrade(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              <div className="flex gap-4 mb-8 border-b border-slate-100">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-3 text-sm font-bold transition-colors relative ${
                    activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Profile
                  {activeTab === 'profile' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`pb-3 text-sm font-bold transition-colors relative ${
                    activeTab === 'account' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Account
                  {activeTab === 'account' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              </div>

              {activeTab === 'profile' && (
                <div className="space-y-8">
                  {/* Avatar Selection */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-4">Avatar</label>
                    <div className="flex justify-center mb-6">
                      <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-50 shadow-lg">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedAvatar}`} 
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="text-white" size={24} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
                      {AVATAR_SEEDS.map((seed) => (
                        <button
                          key={seed}
                          onClick={() => setSelectedAvatar(seed)}
                          className={`p-1 rounded-lg transition-all ${
                            selectedAvatar === seed ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-slate-200'
                          }`}
                        >
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} 
                            alt={seed}
                            className="w-full h-full rounded-md"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name Change */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Can be changed every 7 days
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">About Me</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="Tell us a bit about yourself..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4">
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
                        <Check size={16} />
                        {success}
                      </div>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Linked Accounts</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                            G
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">Google</p>
                            <p className="text-xs text-slate-400">{user.googleId ? 'Connected' : 'Not connected'}</p>
                          </div>
                        </div>
                        <button 
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                            user.googleId 
                              ? 'bg-slate-100 text-slate-400 cursor-default' 
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                          disabled={!!user.googleId}
                        >
                          {user.googleId ? 'Linked' : 'Connect'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                            D
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">Discord</p>
                            <p className="text-xs text-slate-400">{user.discordId ? 'Connected' : 'Not connected'}</p>
                          </div>
                        </div>
                        <button 
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                            user.discordId 
                              ? 'bg-slate-100 text-slate-400 cursor-default' 
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                          disabled={!!user.discordId}
                        >
                          {user.discordId ? 'Linked' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Briefcase size={18} className="text-blue-600" />
                      Upgrade to Company
                    </h3>
                    
                    <p className="text-sm text-slate-500 mb-4">
                      Want to create campaigns and receive feedback? Request an account upgrade.
                    </p>

                    {upgradeSuccess && (
                      <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
                        <Check size={16} />
                        {upgradeSuccess}
                      </div>
                    )}

                    <form onSubmit={handleUpgradeRequest} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Type</label>
                        <input
                          type="text"
                          value={businessType}
                          onChange={e => setBusinessType(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason</label>
                        <textarea
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telegram</label>
                          <input
                            type="text"
                            value={telegram}
                            onChange={e => setTelegram(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="@username"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp</label>
                          <input
                            type="text"
                            value={whatsapp}
                            onChange={e => setWhatsapp(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingUpgrade}
                        className="w-full py-2 bg-slate-800 text-white font-bold rounded-lg text-sm hover:bg-slate-900 transition-colors disabled:opacity-50"
                      >
                        {isSubmittingUpgrade ? 'Submitting...' : 'Request Upgrade'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
