import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  updateProfile, 
  signOut,
  getFriendlyAuthErrorMessage 
} from '../lib/firebase';
import { 
  User, 
  LogOut, 
  CheckCircle, 
  Shield, 
  Sparkles, 
  Mail, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  Camera, 
  Check, 
  ArrowLeft,
  UserCheck,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

type AuthTab = 'signin' | 'signup' | 'forgot' | 'profile';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<AuthTab>(userProfile.isLoggedIn ? 'profile' : 'signin');
  
  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatar || '');

  // Profile preferences
  const [nameInput, setNameInput] = useState(userProfile.name || '');
  const [roleInput, setRoleInput] = useState<UserProfile['preferredRole']>(userProfile.preferredRole || 'student');
  const [langInput, setLangInput] = useState(userProfile.favoriteLanguage || 'Hinglish');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  // Sync tab when modal opens or login state changes
  useEffect(() => {
    if (userProfile.isLoggedIn) {
      setActiveTab('profile');
      setNameInput(userProfile.name || '');
      setAvatarUrl(userProfile.avatar || '');
    } else {
      if (activeTab === 'profile') {
        setActiveTab('signin');
      }
    }
  }, [userProfile.isLoggedIn]);

  const clearAlerts = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Input Validation
  const validateEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    clearAlerts();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const updatedProfile: UserProfile = {
        id: user.uid,
        name: user.displayName || 'Alpha User',
        email: user.email || 'user@example.com',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        provider: 'google',
        isLoggedIn: true,
        emailVerified: user.emailVerified,
        preferredRole: roleInput,
        favoriteLanguage: langInput,
        joinedAt: user.metadata.creationTime || new Date().toISOString()
      };

      onUpdateProfile(updatedProfile);
      setSuccessMsg('Successfully signed in with Google!');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrorMsg(getFriendlyAuthErrorMessage(err.code, err.message));
    } finally {
      setLoading(false);
    }
  };

  // Email Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = result.user;

      const updatedProfile: UserProfile = {
        id: user.uid,
        name: user.displayName || email.split('@')[0],
        email: user.email || email,
        avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
        provider: 'email',
        isLoggedIn: true,
        emailVerified: user.emailVerified,
        preferredRole: roleInput,
        favoriteLanguage: langInput,
        joinedAt: user.metadata.creationTime || new Date().toISOString()
      };

      onUpdateProfile(updatedProfile);
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Email Sign In Error:', err);
      setErrorMsg(getFriendlyAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Email Sign Up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = result.user;

      // Update Firebase Profile Display Name
      const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`;
      await updateProfile(user, {
        displayName: fullName.trim(),
        photoURL: defaultAvatar
      });

      // Send Email Verification
      try {
        await sendEmailVerification(user);
        setVerificationSent(true);
      } catch (vErr) {
        console.warn('Verification email send warning:', vErr);
      }

      const updatedProfile: UserProfile = {
        id: user.uid,
        name: fullName.trim(),
        email: user.email || email,
        avatar: defaultAvatar,
        provider: 'email',
        isLoggedIn: true,
        emailVerified: user.emailVerified,
        preferredRole: roleInput,
        favoriteLanguage: langInput,
        joinedAt: new Date().toISOString()
      };

      onUpdateProfile(updatedProfile);
      setSuccessMsg('Account created successfully! Verification email sent.');
      setTimeout(() => {
        setActiveTab('profile');
      }, 1000);
    } catch (err: any) {
      console.error('Email Sign Up Error:', err);
      setErrorMsg(getFriendlyAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    if (!validateEmail(resetEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setSuccessMsg(`Password reset link sent to ${resetEmail.trim()}! Please check your inbox.`);
      setResetEmail('');
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      setErrorMsg(getFriendlyAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Resend Email Verification
  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    clearAlerts();
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationSent(true);
      setSuccessMsg('Verification email sent! Please check your inbox and spam folder.');
    } catch (err: any) {
      setErrorMsg(getFriendlyAuthErrorMessage(err.code, 'Failed to resend verification email. Try again later.'));
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    clearAlerts();
    setLoading(true);
    try {
      await signOut(auth);
      onUpdateProfile({
        id: 'usr-guest',
        name: 'Guest User',
        email: 'guest@alpha.ai',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        provider: 'guest',
        isLoggedIn: false,
        emailVerified: false,
        joinedAt: new Date().toISOString()
      });
      setActiveTab('signin');
      setSuccessMsg('Signed out successfully.');
    } catch (err: any) {
      setErrorMsg('Error signing out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save Profile Changes
  const handleSaveProfileChanges = async () => {
    clearAlerts();
    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: nameInput.trim() || userProfile.name,
          photoURL: avatarUrl.trim() || userProfile.avatar
        });
      }

      onUpdateProfile({
        ...userProfile,
        name: nameInput.trim() || userProfile.name,
        avatar: avatarUrl.trim() || userProfile.avatar,
        preferredRole: roleInput,
        favoriteLanguage: langInput
      });

      setSuccessMsg('Profile preferences updated successfully!');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        {/* Top Accent Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Alpha AI Account
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Firebase Auth
                </span>
              </h3>
              <p className="text-xs text-slate-400">Secure session management & cloud profile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 text-sm font-semibold transition"
          >
            ✕
          </button>
        </div>

        {/* Global Error/Success Notification Banner */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-start gap-2.5 animate-fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* TAB 1: USER PROFILE VIEW (When Logged In) */}
          {userProfile.isLoggedIn && activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-4">
                <div className="relative group">
                  <img
                    src={avatarUrl || userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={userProfile.name}
                    className="w-16 h-16 rounded-full border-2 border-indigo-500 object-cover bg-slate-800"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-full text-white text-[10px]">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base truncate">{userProfile.name}</h4>
                    {userProfile.emailVerified ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1">
                        Unverified
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 truncate">{userProfile.email}</p>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-indigo-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="capitalize font-medium">{userProfile.provider} Auth</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">ID: {userProfile.id.substring(0, 8)}...</span>
                  </div>
                </div>
              </div>

              {/* Email Verification Banner if Unverified */}
              {!userProfile.emailVerified && userProfile.provider === 'email' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                    <span>Email verification required for full access</span>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={loading}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg text-[11px] flex items-center gap-1 transition"
                    >
                      <Send className="w-3 h-3" /> {verificationSent ? 'Sent!' : 'Resend Link'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Check your inbox to verify email address.
                  </p>
                </div>
              )}

              {/* Editable Profile Settings */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Role</label>
                    <select
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="student">Student / HSC Class 12</option>
                      <option value="coder">Software / Web Coder</option>
                      <option value="creator">YouTube / Content Creator</option>
                      <option value="general">General User</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Favorite Language</label>
                    <input
                      type="text"
                      value={langInput}
                      onChange={(e) => setLangInput(e.target.value)}
                      placeholder="e.g. Hinglish"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={loading}
                  className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfileChanges}
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Profile
                </button>
              </div>
            </div>
          )}

          {/* SIGN IN / SIGN UP TABS (When not logged in or switching auth mode) */}
          {(!userProfile.isLoggedIn || activeTab !== 'profile') && (
            <div className="space-y-4">
              {/* Tab Selector Header */}
              {activeTab !== 'forgot' && (
                <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signin'); clearAlerts(); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                      activeTab === 'signin'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signup'); clearAlerts(); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                      activeTab === 'signup'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* Google Sign-In Button */}
              {activeTab !== 'forgot' && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-2.5 px-4 rounded-xl text-xs transition shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  {loading ? 'Connecting Google...' : 'Continue with Google'}
                </button>
              )}

              {activeTab !== 'forgot' && (
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Or Email Credentials
                  </span>
                </div>
              )}

              {/* SIGN IN FORM */}
              {activeTab === 'signin' && (
                <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('forgot'); clearAlerts(); }}
                        className="text-[11px] text-indigo-400 hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Sign In
                  </button>
                </form>
              )}

              {/* SIGN UP FORM */}
              {activeTab === 'signup' && (
                <form onSubmit={handleEmailSignUp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Anshu Kumar"
                        className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                    Create Firebase Account
                  </button>
                </form>
              )}

              {/* FORGOT PASSWORD FORM */}
              {activeTab === 'forgot' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('signin'); clearAlerts(); }}
                      className="text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Sign In
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm">Reset Your Password</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Enter your account email address. We will send you a secure Firebase link to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Account Email</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Reset Email
                    </button>
                  </form>
                </div>
              )}

              {/* Guest Fallback */}
              <div className="pt-3 border-t border-slate-800/80 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProfile({
                      id: 'usr-guest',
                      name: 'Guest User',
                      email: 'guest@alpha.ai',
                      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                      provider: 'guest',
                      isLoggedIn: false,
                      emailVerified: false,
                      joinedAt: new Date().toISOString()
                    });
                    onClose();
                  }}
                  className="text-xs text-slate-400 hover:text-indigo-400 underline font-medium transition"
                >
                  Continue in Guest Mode
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
