import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiUserGroup, HiClipboardList, HiCalendar, HiUpload } from 'react-icons/hi';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import SkeletonLoader from '../../components/SkeletonLoader';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const Subjects = () => {
  useDocumentMetadata(
    "My Subjects | Teacher Portal",
    "List of subjects assigned to you in the CS Department."
  );

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/teacher/subjects');
        if (res.data.success) {
          setSubjects(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch assigned subjects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 text-left">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-secondary">
            Assigned Subjects
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Choose a subject to manage student attendance, academic marks, or upload classroom assignments.
          </p>
        </div>

        {loading ? (
          <SkeletonLoader count={3} />
        ) : subjects.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
            <HiAcademicCap className="mx-auto text-4xl text-slate-300 mb-3" />
            <h3 className="font-heading font-bold text-lg text-secondary">No Assigned Subjects</h3>
            <p className="text-sm text-slate-500 mt-1">You are not currently assigned to teach any subjects.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {subjects.map((sub) => (
              <motion.div key={sub._id} variants={cardVariants}>
                <Card 
                  className="p-6 bg-white flex flex-col justify-between h-full border border-slate-100 hover:shadow-xl transition-all duration-300"
                  hoverEffect={true}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="bg-primary/10 h-12 w-12 rounded-xl flex items-center justify-center font-extrabold text-primary border border-primary/20 text-lg">
                        {sub.subjectCode?.slice(-3)}
                      </div>
                      <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-full uppercase">
                        Semester {sub.semester}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-bold text-lg text-secondary line-clamp-2">
                        {sub.subjectName}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Code: <span className="font-semibold">{sub.subjectCode}</span> | Credit Hours: <span className="font-semibold">{sub.creditHours}</span>
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-xs text-text-secondary bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <HiUserGroup className="text-slate-400 text-sm" />
                        Students: <strong>{sub.totalEnrolledStudents}</strong>
                      </span>
                      <span>Session: <strong>{sub.academicSession}</strong></span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5 mt-5 grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/teacher/attendance?subjectId=${sub._id}`)}
                      className="px-2 py-2 text-[11px] justify-center hover:bg-slate-50 border-slate-200"
                    >
                      <HiCalendar className="mr-1 text-sm shrink-0" /> Attendance
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/teacher/marks?subjectId=${sub._id}`)}
                      className="px-2 py-2 text-[11px] justify-center hover:bg-slate-50 border-slate-200"
                    >
                      <HiClipboardList className="mr-1 text-sm shrink-0" /> Marks
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate(`/teacher/assignments?subjectId=${sub._id}`)}
                      className="px-2 py-2 text-[11px] justify-center hover:bg-slate-50 border-slate-200"
                    >
                      <HiUpload className="mr-1 text-sm shrink-0" /> Assignment
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Subjects;
