import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useCachedGet } from '../../hooks/useCachedGet';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import Card from '../../components/Card';
import SkeletonLoader from '../../components/SkeletonLoader';
import { 
  HiAcademicCap, HiUserGroup, HiInbox, HiExclamation, 
  HiClipboardList, HiCalendar, HiUpload, HiArrowRight, HiClock
} from 'react-icons/hi';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const TeacherDashboard = () => {
  useDocumentMetadata(
    "Instructor Dashboard | GPGC Lakki Marwat",
    "Assigned subjects, student roster metrics, and sessional actions overview."
  );

  const navigate = useNavigate();

  const { data: stats, loading: statsLoading } = useCachedGet('/teacher/dashboard');
  const { data: subjectsData, loading: subjectsLoading } = useCachedGet('/teacher/subjects');
  const subjects = subjectsData || [];
  const loading = statsLoading || subjectsLoading;

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonLoader count={3} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-8 text-left"
      >
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-secondary">
              Instructor Dashboard
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Academic overview of your CS Department classes, monthly attendance status, and student grades.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => navigate('/teacher/attendance')}>
              <HiCalendar className="mr-2 text-base" /> Attendance Desk
            </Button>
            <Button variant="accent" onClick={() => navigate('/teacher/marks')}>
              <HiClipboardList className="mr-2 text-base" /> Marks Entry Desk
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/assignments')} className="hover:bg-slate-50 border-slate-200">
              <HiUpload className="mr-2 text-base" /> Manage Assignments
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Assigned Subjects" value={stats?.totalSubjects || 0} icon={HiAcademicCap} />
          <StatCard title="Enrolled Students" value={stats?.totalStudents || 0} icon={HiUserGroup} color="text-accent" />
          <StatCard title="Class Complaints" value={stats?.pendingComplaints || 0} icon={HiInbox} color="text-red-500" />
          <StatCard title="Low Attendance Students" value={stats?.lowAttendanceStudents || 0} icon={HiExclamation} color="text-amber-500" />
        </motion.div>

        {/* Dynamic Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Columns - Assigned Subjects */}
          <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading font-extrabold text-base text-secondary">
                Assigned Subject Classes
              </h2>
              <button 
                onClick={() => navigate('/teacher/subjects')}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
              >
                View all subjects <HiArrowRight />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.slice(0, 4).map((sub) => (
                <Card 
                  key={sub._id} 
                  className="p-5 bg-white flex flex-col justify-between border border-slate-100 hover:shadow-md transition-all text-left"
                  hoverEffect={false}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-primary/10 text-primary font-extrabold px-2 py-0.5 rounded-md">
                        {sub.subjectCode}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                        Semester {sub.semester}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-sm text-secondary truncate">
                      {sub.subjectName}
                    </h3>
                  </div>

                  <div className="border-t border-slate-50 pt-3 mt-4 flex justify-between items-center text-xs text-slate-400">
                    <span>Students: <strong>{sub.totalEnrolledStudents}</strong></span>
                    <span>Session: <strong>{sub.academicSession}</strong></span>
                  </div>
                </Card>
              ))}
              
              {subjects.length === 0 && (
                <div className="col-span-2 bg-white border border-slate-200/50 p-8 rounded-xl text-center">
                  <p className="text-xs text-slate-400 font-semibold">No assigned subjects found.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Timeline Action logs */}
          <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-4">
            <h2 className="font-heading font-extrabold text-base text-secondary">
              Recent System Actions
            </h2>

            <Card className="p-6 bg-white border border-slate-100 shadow-sm text-left h-full" hoverEffect={false}>
              {stats?.recentActivities?.length === 0 ? (
                <div className="text-center py-8">
                  <HiClock className="mx-auto text-3xl text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400 italic">No recent system activity logged.</p>
                </div>
              ) : (
                <div className="relative border-l border-slate-100 pl-4 space-y-5">
                  {stats?.recentActivities?.map((act) => (
                    <div key={act._id} className="relative text-xs">
                      {/* Chronological bullet marker */}
                      <span className="absolute -left-[21px] top-0.5 bg-primary h-2 w-2 rounded-full ring-4 ring-white" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-[10px] font-semibold leading-none">
                          {new Date(act.timestamp).toLocaleString()}
                        </span>
                        <p className="font-medium text-slate-700 leading-normal mt-1">
                          {act.action}
                        </p>
                        {act.targetModel && (
                          <span className="text-[9px] uppercase font-bold text-primary/80 mt-1 select-none tracking-wider">
                            {act.targetModel} module
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

        </div>

      </motion.div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
