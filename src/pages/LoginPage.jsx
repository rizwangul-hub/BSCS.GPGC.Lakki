import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocumentMetadata from '../hooks/useDocumentMetadata';
import Button from '../components/Button';
import Card from '../components/Card';
import { toast } from 'react-hot-toast';
import { FaUserCircle, FaLock, FaPhoneAlt, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { motion } from 'framer-motion';

const LoginPage = () => {
  useDocumentMetadata(
    "Portal Login | GPGC Lakki Marwat",
    "Log in to the Government Post Graduate College Lakki Marwat Student, Teacher, or Admin Portal."
  );

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect already authenticated users to profile/dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobileNumber || !password) {
      toast.error("Please enter both mobile/registration number and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(mobileNumber, password);
      if (res.success) {
        toast.success(res.message || "Logged in successfully!");
        // Role-based redirect to dashboard pages
        const role = res.role || res.user?.role;
        if (role === 'admin') navigate('/admin/dashboard', { replace: true });
        else if (role === 'teacher') navigate('/teacher/dashboard', { replace: true });
        else navigate('/student/dashboard', { replace: true });
      } else {
        toast.error(res.message || "Invalid credentials.");
      }
    } catch (err) {
      toast.error("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light grid grid-cols-1 lg:grid-cols-12 selection:bg-primary/20 selection:text-primary">
      
      {/* LEFT PANEL: Branding & Interactive Visuals (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-tr from-secondary via-secondary to-blue-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Animated Glowing Gradients */}
          <motion.div 
            className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-accent/15 blur-[100px]"
            animate={{
              x: [0, 40, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -right-20 w-[450px] h-[450px] rounded-full bg-primary/15 blur-[130px]"
            animate={{
              x: [0, -50, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
        </div>

        {/* Top Branding Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src={logo} alt="GPGC Logo" className="rotating-logo h-14 w-14 object-contain" />
          <div>
            <h3 className="font-heading font-extrabold text-lg leading-tight tracking-wide">GPGC PORTAL</h3>
            <span className="text-[10px] text-accent font-semibold tracking-widest uppercase flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Lakki Marwat
            </span>
          </div>
        </div>

        {/* Middle Welcome & Illustration Card */}
        <div className="relative z-10 my-auto space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-accent">
            <span>Official Portal</span>
          </div>
          <h1 className="font-heading font-extrabold text-4xl xl:text-5xl leading-tight tracking-tight">
            Welcome to the <br/>
            <span className="bg-gradient-to-r from-white via-slate-100 to-accent bg-clip-text text-transparent">
              Computer Science
            </span> <br/>
            Department
          </h1>
          <p className="text-slate-300 font-body text-sm xl:text-base leading-relaxed">
            Empowering students with modern computing skills, fostering innovation, and preparing next-generation leaders in technology and software engineering.
          </p>

          {/* Department Stats Card */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Department Status</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-success/20 text-success border border-success/30 font-medium">Active</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl xl:text-2xl font-bold font-heading text-accent">BSCS</p>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">4-Year Degree</p>
              </div>
              <div>
                <p className="text-xl xl:text-2xl font-bold font-heading text-white">4.0</p>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Outcome Based</p>
              </div>
              <div>
                <p className="text-xl xl:text-2xl font-bold font-heading text-accent">CS Lab</p>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">State of Art</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-slate-400 font-medium flex items-center justify-between border-t border-white/5 pt-6">
          <span>© 2026 GPGC Lakki Marwat</span>
          <span className="hover:text-white transition-colors cursor-pointer">Support & Help</span>
        </div>
      </div>

      {/* RIGHT PANEL: Auth Card Section */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden bg-bg-light min-h-screen">
        
        {/* Background Glows for Right Side (Mobile fallback backdrop) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[35%] h-[35%] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        <div className="w-full max-w-md relative z-10 flex flex-col">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary text-xs font-semibold mb-6 transition-colors group self-start"
          >
            <FaArrowLeft className="text-[10px] transform group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>

          {/* Mobile Only Header (Logo and Branding) */}
          <div className="lg:hidden flex flex-col items-center text-center mb-6">
            <img src={logo} alt="GPGC Logo" className="rotating-logo h-16 w-16 object-contain mb-3" />
            <h2 className="font-heading font-extrabold text-2xl text-secondary">
              GPGC Lakki Marwat
            </h2>
            <p className="text-xs text-text-secondary mt-1 font-body">
              Computer Science Department Portal
            </p>
          </div>

          {/* Main Card Frame */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="p-8 sm:p-10 shadow-2xl shadow-slate-200/80 bg-white/95 backdrop-blur-sm border border-slate-100 rounded-2xl relative overflow-hidden" hoverEffect={false}>
              
              {/* Top Accent line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent to-blue-600" />
              
              {/* Header Title */}
              <div className="flex flex-col mb-8">
                <h2 className="font-heading font-extrabold text-2xl text-secondary">
                  Sign In
                </h2>
                <p className="text-xs text-text-secondary mt-1 font-body">
                  Access your GPGC portal using your registered credentials
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
                {/* Mobile / Reg Number Input */}
                <div className="flex flex-col gap-2">
                  <label 
                    htmlFor="mobile" 
                    className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5"
                  >
                    Mobile / Registration Number
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-200">
                      <FaUserCircle className="text-base" />
                    </span>
                    <input 
                      id="mobile"
                      type="text" 
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. 03001234567 or REG-CS-101"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-sm font-medium shadow-inner shadow-slate-100/50"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-2">
                  <label 
                    htmlFor="password" 
                    className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-200">
                      <FaLock className="text-base" />
                    </span>
                    <input 
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-sm font-medium shadow-inner shadow-slate-100/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {showPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                    </button>
                  </div>
                </div>

                {/* Auxiliary links */}
                <div className="flex items-center justify-between text-xs mt-1">
                  <Link to="/forgot-password" className="text-primary hover:text-blue-700 transition-colors font-semibold">
                    Forgot password?
                  </Link>
                  <span className="text-text-secondary font-medium">
                    New student?{' '}
                    <Link to="/register" className="text-primary hover:text-blue-700 transition-colors font-bold">
                      Register here
                    </Link>
                  </span>
                </div>

                {/* Submit button */}
                <Button 
                  type="submit" 
                  variant="primary" 
                  loading={loading}
                  className="w-full py-4 mt-2 justify-center shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-bold tracking-wide text-sm"
                >
                  Sign In to Portal
                </Button>
              </form>

              {/* Demo Info Footer */}
              <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                <p className="text-[11px] text-text-secondary leading-relaxed font-body font-medium">
                  For demo access, use credentials assigned by the administrator or check the system configuration manual.
                </p>
              </div>

            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;