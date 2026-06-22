import { useState, useEffect } from 'react';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useCachedGet } from '../../hooks/useCachedGet';
import DashboardLayout from '../../components/DashboardLayout';
import SkeletonLoader from '../../components/SkeletonLoader';
import { motion } from 'framer-motion';
import { HiCalendar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
  'bg-orange-100 text-orange-800 border-orange-200',
];

const StudentTimetable = () => {
  useDocumentMetadata(
    'My Timetable | GPGC Lakki Marwat',
    'View your weekly class schedule, subject timing, and room assignments.'
  );

  const { data: slotsData, loading } = useCachedGet('/student/timetable');
  const slots = slotsData || [];

  if (loading) return <DashboardLayout><SkeletonLoader count={4} /></DashboardLayout>;

  // Map subject to consistent color
  const subjectColorMap = {};
  let colorIdx = 0;
  slots.forEach((slot) => {
    const key = slot.subject?.subjectName || slot.subjectName;
    if (key && !subjectColorMap[key]) {
      subjectColorMap[key] = SUBJECT_COLORS[colorIdx % SUBJECT_COLORS.length];
      colorIdx++;
    }
  });

  const slotsByDay = (day) => slots.filter((s) => s.day === day || s.dayOfWeek === day);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <HiCalendar className="text-primary text-2xl" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl">Weekly Timetable</h1>
              <p className="text-slate-400 text-sm mt-0.5">Your scheduled classes for the current semester.</p>
            </div>
          </div>
        </div>

        {slots.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <HiCalendar className="mx-auto text-5xl text-slate-300 mb-3" />
            <p className="text-text-secondary font-medium">No timetable has been published yet.</p>
            <p className="text-xs text-text-secondary mt-1">Contact your department admin for schedule information.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {DAYS.map((day, dIdx) => {
              const daySlots = slotsByDay(day);
              const isToday = today === day;
              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: dIdx * 0.08 }}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${isToday ? 'border-primary' : 'border-slate-200/50'}`}
                >
                  {/* Day header */}
                  <div className={`flex items-center gap-3 px-5 py-3 ${isToday ? 'bg-primary' : 'bg-slate-50 border-b border-slate-200'}`}>
                    <span className={`font-heading font-bold text-sm ${isToday ? 'text-white' : 'text-secondary'}`}>{day}</span>
                    {isToday && <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold">Today</span>}
                    {daySlots.length > 0 && (
                      <span className={`ml-auto text-xs font-semibold ${isToday ? 'text-white/70' : 'text-text-secondary'}`}>
                        {daySlots.length} {daySlots.length === 1 ? 'class' : 'classes'}
                      </span>
                    )}
                  </div>

                  {/* Slots */}
                  <div className="p-4">
                    {daySlots.length === 0 ? (
                      <p className="text-xs text-text-secondary text-center py-3">No classes scheduled</p>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {daySlots
                          .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                          .map((slot, sIdx) => {
                            const subjectName = slot.subject?.subjectName || slot.subjectName || 'Subject';
                            const color = subjectColorMap[subjectName] || SUBJECT_COLORS[0];
                            return (
                              <div
                                key={slot._id || sIdx}
                                className={`flex flex-col rounded-xl border p-3 min-w-[140px] ${color}`}
                              >
                                <span className="font-bold text-xs leading-tight">{subjectName}</span>
                                <span className="text-[10px] opacity-75 mt-1 font-medium">
                                  {slot.startTime} – {slot.endTime}
                                </span>
                                {slot.teacher?.name && (
                                  <span className="text-[10px] opacity-60 mt-0.5">{slot.teacher.name}</span>
                                )}
                                {slot.room && (
                                  <span className="text-[10px] opacity-60 mt-0.5">Room: {slot.room}</span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
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

export default StudentTimetable;
