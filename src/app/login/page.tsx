"use client";

import { signIn, useSession, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  useEffect(() => {
    // Detect which providers are configured on the server
    getProviders().then((providers) => {
      setGoogleEnabled(Boolean(providers?.google));
    }).catch(() => setGoogleEnabled(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
    setFieldErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Simple password strength calculator (0-4)
  const calcPasswordStrength = (pw: string) => {
    let score = 0;
    if (!pw) return 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4);
  };

  const strengthLabel = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  const validateField = (name: string, value: string) => {
    let message = "";
    if (name === "email") {
      if (!value.trim()) message = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value)) message = "Please enter a valid email";
    }
    if (name === "password") {
      if (!value) message = "Password is required";
      else if (value.length < 6) message = "Must be at least 6 characters";
    }
    if (name === "confirmPassword") {
      if (!value) message = "Please confirm your password";
      else if (value !== formData.password) message = "Passwords don't match";
    }
    if (name === "name" && isSignUp) {
      if (!value.trim()) message = "Name is required";
    }
    setFieldErrors(prev => ({ ...prev, [name]: message }));
    return message;
  };

  const validateAll = () => {
    const errors: { [k: string]: string } = {};
    errors.email = validateField("email", formData.email);
    errors.password = validateField("password", formData.password);
    if (isSignUp) {
      errors.name = validateField("name", formData.name);
      errors.confirmPassword = validateField("confirmPassword", formData.confirmPassword);
    }
    const hasErrors = Object.values(errors).some(Boolean);
    return !hasErrors;
  };

  const validateForm = () => {
    if (!formData.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Please enter a valid email";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (isSignUp) {
      if (!formData.name.trim()) return "Name is required";
      if (formData.password !== formData.confirmPassword) return "Passwords don't match";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    const ok = validateAll();
    if (validationError || !ok) {
      if (validationError) setError(validationError);
      else setError("Please fix the highlighted fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Handle sign up - you'd implement this endpoint
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create account");
        
        // Auto sign in after successful signup
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        if (result?.error) throw new Error("Failed to sign in");
        router.replace("/");
      } else {
        // Handle sign in
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        if (result?.error) throw new Error("Invalid email or password");
        router.replace("/");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent hydration issues by not rendering until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="glass p-8 animate-pulse">
            <div className="h-6 bg-emphasis rounded mb-4"></div>
            <div className="h-10 bg-emphasis rounded mb-4"></div>
            <div className="h-10 bg-emphasis rounded mb-4"></div>
            <div className="h-10 bg-emphasis rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-400/20 to-blue-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-cyan-400/10 to-blue-500/10 blur-2xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center p-4">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-slide-in">
          {/* Marketing panel (desktop) */}
          <aside className="hidden lg:flex glass p-8 lg:p-10 rounded-2xl flex-col justify-between">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 rounded-2xl shadow-lg" />
                <div className="absolute inset-0.5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl" />
                <img src="/kalam-ai-logo.svg" alt="Kalam AI" className="relative w-8 h-8 m-auto filter brightness-0 invert" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-fg mb-2">Create smarter, faster</h2>
              <p className="text-fg-muted leading-relaxed mb-6">Unlock AI-powered writing with tailored personas, humanized tone, and real-time creativity—all in a beautiful, focused workspace.</p>
              <ul className="section-base hover-list rounded-xl bg-transparent border-0 p-0">
                <li className="flex items-start gap-3">
                  <span className="mini">NEW</span>
                  Persona-guided content generation
                </li>
                <li className="flex items-start gap-3">
                  <span className="mini">LIVE</span>
                  Real-time chat and humanizer
                </li>
                <li className="flex items-start gap-3">
                  <span className="mini">SAFE</span>
                  Private, secure, and responsive by design
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <div className="stats-row">
                <div className="stat-card">
                  <span className="label">Latency</span>
                  <div className="value">~300ms <span className="delta">fast</span></div>
                </div>
                <div className="stat-card">
                  <span className="label">Uptime</span>
                  <div className="value">99.9% <span className="delta">SLA</span></div>
                </div>
              </div>
            </div>
          </aside>

          {/* Auth form */}
          <section className="glass p-8 lg:p-10 rounded-2xl hover-lift">
            {/* Header (mobile) */}
            <div className="text-center mb-8 lg:hidden">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 rounded-2xl shadow-lg" />
                <div className="absolute inset-0.5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl" />
                <img src="/kalam-ai-logo.svg" alt="Kalam AI" className="relative w-8 h-8 m-auto filter brightness-0 invert" />
              </div>
              <h1 className="text-3xl font-bold text-fg mb-2 tracking-tight">{isSignUp ? 'Join Kalam AI' : 'Welcome back'}</h1>
              <p className="text-fg-muted">{isSignUp ? 'Create your account' : 'Sign in to continue'}</p>
            </div>

            {/* Toggle */}
            <div className="flex bg-emphasis rounded-xl p-1.5 mb-8 shadow-inner" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignUp}
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  !isSignUp ? 'bg-white text-fg shadow-lg shadow-blue-500/20 scale-[1.02]' : 'text-fg-muted hover:text-fg hover:bg-white/5'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignUp}
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isSignUp ? 'bg-white text-fg shadow-lg shadow-blue-500/20 scale-[1.02]' : 'text-fg-muted hover:text-fg hover:bg-white/5'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            <div aria-live="polite" role="status">
              {error && (
                <div className="alert alert-danger-soft mb-6 animate-fade-slide-in">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="field-group">
                  <label htmlFor="name" className="text-fg-muted font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-fg-subtle" />
                    <input id="name" name="name" type="text" value={formData.name}
                      onChange={handleInputChange}
                      onBlur={(e) => validateField('name', e.target.value)}
                      className="ki-input pl-12 h-14 text-base" placeholder="Enter your full name"
                      aria-invalid={!!fieldErrors.name}
                      aria-describedby={fieldErrors.name ? 'name-error' : undefined} />
                  </div>
                  {fieldErrors.name && <p id="name-error" className="mt-1 text-xs text-danger">{fieldErrors.name}</p>}
                </div>
              )}

              <div className="field-group">
                <label htmlFor="email" className="text-fg-muted font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-fg-subtle" />
                  <input id="email" name="email" type="email" value={formData.email}
                    onChange={handleInputChange}
                    onBlur={(e) => validateField('email', e.target.value)}
                    className="ki-input pl-12 h-14 text-base" placeholder="Enter your email" autoComplete="email" data-temp-mail-org="0"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined} />
                </div>
                {fieldErrors.email && <p id="email-error" className="mt-1 text-xs text-danger">{fieldErrors.email}</p>}
              </div>

              <div className="field-group">
                <label htmlFor="password" className="text-fg-muted font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-fg-subtle" />
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password}
                    onChange={(e) => { handleInputChange(e); const s = calcPasswordStrength(e.target.value); setPasswordStrength(s); }}
                    onBlur={(e) => validateField('password', e.target.value)}
                    onKeyUp={(e) => setCapsLockOn((e as any).getModifierState && (e as any).getModifierState('CapsLock'))}
                    className="ki-input pl-12 pr-12 h-14 text-base" placeholder="Enter your password"
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={(fieldErrors.password ? 'password-error ' : '') + 'password-help'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldErrors.password && <p id="password-error" className="mt-1 text-xs text-danger">{fieldErrors.password}</p>}
                <div id="password-help" className="mt-2">
                  <div className="flex gap-1" aria-hidden>
                    {[0,1,2,3].map((i) => (
                      <span key={i} className={`h-1.5 flex-1 rounded ${passwordStrength > i ? (passwordStrength <= 1 ? 'bg-danger' : passwordStrength === 2 ? 'bg-warn' : 'bg-success') : 'bg-emphasis'}`} />
                    ))}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-fg-subtle">Strength: <span className="font-medium">{strengthLabel(passwordStrength)}</span></span>
                    {capsLockOn && <span className="text-warn">Caps Lock is on</span>}
                  </div>
                </div>
              </div>

              {isSignUp && (
                <div className="field-group">
                  <label htmlFor="confirmPassword" className="text-fg-muted font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-fg-subtle" />
                    <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onBlur={(e) => validateField('confirmPassword', e.target.value)}
                      className="ki-input pl-12 h-14 text-base" placeholder="Confirm your password"
                      aria-invalid={!!fieldErrors.confirmPassword}
                      aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined} />
                  </div>
                  {fieldErrors.confirmPassword && <p id="confirmPassword-error" className="mt-1 text-xs text-danger">{fieldErrors.confirmPassword}</p>}
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-border text-accent focus:ring-2 focus:ring-accent/25" />
                    <span className="ml-3 text-fg-muted">Remember me</span>
                  </label>
                  <a href="#" className="text-accent hover:text-accent-hover font-medium transition-colors">Forgot password?</a>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="ki-btn gradient w-full h-14 text-base font-semibold">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isSignUp ? 'Creating your account...' : 'Signing you in...'}
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-surface text-fg-muted font-medium">Or continue with</span></div>
            </div>

            {/* Google Sign In */}
            <button type="button" onClick={() => signIn('google', { callbackUrl: '/' })} disabled={!googleEnabled}
              className={`ki-btn outline w-full h-14 text-base font-medium ${googleEnabled ? 'hover:bg-emphasis' : 'opacity-50 cursor-not-allowed'}`}
              title={googleEnabled ? 'Sign in with Google' : 'Google sign-in is not configured'}>
              <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <p className="text-xs text-fg-subtle text-center mt-6 leading-relaxed">
              By continuing, you agree to our <a href="#" className="text-accent hover:text-accent-hover transition-colors">Terms of Service</a> and <a href="#" className="text-accent hover:text-accent-hover transition-colors">Privacy Policy</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
