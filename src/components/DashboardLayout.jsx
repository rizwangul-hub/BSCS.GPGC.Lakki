import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiMenu, HiX, HiUserCircle, HiLogout, HiAcademicCap, 
  HiCalendar, HiClipboardList, HiBell, HiHome, HiDocumentReport, HiInbox
} from 'react-icons/hi';
import { FaGraduationCap, FaUserTie, FaCog, FaClipboardList } from 'react-icons/fa';
import Button from './Button';
import logo from '../assets/logo.png';

/**
 * General Dashboard Shell containing Sidebar and responsive Header
 */
const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  // Define links based on roles
  const getSidebarLinks = (role) => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: HiHome },
          { name: 'Sessions', path: '/admin/sessions', icon: FaCog },
          { name: 'Subjects', path: '/admin/subjects', icon: HiAcademicCap },
          { name: 'Teachers', path: '/admin/teachers', icon: FaUserTie },
          { name: 'Students', path: '/admin/students', icon: FaGraduationCap },
          { name: 'Pre-Registrations', path: '/admin/pre-registrations', icon: FaClipboardList },
          { name: 'Timetables', path: '/admin/timetable', icon: HiCalendar },
          { name: 'Notices', path: '/admin/notices', icon: HiBell },
          { name: 'Messages', path: '/admin/messages', icon: HiInbox },
          { name: 'Complaints', path: '/admin/complaints', icon: HiInbox }
        ];
      case 'teacher':
        return [
          { name: 'Dashboard', path: '/teacher/dashboard', icon: HiHome },
          { name: 'Subjects', path: '/teacher/subjects', icon: HiAcademicCap },
          { name: 'Marks', path: '/teacher/marks', icon: HiClipboardList },
          { name: 'Attendance', path: '/teacher/attendance', icon: HiCalendar },
          { name: 'Assignments', path: '/teacher/assignments', icon: HiDocumentReport },
          { name: 'Complaints', path: '/teacher/complaints', icon: HiInbox },
          { name: 'Profile', path: '/teacher/profile', icon: HiUserCircle }
        ];
      case 'student':
        return [
          { name: 'Dashboard',   path: '/student/dashboard',   icon: HiHome },
          { name: 'Timetable',   path: '/student/timetable',   icon: HiCalendar },
          { name: 'Attendance',  path: '/student/attendance',  icon: HiClipboardList },
          { name: 'Marks',       path: '/student/marks',       icon: HiAcademicCap },
          { name: 'Assignments', path: '/student/assignments', icon: HiDocumentReport },
          { name: 'Notices',     path: '/student/notices',     icon: HiBell },
          { name: 'Complaints',  path: '/student/complaints',  icon: HiInbox },
          { name: 'Profile',     path: '/student/profile',     icon: HiUserCircle },
        ];
      default:
        return [];
    }
  };

  const links = getSidebarLinks(user?.role);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-secondary text-slate-300">
      {/* Brand logo info */}
      <div className="flex items-center gap-2.5 p-6 border-b border-slate-800">
        <img src={logo} alt="GPGC Logo" className="rotating-logo h-20 w-20 object-contain shrink-0" />
        <div className="flex flex-col overflow-hidden">
          <span className="font-heading font-extrabold text-white text-sm tracking-tight truncate">
            GPGC Portal
          </span>
          <span className="font-body text-[10px] text-slate-400 capitalize">
            {user?.role} Workspace
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="text-xl shrink-0" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile area */}
      <div className="p-4 border-t border-slate-800 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center font-bold text-primary text-base border border-primary/20 shrink-0">
            {user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-sm text-white truncate leading-none mb-1">
              {user?.name}
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              {user?.email || user?.mobileNumber}
            </span>
          </div>
        </div>
        
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full py-2 border-slate-700 text-slate-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
        >
          <HiLogout className="mr-2 text-base" />
          Logout Account
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-light flex">
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-slate-200/50 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-secondary md:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main page content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm py-4 px-6 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-secondary p-1.5 rounded-lg hover:bg-slate-100 md:hidden"
              aria-label="Open sidebar"
            >
              <HiMenu className="h-6 w-6" />
            </button>
            <h2 className="font-heading font-extrabold text-lg text-secondary capitalize leading-none">
              {location.pathname.split('/').pop().replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs text-text-secondary leading-none mb-1">Signed in as</span>
              <span className="block text-sm font-semibold text-secondary leading-none capitalize">{user?.role}</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
              {user?.role?.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Mount */}
        <main className="p-6 md:p-8 flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
