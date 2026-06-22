import { useState, useEffect } from 'react';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useCachedGet } from '../../hooks/useCachedGet';
import DashboardLayout from '../../components/DashboardLayout';
import SkeletonLoader from '../../components/SkeletonLoader';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiDownload, HiTrendingUp, HiStar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const gradeColor = (grade) => {
  switch (grade) {
    case 'A+': case 'A': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'B+': case 'B': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'C+': case 'C': return 'bg-amber-50 text-amber-700 border-amber-200';
    default: return 'bg-red-50 text-red-700 border-red-200';
  }
};

const barColor = (pct) => {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 60) return 'bg-blue-500';
  if (pct >= 45) return 'bg-amber-500';
  return 'bg-red-500';
};

const StudentMarks = () => {
  useDocumentMetadata(
    'My Marks & Grades | GPGC Lakki Marwat',
    'View subject-wise sessional and midterm marks, grade transcript, and academic performance summary.'
  );

  const { data: marksData, loading } = useCachedGet('/student/marks');
  const marks = marksData || [];

  const totalPct = marks.length
    ? Math.round(marks.reduce((a, m) => a + (m.percentage || 0), 0) / marks.length)
    : 0;

  if (loading) return <DashboardLayout><SkeletonLoader count={4} /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HiAcademicCap className="text-primary text-2xl" />
                <h1 className="font-heading font-extrabold text-2xl">Marks & Grades</h1>
              </div>
              <p className="text-slate-400 text-sm">Your subject-wise academic transcript for the current term.</p>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Avg Score</span>
                <span className="block text-2xl font-heading font-bold text-primary mt-0.5">{totalPct}%</span>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Subjects</span>
                <span className="block text-2xl font-heading font-bold text-white mt-0.5">{marks.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Marks Table */}
        {marks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <HiAcademicCap className="mx-auto text-5xl text-slate-300 mb-3" />
            <p className="text-text-secondary font-medium">No marks have been released yet.</p>
            <p className="text-xs text-text-secondary mt-1">Check back after mid-term evaluations.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/50 rounded-2xl shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">#</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">Subject</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-600">Mid (30)</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-600">Sessional (30)</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-600">Total (60)</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-600">%</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-600">Grade</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-600">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marks.map((mark, idx) => (
                    <motion.tr
                      key={mark._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-secondary">{mark.subject?.subjectName}</span>
                        {mark.subject?.subjectCode && (
                          <span className="block text-[10px] text-text-secondary mt-0.5">{mark.subject.subjectCode}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-700">{mark.midMarks ?? '—'}</td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-700">{mark.sessionalTotal ?? '—'}</td>
                      <td className="px-6 py-4 text-center font-heading font-extrabold text-secondary">{mark.grandTotal ?? '—'}</td>
                      <td className="px-6 py-4 text-center text-slate-600">{mark.percentage ?? '—'}%</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center h-8 w-10 rounded-lg font-bold text-sm border ${gradeColor(mark.grade)}`}>
                          {mark.grade || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-28">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${mark.percentage || 0}%` }}
                              transition={{ duration: 0.7, delay: idx * 0.05 }}
                              className={`h-full rounded-full ${barColor(mark.percentage)}`}
                            />
                          </div>
                          <span className="text-[10px] text-text-secondary mt-1 block">{mark.percentage || 0}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100 p-4 gap-4">
              {marks.map((mark, idx) => (
                <motion.div
                  key={mark._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="pt-4 first:pt-0 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-secondary text-sm">{mark.subject?.subjectName}</p>
                      {mark.subject?.subjectCode && <p className="text-[10px] text-text-secondary">{mark.subject.subjectCode}</p>}
                    </div>
                    <span className={`inline-flex items-center justify-center h-9 w-11 rounded-xl font-bold text-sm border ${gradeColor(mark.grade)}`}>
                      {mark.grade || '—'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[['Mid', mark.midMarks, '/30'], ['Sessional', mark.sessionalTotal, '/30'], ['Total', mark.grandTotal, '/60']].map(([label, val, max]) => (
                      <div key={label} className="bg-slate-50 rounded-xl p-2">
                        <span className="block text-[10px] text-text-secondary font-medium">{label}</span>
                        <span className="block font-heading font-bold text-secondary text-sm">{val ?? '—'}<span className="text-[9px] text-text-secondary">{max}</span></span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor(mark.percentage)}`} style={{ width: `${mark.percentage || 0}%` }} />
                    </div>
                    <span className="text-[10px] text-text-secondary mt-0.5 block">{mark.percentage || 0}% score</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentMarks;
