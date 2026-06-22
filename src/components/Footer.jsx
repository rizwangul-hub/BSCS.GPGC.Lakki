import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaFacebook, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Welcome', href: '#welcome' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Faculty', href: '#faculty' },
    { name: 'Stats', href: '#stats' },
    { name: 'Contact', href: '#contact' },
  ];

  const portals = [
    { name: 'Student Portal', href: '/login' },
    { name: 'Teacher Portal', href: '/login' },
    { name: 'Admin Portal', href: '/login' },
  ];

  return (
    <footer className="bg-secondary text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Info & About */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="bg-primary/20 h-10 w-10 rounded-lg flex items-center justify-center font-bold text-primary text-xl border border-primary/30">
                CS
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-white tracking-tight text-base leading-tight">
                  GPGC Lakki Marwat
                </span>
                <span className="font-body text-xs text-slate-400 leading-none">
                  Computer Science Dept
                </span>
              </div>
            </Link>
            <p className="font-body text-sm text-slate-400 mt-2 leading-relaxed">
              Empowering students through cutting-edge technical education, fostering innovation, and building the next generation of software leaders at Government Post Graduate College Lakki Marwat.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300" aria-label="Facebook">
                <FaFacebook className="text-base" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300" aria-label="Twitter">
                <FaTwitter className="text-base" />
              </a>
              <a href="#" className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300" aria-label="LinkedIn">
                <FaLinkedin className="text-base" />
              </a>
              <a href="https://github.com/rizwangul-hub" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300" aria-label="GitHub">
                <FaGithub className="text-base" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-white text-base mb-6 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-primary">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-3 font-body text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Portals */}
          <div>
            <h3 className="font-heading font-semibold text-white text-base mb-6 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-primary">
              University Portals
            </h3>
            <ul className="flex flex-col gap-3 font-body text-sm">
              {portals.map((portal) => (
                <li key={portal.name}>
                  <Link 
                    to={portal.href}
                    className="text-slate-400 hover:text-primary transition-colors hover:translate-x-1 inline-block transform duration-200"
                  >
                    {portal.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="font-heading font-semibold text-white text-base mb-6 relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-0.5 after:bg-primary">
              Contact Us
            </h3>
            <ul className="flex flex-col gap-4 font-body text-sm text-slate-400">
              <li className="flex gap-3">
                <FaMapMarkerAlt className="text-primary text-base shrink-0 mt-0.5" />
                <span>GPGC Lakki Marwat, Khyber Pakhtunkhwa, Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-primary text-base shrink-0" />
                <span>+92 969 510000</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-primary text-base shrink-0" />
                <a href="mailto:info@gpgclm.edu.pk" className="hover:text-primary transition-colors">
                  info@gpgclm.edu.pk
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits Area */}
        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-slate-500 text-center sm:text-left">
            &copy; {currentYear} GPGC Lakki Marwat. All rights reserved.
          </p>
          <p className="font-body text-xs text-slate-400 text-center sm:text-right bg-slate-800/40 border border-slate-700/50 py-1.5 px-3 rounded-full">
            Developed by <span className="text-primary font-semibold">Rizwan Ullah</span>, Student of Computer Science, GPGC Lakki Marwat.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
