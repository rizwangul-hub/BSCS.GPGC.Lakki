import { useState, useEffect } from 'react';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useCachedGet } from '../../hooks/useCachedGet';
import DashboardLayout from '../../components/DashboardLayout';
import SkeletonLoader from '../../components/SkeletonLoader';
import { motion } from 'framer-motion';
import { HiClipboardList, HiExclamation, HiCheckCircle, HiInformationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const AttendanceBadge = ({ pct }) => {
  if (pct >= 75) return <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">Good Standing</span>;
  if (pct >= 60) return <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">Warning</span>;
  return <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">Critical (&lt;60%)</span>;
};

const StudentAttendance = () => {
  useDocumentMetadata(
    'My Attendance | GPGC Lakki Marwat',
    'Track your subject-wise attendance records, percentage, and academic standing alerts.'
  );

  const { data: summary, loading } = useCachedGet('/student/attendance');

  if (loading) return <DashboardLayout><SkeletonLoader count={4} /></DashboardLayout>;

  const records = summary?.records || [];
  const overall = summary?.overallPercentage || 0;
  const isLow = overall < 75;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">

        {/* Header */}
        <div className={`rounded-3xl p-6 md:p-8 text-white relative overflow-hidden ${isLow ? 'bg-gradient-to-r from-red-900 to-rose-800' : 'bg-gradient-to-r from-secondary to-slate-800'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HiClipboardList className="text-2xl text-primary" />
                <h1 className="font-heading font-extrabold text-2xl">Attendance Record</h1>
              </div>
              <p className="text-slate-400 text-sm">Subject-wise attendance breakdown for the current semester.</p>
              {isLow && (
                <div className="flex items-center gap-2 mt-3 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-2 w-fit">
                  <HiExclamation className="text-red-300 shrink-0" />
                  <span className="text-red-200 text-xs font-medium">Your attendance is below 75%. You may be barred from exams.</span>
                </div>
              )}
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-center">
                <span className="block text-[10px] text-slate-300 uppercase font-semibold tracking-wide">Overall</span>
                <span className={`block text-3xl font-heading font-bold mt-1 ${isLow ? 'text-red-300' : 'text-primary'}`}>{overall}%</span>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-center">
                <span className="block text-[10px] text-slate-300 uppercase font-semibold tracking-wide">Subjects</span>
                <span className="block text-3xl font-heading font-bold text-white mt-1">{records.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info policy note */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <HiInformationCircle className="text-blue-500 text-xl shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            <strong>Policy:</strong> A minimum of <strong>75%</strong> attendance is required in each subject to be eligible for term examinations. Students below this threshold may face academic sanctions.
          </p>
        </div>

        {/* Subject Attendance Cards */}
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <HiClipboardList className="mx-auto text-5xl text-slate-300 mb-3" />
            <p className="text-text-secondary font-medium">No attendance records found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {records.map((rec, idx) => {
              const pct = rec.attendancePercentage || 0;
              const barClr = pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
              const textClr = pct >= 75 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600';
              return (
                <motion.div
                  key={rec._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-secondary text-base leading-tight">{rec.subject?.subjectName}</h3>
                      {rec.subject?.subjectCode && (
                        <span className="text-[10px] text-text-secondary font-medium">{rec.subject.subjectCode}</span>
                      )}
                    </div>
                    <AttendanceBadge pct={pct} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>Attended: <strong className="text-secondary">{rec.attendedClasses}</strong></span>
                      <span>Total: <strong className="text-secondary">{rec.totalClasses}</strong></span>
                      <span>Missed: <strong className={pct < 75 ? 'text-red-600' : 'text-secondary'}>{(rec.totalClasses || 0) - (rec.attendedClasses || 0)}</strong></span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.07, ease: 'easeOut' }}
                        className={`h-full rounded-full ${barClr}`}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`font-heading font-extrabold text-2xl ${textClr}`}>{pct}%</span>
                      {pct >= 75 ? (
                        <HiCheckCircle className="text-emerald-500 text-xl" />
                      ) : (
                        <HiExclamation className={`text-xl ${pct < 60 ? 'text-red-500' : 'text-amber-500'}`} />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;
