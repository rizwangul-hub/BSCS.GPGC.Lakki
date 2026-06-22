import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiUserCircle, HiLogout } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';
import logo from '../assets/logo.png';

/**
 * Sticky Glassmorphism Header with responsive Mobile Drawer
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logoutUser } = useAuth();
  const navigate = useNavigate();

  // Track scroll position to change background styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Welcome', href: '#welcome' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Faculty', href: '#faculty' },
    { name: 'Stats', href: '#stats' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logo} alt="GPGC Logo" className="rotating-logo h-20 w-20 object-contain" />
              <div className="flex flex-col">
                <span className={`font-heading font-bold tracking-tight text-base leading-tight transition-colors duration-300 ${isScrolled ? 'text-secondary' : 'text-white'}`}>
                  GPGC Lakki Marwat
                </span>
                <span className={`font-body text-xs leading-none transition-colors duration-300 ${isScrolled ? 'text-text-secondary' : 'text-slate-300'}`}>
                  Computer Science Department
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`font-body text-sm font-medium transition-colors duration-300 nav-link-animated ${isScrolled ? 'text-text-secondary hover:text-primary' : 'text-slate-300 hover:text-white'}`}
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Desktop CTA / Login State */}
            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <HiUserCircle className="text-2xl text-primary" />
                    <div className="flex flex-col">
                      <span className={`font-semibold text-sm leading-none ${isScrolled ? 'text-secondary' : 'text-white'}`}>
                        {user?.name}
                      </span>
                      <span className={`text-[10px] capitalize ${isScrolled ? 'text-text-secondary' : 'text-slate-300'}`}>
                        {user?.role} Portal
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (user?.role === 'admin') navigate('/admin/dashboard');
                      else if (user?.role === 'teacher') navigate('/teacher/profile');
                      else navigate('/student/profile');
                    }}
                    className="py-1.5 px-3 font-semibold text-xs"
                  >
                    Go to Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={logoutUser}
                    className={`py-1.5 px-3 border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 ${isScrolled ? '' : 'text-white border-slate-700 hover:bg-slate-800'}`}
                  >
                    <HiLogout className="mr-1.5 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/register')}
                    className={`py-2 px-4 font-semibold ${
                      isScrolled
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        : 'border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    Register
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/login')}>
                    Portal Login
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 focus:outline-none transition-colors duration-300 ${isScrolled ? 'text-secondary hover:text-primary' : 'text-white hover:text-primary'}`}
                aria-label="Toggle menu"
              >
                {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 max-w-sm bg-white shadow-xl flex flex-col p-6 lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <span className="font-heading font-bold text-secondary">Navigation Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-secondary hover:text-primary p-1"
                >
                  <HiX className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation list */}
              <div className="flex flex-col gap-4 flex-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="font-body text-base font-semibold text-text-secondary hover:text-primary py-2 transition-colors border-b border-slate-50"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              {/* CTA login state */}
              <div className="border-t border-slate-100 pt-6 mt-auto">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <HiUserCircle className="text-3xl text-primary" />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-secondary leading-none">
                          {user?.name}
                        </span>
                        <span className="text-xs text-text-secondary capitalize">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setIsOpen(false);
                        if (user?.role === 'admin') navigate('/admin/dashboard');
                        else if (user?.role === 'teacher') navigate('/teacher/profile');
                        else navigate('/student/profile');
                      }}
                      className="w-full justify-center"
                    >
                      Go to Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsOpen(false);
                        logoutUser();
                      }}
                      className="w-full justify-center text-red-600 border-red-100 hover:bg-red-50"
                    >
                      <HiLogout className="mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className="w-full justify-center text-slate-700 border-slate-200 hover:bg-slate-50"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/register');
                      }}
                    >
                      Register
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full justify-center"
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/login');
                      }}
                    >
                      Portal Login
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
