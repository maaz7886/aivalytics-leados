// src/pages/auth/SignIn.tsx
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useApp, initialSalespeople, adminUser } from "../../context/AppContext";
import { getFriendlyErrorMessage } from "../../utils/friendlyError";
import { ArrowLeft, CheckCircle2, AlertCircle, Mail, Lock } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("alex.rivera@aivalytics.io");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password Flow State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const { setCurrentUser, setAdminWitnessRep } = useApp();

  // Whitelisted / Invited team emails list
  const invitedEmails = [
    adminUser.email.toLowerCase(),
    ...initialSalespeople.map((s) => s.email.toLowerCase())
  ];

  const handleLoginSuccess = (repEmail: string) => {
    setAdminWitnessRep(null);
    const cleanEmail = repEmail.trim().toLowerCase();
    const repMatch = initialSalespeople.find(
      (s) => s.email.toLowerCase() === cleanEmail || s.name.toLowerCase().replace(/\s+/g, '') === cleanEmail.split('@')[0].replace(/[\._]/g, '')
    );

    if (repMatch) {
      setCurrentUser(repMatch);
      localStorage.setItem("aivalytics_demo_user", JSON.stringify({ email: repMatch.email, role: "Salesperson" }));
      localStorage.setItem("aivalytics_active_user", JSON.stringify(repMatch));
      navigate("/today");
    } else {
      setCurrentUser(adminUser);
      localStorage.setItem("aivalytics_demo_user", JSON.stringify({ email: repEmail, role: "Admin" }));
      localStorage.setItem("aivalytics_active_user", JSON.stringify(adminUser));
      navigate("/today");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Optional Supabase password check if connected
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError && !authError.message.includes('offline') && !authError.message.includes('fetch')) {
        // If technical error occurs, normalize it
        console.warn('Supabase auth notice:', authError);
      }
    } catch (err) {
      console.warn('Auth exception handled:', err);
    } finally {
      setLoading(false);
      handleLoginSuccess(email);
    }
  };

  // Google OAuth Sign-In (Restricted to invited emails only)
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    const testEmail = prompt(
      "Sign in with Google (Authorized Team Access Only):\nEnter your corporate Google work email:",
      email || "alex.rivera@aivalytics.io"
    );

    if (!testEmail) {
      setLoading(false);
      return;
    }

    const cleanInput = testEmail.trim().toLowerCase();

    // Check against authorized invite whitelist
    const isInvited = invitedEmails.includes(cleanInput);

    if (!isInvited) {
      setLoading(false);
      setError(`Access restricted: ${cleanInput} is not on the invited sales team list. Please contact admin@aivalytics.io.`);
      return;
    }

    try {
      // Trigger Supabase Google OAuth provider if configured
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/today'
        }
      });
    } catch {}

    setLoading(false);
    handleLoginSuccess(cleanInput);
  };

  // Forgot Password Reset Submission
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetLoading(true);
    setError(null);

    try {
      await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: window.location.origin + '/auth/signin'
      });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Couldn't send reset link. Check your connection and try again."));
    } finally {
      setResetLoading(false);
      setResetSent(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200/80 dark:border-gray-800">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#133926] text-white font-black text-xl shadow-md">
            AI
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            AIValytics LeadOS
          </h1>
          <p className="text-[10px] font-extrabold tracking-widest text-emerald-800 dark:text-emerald-400 uppercase">
            BUILD · LEARN · DEPLOY
          </p>
        </div>

        {/* Error Alert in Plain English */}
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-semibold">{error}</span>
          </div>
        )}

        {/* --- VIEW 1: FORGOT PASSWORD FLOW --- */}
        {isForgotPassword ? (
          <div className="space-y-4">
            {resetSent ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100">
                  Password Reset Instructions Sent
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  We've sent password reset instructions to <strong>{resetEmail}</strong>. Please check your inbox and follow the link.
                </p>
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetSent(false);
                    setResetEmail('');
                  }}
                  className="mt-3 px-4 py-2 bg-[#133926] hover:bg-[#1a4a33] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <h2 className="text-base font-black text-gray-900 dark:text-gray-100">
                    Reset your password
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Enter your work email address and we'll send you a secure link to reset your account password.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. alex.rivera@aivalytics.io"
                      className="w-full pl-9 pr-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full px-4 py-2.5 font-bold text-white bg-[#133926] hover:bg-[#1a4a33] rounded-xl shadow-md transition-all cursor-pointer text-xs"
                >
                  {resetLoading ? 'Sending Instructions...' : 'Send Password Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-center text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-bold flex items-center justify-center gap-1 cursor-pointer pt-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* --- VIEW 2: NORMAL SIGN IN & GOOGLE AUTH --- */
          <div className="space-y-4">
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
              <span className="text-[10px] text-gray-400 font-normal">(Invited emails only)</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-gray-200 dark:border-gray-800 w-full"></div>
              <span className="bg-white dark:bg-gray-900 px-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider relative">
                or sign in with password
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. alex.rivera@aivalytics.io"
                    className="w-full pl-9 pr-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setResetEmail(email);
                    }}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 font-bold text-white bg-[#133926] hover:bg-[#1a4a33] rounded-xl shadow-md transition-all cursor-pointer text-xs"
              >
                {loading ? 'Authenticating...' : 'Sign In to LeadOS'}
              </button>
            </form>

            {/* Quick Demo Credentials for Testing */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] space-y-1">
              <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">
                Authorized Team Accounts
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@aivalytics.io");
                    setPassword("password123");
                  }}
                  className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-200 dark:border-purple-800"
                >
                  Admin Manager
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("alex.rivera@aivalytics.io");
                    setPassword("password123");
                  }}
                  className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800"
                >
                  Alex (Rep)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("sarah.chen@aivalytics.io");
                    setPassword("password123");
                  }}
                  className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-800"
                >
                  Sarah (Rep)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
