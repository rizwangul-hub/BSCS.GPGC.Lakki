import { HiCollection, HiClipboardList, HiCalendar, HiBell, HiDocumentText, HiAcademicCap } from 'react-icons/hi';
import { FaGraduationCap, FaUserTie, FaLaptopCode } from 'react-icons/fa';
import khalil from '../assets/khalil.jpeg';
import kifayat from '../assets/kifayat.jpeg';
import Asad from '../assets/Asad.jpeg';
import irfan from '../assets/irfan.jpeg';

export const landingData = {
  welcomeMessage: {
    title: "Welcome to the Department of Computer Science",
    subtitle: "Government Post Graduate College Lakki Marwat",
    message: "Welcome to the digital gateway of the Computer Science Department at Government Post Graduate College Lakki Marwat. Our department stands at the forefront of technological innovation and academic excellence. We are dedicated to nurturing creative thinkers, skilled software developers, and future tech leaders. Through a balanced curriculum of theory and practice, state-of-the-art facilities, and experienced mentorship, we prepare our students to excel in the rapidly evolving global tech landscape.",
    hod: {
      name: "Irfan ul haq",
      designation: "Head of Computer Science Department",
      avatar: {irfan},
      quote: "Our mission is to cultivate logical thinking and technological prowess in our students, enabling them to construct innovative solutions for tomorrow's complex challenges."
    }
  },
  
  visionMission: [
    {
      title: "Our Vision",
      description: "To be a center of excellence in computer science education, recognized for producing technically competent, socially responsible, and innovative computing professionals who can lead the digital transformation of society.",
      icon: "FaGraduationCap",
      color: "from-blue-600 to-indigo-600"
    },
    {
      title: "Our Mission",
      description: "To deliver high-quality, comprehensive computer education that combines theoretical foundations with practical application, to foster innovation and research mindsets, and to inculcate ethical values and leadership skills.",
      icon: "FaLaptopCode",
      color: "from-cyan-500 to-teal-500"
    },
    {
      title: "Core Values",
      description: "We are committed to academic integrity, inclusive learning environment, hands-on industrial preparedness, continuous adaptation to emerging technologies, and ethical responsibility in technology application.",
      icon: "FaUserTie",
      color: "from-indigo-600 to-purple-600"
    }
  ],

  features: [
    {
      title: "Student Portal Access",
      description: "Personalized dashboard for students to check academic records, transcripts, profile details, and fees status anytime.",
      icon: "HiUserCircle",
      link: "/login"
    },
    {
      title: "Real-time Attendance Tracker",
      description: "Check your subject-wise daily attendance records, percentages, and status alerts to maintain university compliance.",
      icon: "HiClipboardList",
      link: "/login"
    },
    {
      title: "Digital Timetables",
      description: "Access dynamically updated schedules of classes, lab sessions, and exam timetables mapped directly to your semester.",
      icon: "HiCalendar",
      link: "/login"
    },
    {
      title: "Instant Noticeboard",
      description: "Stay informed with real-time push notifications and announcements from the department HOD and college admin.",
      icon: "HiBell",
      link: "/login"
    },
    {
      title: "Assignments & Submissions",
      description: "Download assignments uploaded by teachers, track submission deadlines, and review teacher grading and feedback.",
      icon: "HiDocumentText",
      link: "/login"
    },
    {
      title: "Online Marks & GPA",
      description: "Access detailed mid-term, final-term, and practical marks analysis charts with semester GPA and CGPA metrics.",
      icon: "HiAcademicCap",
      link: "/login"
    }
  ],

  faculty: [
    {
      name: "Irfan UL Haq",
      role: "Head of Computer Science Department",
      qualification: "MSc in Computer Science",
      specialization: "Programming Languages",
      avatar: {irfan}
    },
    {
      name: "Muhammad Khalil Khan",
      role: "Professor",
      qualification: "MSc in Computer Science",
      specialization: "Artificial Intelligence (Augmented Reality)",
      avatar: {khalil}
    },
    {
      name: "Kifayat Ullah",
      role: "Professor",
      qualification: "MSc in Computer Science",
      specialization: "DataBase Management Systems",
      avatar: {kifayat}
    },
    {
      name: "Asad Khan",
      role: "Professor",
      qualification: "MSc in Computer Science",
      specialization: "Cyber Security",
      avatar: {Asad}
    }
  ],

  statistics: [
    { value: 450, suffix: "+", label: "Active Students" },
    { value: 8, suffix: "", label: "Expert Faculty" },
    { value: 4, suffix: "", label: "Undergrad Programs" },
    { value: 98, suffix: "%", label: "Graduation Rate" }
  ],

  testimonials: [
    {
      quote: "The computer science department provided me with a strong foundation in programming and software engineering. The teachers are incredibly supportive and push us to solve real-world problems.",
      author: "Adnan Shah",
      role: "Software Engineer at TechSolutions (Alumnus 2024)",
      rating: 5
    },
    {
      quote: "The new digital student portal is a game changer. We can track our daily attendance, exam marks, and download resources instantly. It makes university life much more organized.",
      author: "Sajid Afridi",
      role: "BS Computer Science (Final Year Student)",
      rating: 5
    },
    {
      quote: "Having access to state-of-the-art computer labs and hands-on coding practice built my confidence. The practical projects we did in class helped me secure my first web developer job.",
      author: "Faisal Rehman",
      role: "Frontend Developer (Alumnus 2025)",
      rating: 5
    }
  ]
};
