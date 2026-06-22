import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocumentMetadata from '../hooks/useDocumentMetadata';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import { landingData } from '../data/landingData';
import { toast } from 'react-hot-toast';
import api from '../services/api';

// Background images for hero section
import bg1 from '../assets/background/bg1.jpeg';
import bg2 from '../assets/background/bg2.jpeg';
import bg3 from '../assets/background/bg3.jpeg';
import bg4 from '../assets/background/bg4.jpeg';
import bg5 from '../assets/background/bg5.jpeg';
import bg6 from '../assets/background/bg6.jpeg';
import bg7 from '../assets/background/bg7.jpeg';

// Import faculty and HOD images directly to guarantee correct path resolution in Vite
import irfanImg from '../assets/irfan.jpeg';
import asadImg from '../assets/Asad.jpeg';
import khalilImg from '../assets/khalil.jpeg';
import kifayatImg from '../assets/kifayat.jpeg';

// Import video assets directly for correct path resolution in Vite
import video1 from '../assets/video/video1.mp4';
import video2 from '../assets/video/video2.mp4';
import video3 from '../assets/video/video3.mp4';
import video4 from '../assets/video/video4.mp4';
import video5 from '../assets/video/video5.mp4';
import video6 from '../assets/video/video6.mp4';
import video7 from '../assets/video/video7.mp4';
import video8 from '../assets/video/video8.mp4';

const heroSlides = [
  {
    image: bg1,
    tag: "Department of Computer Science",
    title: "Shaping the Future through Computing",
    description: "Welcome to Government Post Graduate College Lakki Marwat. Empowering students with cutting-edge tech education.",
    buttonText: "Student Portal",
    buttonLink: "/login"
  },
  {
    image: bg2,
    tag: "Academic Affiliation",
    title: "BS 4-Year Degree Program",
    description: "Fully affiliated with the University of Lakki Marwat, providing recognized degrees and standard-compliant curriculum.",
    buttonText: "Student Portal",
    buttonLink: "/login"
  },
  {
    image: bg3,
    tag: "Modern Infrastructure",
    title: "Advanced Computer Labs & Facilities",
    description: "Equipped with high-performance systems, high-speed internet, and modern learning aids for hands-on experience.",
    buttonText: "Student Portal",
    buttonLink: "/login"
  },
  {
    image: bg4,
    tag: "Professional Roster",
    title: "Expert Faculty & Mentors",
    description: "Learn from highly qualified educators and HOD Irfan ul haq dedicated to student success.",
    buttonText: "View Faculty",
    buttonLink: "#faculty"
  },
  {
    image: bg5,
    tag: "Career Opportunities",
    title: "Your Gateway to Global Tech",
    description: "Nurturing skills in software engineering, AI, web development, and cybersecurity to prepare you for the global industry.",
    buttonText: "Student Portal",
    buttonLink: "/login"
  },
  {
    image: bg6,
    tag: "Practical Learning",
    title: "Project-Based Learning Method",
    description: "Build a strong portfolio of real-world web apps, databases, and software projects under direct faculty guidance.",
    buttonText: "Student Portal",
    buttonLink: "/login"
  },
  {
    image: bg7,
    tag: "Student Community",
    title: "Vibrant Academic Environment",
    description: "Join a thriving community of passionate student developers, coding groups, and technological societies.",
    buttonText: "Register Now",
    buttonLink: "/register"
  }
];
import {
  FaGraduationCap,
  FaLaptopCode,
  FaUserTie,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaQuoteLeft,
  FaPaperPlane,
  FaPlay,
  FaTimes
} from 'react-icons/fa';
import {
  HiCollection,
  HiClipboardList,
  HiCalendar,
  HiBell,
  HiDocumentText,
  HiAcademicCap,
  HiUserCircle
} from 'react-icons/hi';

// Map icon strings to actual React components
const iconMap = {
  FaGraduationCap: FaGraduationCap,
  FaLaptopCode: FaLaptopCode,
  FaUserTie: FaUserTie,
  HiUserCircle: HiUserCircle,
  HiClipboardList: HiClipboardList,
  HiCalendar: HiCalendar,
  HiBell: HiBell,
  HiDocumentText: HiDocumentText,
  HiAcademicCap: HiAcademicCap
};

const LandingPage = () => {
  useDocumentMetadata(
    "Computer Science Department | GPGC Lakki Marwat",
    "Welcome to the official portal of the Computer Science Department at Government Post Graduate College Lakki Marwat. Explore academic programs, faculty details, and log in to the student/teacher portal."
  );

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // States
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [currentHeroText, setCurrentHeroText] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeModalVideo, setActiveModalVideo] = useState(null);
  
  const videoScrollRef = useRef(null);

  const campusVideos = [
    {
      src: video1,
      title: "Academic Seminars & Tech Talks",
      description: "Moments from workshops, tech events, and interactive seminars conducted by IT industry experts."
    },
    {
      src: video2,
      title: "Innovative Student Projects",
      description: "Glimpses of cutting-edge web development, software apps, and AI projects built by our students."
    },
    {
      src: video3,
      title: "Green Campus Walkthrough",
      description: "Take a scenic virtual stroll through the beautiful, clean, and green campus of GPGC Lakki Marwat."
    },
    {
      src: video4,
      title: "Advanced Computing Labs",
      description: "A look inside our state-of-the-art computer labs, equipped with high-spec systems and internet access."
    },
    {
      src: video5,
      title: "HOD Welcome Address",
      description: "A motivating video message and guidance to computer science students from HOD Irfan ul haq."
    },
    {
      src: video6,
      title: "Annual Coding Hackathon",
      description: "Exciting moments from our department's annual programming competition and hackathon event."
    },
    {
      src: video7,
      title: "Tech Exhibition & Showcases",
      description: "Students presenting their final year software engineering and web tech projects to visitors."
    },
    {
      src: video8,
      title: "Interactive Classroom Lectures",
      description: "A glance into our modern classrooms and interactive lectures on data structures and algorithms."
    }
  ];

  const scrollVideos = (direction) => {
    if (videoScrollRef.current) {
      const cardWidth = videoScrollRef.current.firstChild.offsetWidth;
      const gap = 24; // gap-6
      const scrollAmount = direction === 'left' ? -(cardWidth + gap) : (cardWidth + gap);
      videoScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Auto-play hero background images every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Delay text changes by 2 seconds relative to the image carousel changes
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setCurrentHeroText(currentHeroImage);
    }, 2000);
    return () => clearTimeout(delayTimer);
  }, [currentHeroImage]);

  // Auto-play testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % landingData.testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await api.post('/contact', contactForm);
      if (res.data.success) {
        toast.success(res.data.message || "Thank you! Your message has been received.");
        setContactForm({ name: '', email: '', message: '' });
      } else {
        toast.error(res.data.message || "Failed to submit message.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred while sending your message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Variants for animation
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col font-body selection:bg-primary/20 selection:text-primary">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Areas */}
      <main className="flex-grow">
        
        {/* Section 1: Hero Section */}
        <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-28 pb-12 md:pt-36 md:pb-20 bg-slate-950">
          {/* Background Image Slider with Crossfade */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence initial={false}>
              <motion.img
                key={currentHeroImage}
                src={heroSlides[currentHeroImage].image}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
            {/* Soft Premium Overlay for Text Legibility and Image Visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/30 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Hero Information with AnimatePresence for text transitions */}
            <div className="flex flex-col gap-6 text-left">
              <div className="min-h-[280px] sm:min-h-[300px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentHeroText}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-6"
                  >
                    <div 
                      className="inline-flex items-center gap-2 bg-primary/20 text-blue-300 border border-primary/30 rounded-full px-4 py-1.5 text-xs font-semibold w-max shadow-sm"
                    >
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      {heroSlides[currentHeroText].tag}
                    </div>

                    <h1 
                      className="font-heading font-extrabold text-white tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-left"
                    >
                      {heroSlides[currentHeroText].title}
                    </h1>

                    <p 
                      className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl text-left font-body"
                    >
                      {heroSlides[currentHeroText].description}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-2 justify-start">
                      <Button 
                        variant="primary" 
                        onClick={() => {
                          const link = heroSlides[currentHeroText].buttonLink;
                          if (link.startsWith('#')) {
                             document.getElementById(link.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            if (isAuthenticated && user) {
                              if (user.role === 'admin') navigate('/admin/dashboard');
                              else if (user.role === 'teacher') navigate('/teacher/profile');
                              else navigate('/student/profile');
                            } else {
                              navigate(link);
                            }
                          }
                        }}
                        className="shadow-lg shadow-primary/20 hover:shadow-primary/30"
                      >
                        {heroSlides[currentHeroText].buttonText}
                      </Button>
                      {!isAuthenticated && heroSlides[currentHeroText].buttonLink === "/login" && (
                        <Button 
                          variant="outline" 
                          onClick={() => navigate('/register')}
                          className="border-slate-700 text-white hover:bg-slate-800"
                        >
                          Register Now
                        </Button>
                      )}
                      {currentHeroText === 0 && (
                        <Button 
                          variant="outline" 
                          onClick={() => document.getElementById('welcome').scrollIntoView({ behavior: 'smooth' })}
                          className="border-slate-700 text-white hover:bg-slate-800"
                        >
                          Explore Department
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Quick Info Badges (Static to prevent layout flashing) */}
              <div 
                className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-8 mt-4"
              >
                <div>
                  <h4 className="font-heading font-bold text-xl text-white">BS CS</h4>
                  <p className="text-xs text-slate-400">4-Year Program</p>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xl text-white">Affiliated</h4>
                  <p className="text-xs text-slate-400">Uni of Lakki Marwat</p>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xl text-white">Modern</h4>
                  <p className="text-xs text-slate-400">Laptops & CS Labs</p>
                </div>
              </div>
            </div>

            {/* Interactive Vector Graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:flex items-center justify-center"
            >
              {/* Glow Behind Graphic */}
              <div className="absolute w-[80%] h-[80%] bg-gradient-to-tr from-primary/10 to-accent/10 rounded-full blur-[80px]" />
              
              <svg viewBox="0 0 500 500" className="w-full max-w-[450px] relative z-10 filter drop-shadow-2xl">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>
                </defs>
                {/* Floating Tech Blobs & Nodes */}
                <motion.circle 
                  cx="120" cy="100" r="15" fill="#06B6D4" opacity="0.6"
                  animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                />
                <motion.circle 
                  cx="400" cy="380" r="25" fill="#2563EB" opacity="0.4"
                  animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                />
                <motion.circle 
                  cx="420" cy="120" r="8" fill="#F59E0B"
                  animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                />
                
                {/* Connecting Lines / Network Grid */}
                <path d="M 120 100 L 250 200 L 420 120 M 250 200 L 400 380 L 150 400 L 250 200" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="5,5" fill="none" opacity="0.6" />
                
                {/* Laptop / Dashboard Body */}
                <rect x="90" y="160" width="320" height="200" rx="16" fill="url(#grad2)" stroke="#334155" strokeWidth="6" />
                
                {/* Screen content */}
                <rect x="106" y="176" width="288" height="150" rx="8" fill="#020617" />
                
                {/* Dashboard UI mock items */}
                <rect x="120" y="192" width="100" height="12" rx="4" fill="#1E293B" />
                <rect x="120" y="212" width="70" height="8" rx="3" fill="#334155" />
                <rect x="120" y="228" width="50" height="8" rx="3" fill="#334155" />
                
                {/* Dashboard Chart Mock */}
                <path d="M 240 300 L 270 260 L 300 280 L 330 220 L 360 250" fill="none" stroke="url(#grad1)" strokeWidth="4" strokeLinecap="round" />
                <circle cx="270" cy="260" r="4" fill="#06B6D4" />
                <circle cx="330" cy="220" r="4" fill="#2563EB" />
                
                {/* Code snippets */}
                <text x="120" y="270" fill="#22C55E" fontFamily="monospace" fontSize="10">&lt;Code /&gt;</text>
                <text x="120" y="290" fill="#64748B" fontFamily="monospace" fontSize="8">const app = express();</text>
                <text x="120" y="302" fill="#64748B" fontFamily="monospace" fontSize="8">db.connect(dbURI);</text>
                
                {/* Laptop Base */}
                <path d="M 60 360 L 440 360 L 420 380 L 80 380 Z" fill="#E2E8F0" />
                <rect x="220" y="360" width="60" height="6" rx="3" fill="#94A3B8" />

                {/* Floating Shield (Cybersecurity) */}
                <motion.g 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                >
                  <path d="M 330 90 L 370 70 L 410 90 L 410 130 C 410 160 370 180 370 180 C 370 180 330 160 330 130 Z" fill="url(#grad1)" opacity="0.9" />
                  {/* Shield Tick */}
                  <path d="M 355 125 L 367 137 L 387 115" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </motion.g>
              </svg>
            </motion.div>
          </div>
        </section>

        {/* Section 2: Welcome Message */}
        <section id="welcome" className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Image / Icon container */}
              <div className="lg:col-span-5 relative">
                <div className="absolute inset-0 bg-primary/5 rounded-3xl transform rotate-3" />
                <div className="relative bg-gradient-to-br from-secondary to-slate-900 text-white rounded-3xl p-8 shadow-xl overflow-hidden">
                  <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[80px]" />
                  <FaQuoteLeft className="text-primary/20 text-7xl absolute top-6 left-6" />
                  
                  <div className="relative z-10 flex flex-col gap-6">
                    <p className="font-heading italic text-lg leading-relaxed text-slate-300 pt-8">
                      "{landingData.welcomeMessage.hod.quote}"
                    </p>
                    <div className="flex items-center gap-4 mt-4 pt-6 border-t border-slate-800">
                      <div className="h-14 w-14 rounded-full overflow-hidden border border-primary/30 shrink-0">
                        <img 
                          src={irfanImg} 
                          alt={landingData.welcomeMessage.hod.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-heading font-bold text-white leading-tight">
                          {landingData.welcomeMessage.hod.name}
                        </span>
                        <span className="text-xs text-slate-400 capitalize">
                          {landingData.welcomeMessage.hod.designation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                <div className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1 text-xs font-semibold w-max">
                  HOD Message
                </div>
                <h2 className="font-heading font-extrabold text-secondary tracking-tight text-3xl sm:text-4xl">
                  {landingData.welcomeMessage.title}
                </h2>
                <p className="text-text-secondary font-body leading-relaxed text-base sm:text-lg">
                  {landingData.welcomeMessage.message}
                </p>
                <div className="flex items-center gap-6 mt-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-secondary text-2xl">10+ Years</span>
                    <span className="text-xs text-text-secondary">Legacy of Excellence</span>
                  </div>
                  <div className="h-10 w-[1px] bg-slate-200" />
                  <div className="flex flex-col">
                    <span className="font-bold text-secondary text-2xl">400+</span>
                    <span className="text-xs text-text-secondary">Graduated Engineers</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 3: About, Vision & Mission */}
        <section id="about" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3 items-center">
              <span className="bg-accent/10 text-accent border border-accent/20 rounded-full px-4 py-1 text-xs font-semibold w-max">
                Our Foundation
              </span>
              <h2 className="font-heading font-extrabold text-secondary tracking-tight text-3xl sm:text-4xl">
                Vision, Mission & Values
              </h2>
              <p className="text-text-secondary text-sm sm:text-base">
                Understanding the philosophy and principles guiding our computer science education journey.
              </p>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {landingData.visionMission.map((item, index) => {
                const IconComponent = iconMap[item.icon] || FaGraduationCap;
                return (
                  <Card key={index} className="flex flex-col items-start gap-4 p-8 text-left bg-white relative overflow-hidden group">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="text-2xl" />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-secondary mt-2">
                      {item.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 4: Academic Features Grid */}
        <section id="features" className="py-24 bg-white border-y border-slate-100 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3 items-center">
              <span className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1 text-xs font-semibold w-max">
                ERP Features
              </span>
              <h2 className="font-heading font-extrabold text-secondary tracking-tight text-3xl sm:text-4xl">
                Integrated Academic Suite
              </h2>
              <p className="text-text-secondary text-sm sm:text-base">
                Our custom MERN ERP empowers student governance, teacher operations, and admin workflows seamlessly.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {landingData.features.map((feature, index) => {
                const IconComponent = iconMap[feature.icon] || HiCollection;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-left flex flex-col justify-between group hover:bg-white hover:border-slate-200 hover:shadow-xl transition-all duration-300"
                  >
                    <div>
                      <div className="bg-slate-200/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors text-slate-700 h-12 w-12 rounded-xl flex items-center justify-center mb-6">
                        <IconComponent className="text-2xl" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-secondary mb-3 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-text-secondary text-sm leading-relaxed mb-6">
                        {feature.description}
                      </p>
                    </div>
                    
                    <a
                      href={feature.link}
                      className="font-body text-xs font-semibold text-primary hover:text-blue-700 flex items-center gap-1.5"
                    >
                      Access Dashboard
                      <span className="transform group-hover:translate-x-1 transition-transform inline-block">&rarr;</span>
                    </a>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 5: Faculty Highlights */}
        <section id="faculty" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3 items-center">
              <span className="bg-accent/10 text-accent border border-accent/20 rounded-full px-4 py-1 text-xs font-semibold w-max">
                Our Instructors
              </span>
              <h2 className="font-heading font-extrabold text-secondary tracking-tight text-3xl sm:text-4xl">
                CS Faculty Highlights
              </h2>
              <p className="text-text-secondary text-sm sm:text-base">
                Meet our dedicated lecturers and assistant professors driving academic brilliance at GPGC.
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {landingData.faculty.map((member, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col items-center p-6 text-center group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-28 w-28 rounded-full overflow-hidden mb-5 border-4 border-slate-100 group-hover:border-primary/20 transition-all duration-300 shrink-0">
                    <img 
                      src={
                        member.name.toLowerCase() === "irfan ul haq" ? irfanImg :
                        member.name.toLowerCase() === "muhammad khalil khan" ? khalilImg :
                        member.name.toLowerCase() === "kifayat ullah" ? kifayatImg :
                        member.name.toLowerCase() === "asad khan" ? asadImg :
                        member.avatar
                      } 
                      alt={member.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-heading font-bold text-base text-secondary leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-xs text-primary font-semibold mt-1">
                    {member.role}
                  </p>
                  
                  <div className="border-t border-slate-100 w-full mt-4 pt-4 text-xs text-text-secondary flex flex-col gap-1.5 items-center">
                    <span><strong>Degree:</strong> {member.qualification}</span>
                    <span><strong>Spec:</strong> {member.specialization}</span>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Statistics Counters */}
        <section id="stats" className="py-20 bg-secondary text-white relative overflow-hidden border-y border-slate-800">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {landingData.statistics.map((stat, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <span className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-primary leading-none">
                    {stat.value}{stat.suffix}
                  </span>
                  <span className="font-body text-xs sm:text-sm text-slate-400 mt-2 tracking-wide uppercase font-semibold">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6.5: Campus Reels Section */}
        <section id="campus-reels" className="py-24 bg-slate-50 border-b border-slate-100 relative overflow-hidden group">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3 items-center">
              <span className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1 text-xs font-semibold w-max">
                Campus Life
              </span>
              <h2 className="font-heading font-extrabold text-secondary tracking-tight text-3xl sm:text-4xl">
                Departmental Reels & Visual Highlights
              </h2>
              <p className="text-text-secondary text-sm sm:text-base">
                Explore life at the Computer Science Department. Hover over a reel to play the preview, and click to view full screen.
              </p>
            </div>

            {/* Slider Container with Navigation Buttons */}
            <div className="relative mt-12 px-2">
              {/* Left Arrow Button */}
              <button 
                onClick={() => scrollVideos('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 lg:-translate-x-6 h-12 w-12 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:scale-105 shadow-md flex items-center justify-center z-30 transition-all opacity-0 group-hover:opacity-100 hidden md:flex cursor-pointer"
                aria-label="Scroll Left"
              >
                <FaChevronLeft className="text-sm" />
              </button>

              {/* Right Arrow Button */}
              <button 
                onClick={() => scrollVideos('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 lg:translate-x-6 h-12 w-12 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:scale-105 shadow-md flex items-center justify-center z-30 transition-all opacity-0 group-hover:opacity-100 hidden md:flex cursor-pointer"
                aria-label="Scroll Right"
              >
                <FaChevronRight className="text-sm" />
              </button>

              {/* Horizontal Scroll Area */}
              <div 
                ref={videoScrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-4"
              >
                {campusVideos.map((video, index) => (
                  <div 
                    key={index}
                    className="relative aspect-[9/16] w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-200/20 group/card cursor-pointer hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 snap-start shrink-0"
                    onMouseEnter={(e) => {
                      const videoEl = e.currentTarget.querySelector('video');
                      if (videoEl) videoEl.play().catch(() => {});
                    }}
                    onMouseLeave={(e) => {
                      const videoEl = e.currentTarget.querySelector('video');
                      if (videoEl) {
                        videoEl.pause();
                        videoEl.currentTime = 0;
                      }
                    }}
                    onClick={() => setActiveModalVideo(video.src)}
                  >
                    <video 
                      src={video.src} 
                      muted 
                      loop 
                      playsInline 
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/85 z-10" />

                    {/* Play Button Icon Overlay (Fades out on hover) */}
                    <div className="absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-300 group-hover/card:opacity-0">
                      <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-lg shadow-lg transform group-hover/card:scale-110 transition-transform duration-300">
                        <FaPlay className="ml-0.5 text-white" />
                      </div>
                    </div>

                    {/* Video Info (at the bottom) */}
                    <div className="absolute bottom-0 inset-x-0 p-6 z-20 text-left flex flex-col gap-1.5">
                      <span className="inline-flex items-center gap-1 bg-primary/80 backdrop-blur-sm text-[9px] text-white px-2 py-0.5 rounded-full w-max font-semibold tracking-wider uppercase">
                        Campus Reel
                      </span>
                      <h3 className="font-heading font-extrabold text-white text-base tracking-tight leading-tight">
                        {video.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-normal line-clamp-2 font-body">
                        {video.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Testimonials Carousel */}
        <section id="testimonials" className="py-24 bg-white border-b border-slate-100 overflow-hidden relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-3 items-center">
              <span className="bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1 text-xs font-semibold w-max">
                Alumni Feedback
              </span>
              <h2 className="font-heading font-extrabold text-secondary tracking-tight text-3xl sm:text-4xl">
                What Our Students Say
              </h2>
            </div>

            {/* Testimonials Slider Area */}
            <div className="min-h-[220px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-6"
                >
                  <FaQuoteLeft className="text-primary/20 text-5xl" />
                  <p className="text-lg sm:text-xl font-body leading-relaxed text-text-secondary max-w-2xl italic">
                    "{landingData.testimonials[activeTestimonial].quote}"
                  </p>
                  
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(landingData.testimonials[activeTestimonial].rating)].map((_, i) => (
                      <FaStar key={i} className="text-xs" />
                    ))}
                  </div>

                  <div className="flex flex-col items-center mt-2">
                    <span className="font-heading font-bold text-secondary text-base">
                      {landingData.testimonials[activeTestimonial].author}
                    </span>
                    <span className="text-xs text-text-secondary mt-0.5">
                      {landingData.testimonials[activeTestimonial].role}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Manual Controls */}
            <div className="flex items-center justify-center gap-4 mt-10">
              <button 
                onClick={() => setActiveTestimonial((prev) => (prev === 0 ? landingData.testimonials.length - 1 : prev - 1))}
                className="h-10 w-10 border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center"
                aria-label="Previous Testimonial"
              >
                <FaChevronLeft className="text-sm" />
              </button>
              <div className="flex items-center gap-1.5">
                {landingData.testimonials.map((_, index) => (
                  <button 
                    key={index} 
                    onClick={() => setActiveTestimonial(index)}
                    className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${activeTestimonial === index ? 'bg-primary w-6' : 'bg-slate-200'}`}
                    aria-label={`Testimonial slide ${index + 1}`}
                  />
                ))}
              </div>
              <button 
                onClick={() => setActiveTestimonial((prev) => (prev + 1) % landingData.testimonials.length)}
                className="h-10 w-10 border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center"
                aria-label="Next Testimonial"
              >
                <FaChevronRight className="text-sm" />
              </button>
            </div>
          </div>
        </section>

        {/* Section 8: Contact & Form */}
        <section id="contact" className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              
              {/* Info Column */}
              <div className="flex flex-col gap-6 text-left">
                <span className="bg-accent/10 text-accent border border-accent/20 rounded-full px-4 py-1 text-xs font-semibold w-max">
                  Get In Touch
                </span>
                <h2 className="font-heading font-extrabold text-secondary tracking-tight text-3xl sm:text-4xl">
                  Contact Our Department
                </h2>
                <p className="text-text-secondary text-base leading-relaxed">
                  Have questions about admissions, programs, or technical portal access? Reach out to our campus office and we will respond promptly.
                </p>

                {/* Map Illustration / Location info card */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm overflow-hidden flex flex-col gap-6 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 h-10 w-10 rounded-lg flex items-center justify-center text-primary font-bold">
                      @
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-secondary text-sm">Official Address</h4>
                      <p className="text-xs text-text-secondary">GPGC Lakki Marwat, Khyber Pakhtunkhwa, Pakistan</p>
                    </div>
                  </div>

                  {/* Google Maps Interactive Embed */}
                  <div className="h-44 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.8364867451387!2d70.90693247556778!3d32.60338307393437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392131976a213e8d%3A0x8898166c3a115865!2sGovernment%20Post%20Graduate%20College%20Lakki%20Marwat!5e0!3m2!1sen!2s!4v1719000000000" 
                      className="w-full h-full border-0"
                      allowFullScreen="" 
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="GPGC Lakki Marwat Google Map"
                    ></iframe>
                  </div>
                </div>
              </div>

              {/* Form Column */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-8 md:p-10 shadow-lg relative">
                <h3 className="font-heading font-bold text-2xl text-secondary mb-6 text-left">
                  Send A Message
                </h3>
                <form onSubmit={handleContactSubmit} className="flex flex-col gap-6 text-left">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                      Full Name
                    </label>
                    <input 
                      id="name"
                      type="text" 
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Rizwan Ullah"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-primary transition-colors text-sm text-secondary bg-slate-50/50"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                      Email Address
                    </label>
                    <input 
                      id="email"
                      type="email" 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="e.g. student@gpgclm.edu.pk"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-primary transition-colors text-sm text-secondary bg-slate-50/50"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                      Your Message
                    </label>
                    <textarea 
                      id="message"
                      rows="4" 
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Type your message here..."
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-primary transition-colors text-sm text-secondary bg-slate-50/50"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="primary" 
                    loading={isSubmitting}
                    className="w-full py-3 justify-center shadow-lg shadow-primary/20"
                  >
                    <FaPaperPlane className="mr-2 text-xs" />
                    Send Message
                  </Button>
                </form>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Section 9: Footer Component */}
      <Footer />

      {/* Fullscreen Video Modal Overlay */}
      <AnimatePresence>
        {activeModalVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModalVideo(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 cursor-pointer"
          >
            {/* Close button at top right */}
            <button 
              onClick={() => setActiveModalVideo(null)} 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-50 focus:outline-none cursor-pointer"
              aria-label="Close video player"
            >
              <FaTimes className="text-2xl" />
            </button>

            {/* Video container */}
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-md w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 mx-auto cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <video 
                src={activeModalVideo} 
                autoPlay 
                controls 
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
