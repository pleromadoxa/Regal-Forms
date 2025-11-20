
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';

interface SignUpPageProps {
  isLogin?: boolean;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ isLogin = false }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const saveUserToFirestore = async (user: any, name?: string) => {
      if (!user) return;
      try {
          const userRef = doc(db, 'users', user.uid);
          
          // Attempt to check if user exists
          let userExists = false;
          try {
              const userSnap = await getDoc(userRef);
              userExists = userSnap.exists();
          } catch (readError) {
              console.warn("Could not read user doc, assuming create/overwrite flow", readError);
          }
          
          const userData: any = {
              uid: user.uid,
              email: user.email || '',
              displayName: name || user.displayName || '',
              photoURL: user.photoURL || '',
              lastLogin: serverTimestamp(),
          };

          // Enforce Admin Role for specific email
          if (user.email === 'pleromadoxa@gmail.com') {
              userData.role = 'admin';
          }

          if (userExists) {
              // UPDATE: Merge data. If it's the admin, we force role='admin' update.
              // For other users, we just update login time/profile info, avoiding restricted fields if any rules exist.
              await setDoc(userRef, userData, { merge: true });
          } else {
              // CREATE: Set initial timestamp and default role if not admin
              if (!userData.role) {
                  userData.role = 'user';
              }
              userData.createdAt = serverTimestamp();

              await setDoc(userRef, userData);
          }
      } catch (e: any) {
          console.error("Error saving user to DB:", e);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName) {
          // Update profile with full name
          await updateProfile(userCredential.user, { displayName: fullName });
        }
        await saveUserToFirestore(userCredential.user, fullName);
      }
      // Redirect to the builder page after successful auth
      navigate('/create');
    } catch (err: any) {
      console.error("Auth error:", err);
      // Map common firebase errors to user friendly messages
      if (err.code === 'auth/email-already-in-use') {
        setError('That email address is already in use.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(result.user);
      navigate('/create');
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignore multiple clicks
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        // Display the actual error message to help debug (e.g., Unauthorized Domain)
        setError(`Google Sign In failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="font-display min-h-screen w-full flex bg-background-light dark:bg-background-dark overflow-hidden">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slide-in {
            animation: slideInRight 0.6s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
      `}</style>

      {/* Back to Home Button */}
      <Link to="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-white/20 transition-colors text-sm font-bold shadow-sm">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back to Home
      </Link>

      {/* Left Side - Visual / Brand (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90"></div>
        
        <div className="relative z-10 max-w-lg px-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                 <div className="size-10 bg-primary text-white flex items-center justify-center rounded-lg shadow-lg shadow-primary/20">
                    <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
                    </svg>
                 </div>
                 <span className="text-2xl font-bold text-white">Regal Forms</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight mb-6">
                {isLogin ? "Welcome back to the future of forms." : "Start building beautiful forms in seconds."}
            </h2>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
                "Regal Forms has completely transformed how we collect data. The AI generation features are simply magic."
            </p>
            <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User" className="size-12 rounded-full border-2 border-white/20" />
                <div>
                    <p className="text-white font-bold">Alex Rivera</p>
                    <p className="text-white/50 text-sm">CEO, TechFlow</p>
                </div>
            </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 relative pt-20 lg:pt-0">
        <div className="w-full max-w-md animate-slide-in">
            <div className="mb-10">
                <h1 className="text-3xl font-black text-black dark:text-white mb-2">
                    {isLogin ? "Sign in to your account" : "Create your account"}
                </h1>
                <p className="text-black/60 dark:text-white/60">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Link to={isLogin ? "/signup" : "/login"} className="text-primary font-bold hover:underline transition-colors">
                        {isLogin ? "Sign up" : "Log in"}
                    </Link>
                </p>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                    onClick={handleGoogleSignIn}
                    type="button"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm font-semibold bg-white dark:bg-white/5 text-black dark:text-white hover:scale-[1.02] active:scale-[0.98] duration-200"
                >
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                         <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                         <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                         <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                </button>
                 <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm font-semibold bg-white dark:bg-white/5 text-black dark:text-white hover:scale-[1.02] active:scale-[0.98] duration-200">
                    <svg className="size-5 text-black dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.683 0 3.842-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    GitHub
                </button>
            </div>

            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/10 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background-light dark:bg-background-dark px-2 text-black/50 dark:text-white/50">Or continue with email</span>
                </div>
            </div>
            
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-fade-in flex items-start gap-2">
                <span className="material-symbols-outlined text-lg mt-0.5">error</span>
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
                {!isLogin && (
                    <div className="space-y-2 delay-100 animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
                        <label className="text-sm font-bold text-black dark:text-white">Full Name</label>
                        <div className="relative group">
                             <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 group-hover:border-black/20 dark:group-hover:border-white/20"
                                placeholder="e.g. John Doe"
                                required={!isLogin}
                            />
                            <span className="material-symbols-outlined absolute right-3 top-3 text-black/30 dark:text-white/30 pointer-events-none">person</span>
                        </div>
                    </div>
                )}

                <div className="space-y-2 delay-200 animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
                    <label className="text-sm font-bold text-black dark:text-white">Email Address</label>
                     <div className="relative group">
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 group-hover:border-black/20 dark:group-hover:border-white/20"
                            placeholder="name@company.com"
                            required
                        />
                        <span className="material-symbols-outlined absolute right-3 top-3 text-black/30 dark:text-white/30 pointer-events-none">mail</span>
                    </div>
                </div>

                <div className="space-y-2 delay-300 animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
                    <div className="flex justify-between items-center">
                         <label className="text-sm font-bold text-black dark:text-white">Password</label>
                         {isLogin && <a href="#" className="text-xs text-primary font-bold hover:underline">Forgot password?</a>}
                    </div>
                    <div className="relative group">
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 group-hover:border-black/20 dark:group-hover:border-white/20 pr-10"
                            placeholder="••••••••"
                            required
                        />
                         <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-black/30 dark:text-white/30 hover:text-black/60 dark:hover:text-white/60 transition-colors"
                        >
                             <span className="material-symbols-outlined text-lg">
                                {showPassword ? 'visibility' : 'visibility_off'}
                             </span>
                        </button>
                    </div>
                </div>
                
                {!isLogin && (
                     <div className="flex items-start gap-3 delay-400 animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
                        <input type="checkbox" className="mt-1 rounded text-primary focus:ring-primary border-black/10 dark:border-white/10 bg-white dark:bg-white/5" required />
                        <p className="text-xs text-black/60 dark:text-white/60">
                            By signing up, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                        </p>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-lg bg-primary hover:bg-orange-600 text-white dark:text-black font-bold text-base shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 delay-400 animate-fade-in opacity-0"
                    style={{ animationFillMode: 'forwards' }}
                >
                    {isLoading && <span className="material-symbols-outlined animate-spin text-lg">refresh</span>}
                    {isLogin ? "Sign In" : "Create Account"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
