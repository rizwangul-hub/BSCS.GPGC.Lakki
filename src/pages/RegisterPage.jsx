import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocumentMetadata from '../hooks/useDocumentMetadata';
import Button from '../components/Button';
import Card from '../components/Card';
import { toast } from 'react-hot-toast';
import { FaIdCard, FaLock, FaPhoneAlt, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  useDocumentMetadata(
    "Student Registration | GPGC Lakki Marwat",
    "Pre-approved student self-registration portal for the GPGC Lakki Marwat Computer Science Department."
  );

  const [formData, setFormData] = useState({
    registrationNumber: '',
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });

  const { registerStudent, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
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

  // Password strength check
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'bg-slate-200', width: 'w-0', score: 0 };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 0:
      case 1:
        return { label: 'Weak', color: 'bg-danger', width: 'w-1/4', score: 1 };
      case 2:
        return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4', score: 2 };
      case 3:
        return { label: 'Good', color: 'bg-primary', width: 'w-3/4', score: 3 };
      case 4:
        return { label: 'Strong', color: 'bg-success', width: 'w-full', score: 4 };
      default:
        return { label: '', color: 'bg-slate-200', width: 'w-0', score: 0 };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { registrationNumber, mobileNumber, password, confirmPassword } = formData;

    if (!registrationNumber || !mobileNumber || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerStudent({
        registrationNumber,
        mobileNumber,
        password
      });

      if (res.success) {
        toast.success(res.message || "Registration completed successfully!");
        navigate('/student/dashboard', { replace: true });
      } else {
        toast.error(res.message || "Registration failed. Please check your credentials.");
      }
    } catch (err) {
      toast.error("An error occurred during registration.");
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
          <h1 className="font-heading font-extrabold text-4xl xl:text-5xl leading-tight tracking-tight text-white">
            Create Your <br/>
            <span className="bg-gradient-to-r from-white via-slate-100 to-accent bg-clip-text text-transparent">
              Student Account
            </span> <br/>
            Online
          </h1>
          <p className="text-slate-300 font-body text-sm xl:text-base leading-relaxed">
            Activate your account and register to gain instant access to your classes, timetable, attendance history, assignments, and results.
          </p>

          {/* Department Stats Card */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Registration Status</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-success/20 text-success border border-success/30 font-medium">Open</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl xl:text-2xl font-bold font-heading text-accent">Verify</p>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Pre-Approved Reg</p>
              </div>
              <div>
                <p className="text-xl xl:text-2xl font-bold font-heading text-white">Secure</p>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Encrypted Passwords</p>
              </div>
              <div>
                <p className="text-xl xl:text-2xl font-bold font-heading text-accent">Access</p>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Full ERP Suite</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-slate-400 font-medium flex items-center justify-between border-t border-white/5 pt-6">
          <span>© ${new Date().getFullYear()} GPGC Lakki Marwat</span>
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
              <div className="flex flex-col mb-6">
                <h2 className="font-heading font-extrabold text-2xl text-secondary">
                  Register Account
                </h2>
                <p className="text-xs text-text-secondary mt-1 font-body">
                  Enter your pre-assigned registration details to activate your account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
                {/* Registration Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                    Registration Number
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-200">
                      <FaIdCard className="text-base" />
                    </span>
                    <input 
                      type="text" 
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="e.g. 2024-CS-001"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-sm font-medium shadow-inner shadow-slate-100/50"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                    Mobile Number
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-200">
                      <FaPhoneAlt className="text-base" />
                    </span>
                    <input 
                      type="text" 
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="e.g. 03001234567"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-sm font-medium shadow-inner shadow-slate-100/50"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                    Password
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-200">
                      <FaLock className="text-base" />
                    </span>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
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
                  
                  {/* Password strength bar */}
                  {formData.password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 font-semibold">Strength:</span>
                        <span className={`font-bold transition-colors duration-300 ${
                          passwordStrength.score <= 1 ? 'text-danger' : 
                          passwordStrength.score === 2 ? 'text-amber-500' : 
                          passwordStrength.score === 3 ? 'text-primary' : 'text-success'
                        }`}>{passwordStrength.label}</span>
                      </div>
                      <div className="flex gap-1.5 h-1.5 w-full">
                        {[1, 2, 3, 4].map((pillIndex) => {
                          let pillColor = 'bg-slate-100';
                          if (passwordStrength.score >= pillIndex) {
                            if (passwordStrength.score <= 1) pillColor = 'bg-danger';
                            else if (passwordStrength.score === 2) pillColor = 'bg-amber-500';
                            else if (passwordStrength.score === 3) pillColor = 'bg-primary';
                            else if (passwordStrength.score === 4) pillColor = 'bg-success';
                          }
                          return (
                            <div 
                              key={pillIndex} 
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${pillColor}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-200">
                      <FaLock className="text-base" />
                    </span>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none text-sm font-medium shadow-inner shadow-slate-100/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  loading={loading}
                  className="w-full py-4 mt-2 justify-center shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-bold tracking-wide text-sm"
                >
                  Register Account
                </Button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-4 text-center">
                <p className="text-xs text-text-secondary font-medium">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-bold hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;