
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, updatePassword, updateEmail } from 'firebase/auth';

const ProfileSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Profile State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSecuritySaving, setIsSecuritySaving] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    if (currentUser) {
      const names = (currentUser.displayName || '').split(' ');
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setPhotoURL(currentUser.photoURL || '');
    }
  }, [currentUser]);

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    setIsProfileSaving(true);
    setProfileMsg(null);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await updateProfile(currentUser, {
        displayName: fullName,
        photoURL: photoURL
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error: any) {
      setProfileMsg({ type: 'error', text: error.message });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentUser) return;
    if (newPassword !== confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
        setSecurityMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
        return;
    }
    
    setIsSecuritySaving(true);
    setSecurityMsg(null);
    try {
      // Note: updatePassword requires recent login. In a real app, you might need to re-authenticate the user first.
      await updatePassword(currentUser, newPassword);
      setSecurityMsg({ type: 'success', text: 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error: any) {
       if (error.code === 'auth/requires-recent-login') {
           setSecurityMsg({ type: 'error', text: 'Please log out and log back in to change your password.' });
       } else {
           setSecurityMsg({ type: 'error', text: error.message });
       }
    } finally {
      setIsSecuritySaving(false);
    }
  };

  const scrollToSection = (id: string) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-black dark:text-white min-h-full flex flex-col flex-1">
      <div className="flex flex-1 w-full max-w-7xl mx-auto">
        {/* SideNavBar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4 h-[calc(100vh-80px)] sticky top-[80px]">
          <div className="flex flex-col gap-4 flex-grow">
            <div className="flex items-center gap-3 p-2">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-black/10 dark:border-white/10 flex items-center justify-center bg-primary/10 text-primary font-bold">
                  {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                      (currentUser?.displayName || 'U').charAt(0).toUpperCase()
                  )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <h1 className="text-sm font-bold leading-normal truncate">{currentUser?.displayName || 'User'}</h1>
                <p className="text-black/60 dark:text-white/60 text-xs font-normal leading-normal truncate">{currentUser?.email}</p>
              </div>
            </div>
            <nav className="flex flex-col gap-2 mt-4">
              <button onClick={() => scrollToSection('profile')} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary text-left">
                <span className="material-symbols-outlined text-xl">person</span>
                <p className="text-sm font-semibold leading-normal">Profile</p>
              </button>
              <button onClick={() => scrollToSection('security')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70 text-left">
                <span className="material-symbols-outlined text-xl">lock</span>
                <p className="text-sm font-medium leading-normal">Security</p>
              </button>
              <button onClick={() => scrollToSection('notifications')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70 text-left">
                <span className="material-symbols-outlined text-xl">notifications</span>
                <p className="text-sm font-medium leading-normal">Notifications</p>
              </button>
              <button onClick={() => scrollToSection('subscription')} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70 text-left">
                <span className="material-symbols-outlined text-xl">credit_card</span>
                <p className="text-sm font-medium leading-normal">Subscription</p>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 md:p-10 overflow-y-auto">
          <div className="max-w-4xl mx-auto pb-20">
            {/* Page Heading */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight">Profile Settings</h1>
              <p className="mt-1 text-black/60 dark:text-white/60">Manage your personal information and account settings.</p>
            </header>

            {/* Profile Section */}
            <section className="space-y-6 scroll-mt-28" id="profile">
              <div className="p-6 bg-white dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                {/* Profile Header */}
                <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center pb-6 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 border-2 border-white dark:border-white/10 shadow-sm flex items-center justify-center bg-primary/10 text-primary text-3xl font-black">
                            {photoURL ? (
                                <img src={photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                (firstName || 'U').charAt(0).toUpperCase()
                            )}
                        </div>
                        <button className="absolute bottom-0 right-0 flex items-center justify-center size-8 bg-white dark:bg-black rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 shadow-sm text-black dark:text-white">
                            <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-xl font-bold leading-tight">{currentUser?.displayName || 'User'}</p>
                      <p className="text-black/60 dark:text-white/60 text-sm font-normal leading-normal">{currentUser?.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                        const url = prompt("Enter new profile picture URL:", photoURL);
                        if(url !== null) setPhotoURL(url);
                    }}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-black/5 dark:bg-white/10 text-black dark:text-white text-sm font-semibold leading-normal w-full sm:w-auto hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                  >
                    <span className="truncate">Update Picture URL</span>
                  </button>
                </div>

                {/* Profile Form */}
                <div className="pt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <label className="flex flex-col">
                    <p className="text-sm font-medium leading-normal pb-2">First Name</p>
                    <input 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-black/10 dark:border-white/10 bg-background-light dark:bg-black/20 h-11 placeholder:text-black/40 dark:placeholder:text-white/40 px-3 text-sm font-normal leading-normal" 
                    />
                  </label>
                  <label className="flex flex-col">
                    <p className="text-sm font-medium leading-normal pb-2">Last Name</p>
                    <input 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-black/10 dark:border-white/10 bg-background-light dark:bg-black/20 h-11 placeholder:text-black/40 dark:placeholder:text-white/40 px-3 text-sm font-normal leading-normal" 
                    />
                  </label>
                  <label className="flex flex-col md:col-span-2">
                    <p className="text-sm font-medium leading-normal pb-2">Email Address</p>
                    <input 
                        value={currentUser?.email || ''}
                        disabled
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black/50 dark:text-white/50 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 h-11 px-3 text-sm font-normal leading-normal cursor-not-allowed" 
                    />
                  </label>
                </div>

                {profileMsg && (
                    <div className={`mt-4 p-3 rounded text-sm ${profileMsg.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {profileMsg.text}
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-black/10 dark:border-white/10">
                  <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent text-black/60 dark:text-white/60 text-sm font-semibold leading-normal hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <span className="truncate">Cancel</span>
                  </button>
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={isProfileSaving}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-semibold leading-normal hover:bg-orange-600 transition-colors disabled:opacity-70"
                  >
                    <span className="truncate">{isProfileSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section className="mt-10 space-y-6 scroll-mt-28" id="security">
              <h2 className="text-xl font-bold">Security</h2>
              <div className="p-6 bg-white dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                <h3 className="text-lg font-semibold border-b border-black/10 dark:border-white/10 pb-4">Change Password</h3>
                <div className="pt-6 grid grid-cols-1 gap-6">
                  <label className="flex flex-col">
                    <p className="text-sm font-medium leading-normal pb-2">Current Password (for verification)</p>
                    <input 
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-black/10 dark:border-white/10 bg-background-light dark:bg-black/20 h-11 placeholder:text-black/40 dark:placeholder:text-white/40 px-3 text-sm font-normal leading-normal" 
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <label className="flex flex-col">
                      <p className="text-sm font-medium leading-normal pb-2">New Password</p>
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-black/10 dark:border-white/10 bg-background-light dark:bg-black/20 h-11 placeholder:text-black/40 dark:placeholder:text-white/40 px-3 text-sm font-normal leading-normal" 
                      />
                    </label>
                    <label className="flex flex-col">
                      <p className="text-sm font-medium leading-normal pb-2">Confirm New Password</p>
                      <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-black/10 dark:border-white/10 bg-background-light dark:bg-black/20 h-11 placeholder:text-black/40 dark:placeholder:text-white/40 px-3 text-sm font-normal leading-normal" 
                      />
                    </label>
                  </div>
                </div>

                {securityMsg && (
                    <div className={`mt-4 p-3 rounded text-sm ${securityMsg.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {securityMsg.text}
                    </div>
                )}

                <div className="flex justify-end mt-6 pt-6 border-t border-black/10 dark:border-white/10">
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={isSecuritySaving}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-semibold leading-normal hover:bg-orange-600 transition-colors disabled:opacity-70"
                  >
                    <span className="truncate">{isSecuritySaving ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Notifications Section */}
            <section className="mt-10 space-y-6 scroll-mt-28" id="notifications">
              <h2 className="text-xl font-bold">Notifications</h2>
              <div className="p-6 bg-white dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 divide-y divide-black/5 dark:divide-white/5">
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold">New Form Responses</p>
                    <p className="text-sm text-black/60 dark:text-white/60">Get notified when someone submits a response to your form.</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" defaultChecked />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-700 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold">Product Updates</p>
                    <p className="text-sm text-black/60 dark:text-white/60">Receive emails about new features and product improvements.</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-700 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold">Security Alerts</p>
                    <p className="text-sm text-black/60 dark:text-white/60">Get critical alerts about your account security.</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" defaultChecked />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 dark:bg-gray-700 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Subscription Section */}
            <section className="mt-10 space-y-6 scroll-mt-28" id="subscription">
              <h2 className="text-xl font-bold">Subscription & Billing</h2>
              <div className="p-6 bg-white dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">Current Plan</p>
                    <p className="text-3xl font-bold mt-1">Free Plan</p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">Active</p>
                  </div>
                  <div>
                    <p className="font-semibold">Usage</p>
                    <p className="text-lg mt-1 text-black/60 dark:text-white/60">2 / 5 Forms</p>
                    <p className="text-sm text-black/60 dark:text-white/60">Upgrade for unlimited forms</p>
                  </div>
                  <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-semibold leading-normal hover:bg-orange-600 transition-colors w-full sm:w-auto shadow-lg shadow-primary/20">
                    <span className="truncate">Upgrade to Pro</span>
                  </button>
                </div>
                <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10">
                  <h3 className="font-semibold">Billing History</h3>
                  <p className="text-sm text-black/50 dark:text-white/50 mt-2 italic">No billing history available.</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
