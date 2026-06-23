import { useState, useEffect } from 'react';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useCachedGet } from '../../hooks/useCachedGet';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import { HiAcademicCap, HiCalendar, HiClipboardList, HiShieldCheck } from 'react-icons/hi';
import { FaGraduationCap } from 'react-icons/fa';

const StudentDashboard = () => {
  useDocumentMetadata(
    "Student Portal | GPGC Lakki Marwat",
    "Student academic profile, term sessional marks transcript, and class attendance logs."
  );

  const { data, loading } = useCachedGet('/student/dashboard');

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonLoader count={3} />
      </DashboardLayout>
    );
  }

  const profile = data?.profile;
  const semesterInfo = data?.semesterInfo;
  const attendance = data?.attendanceSummary;
  const marks = data?.marksSummary || [];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 text-left">
        
        {/* Profile Card & Info banner */}
        <div className="bg-gradient-to-r from-secondary to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="h-20 w-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-3xl shrink-0">
            {profile?.name?.slice(0, 2).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="font-heading font-extrabold text-2xl leading-none">{profile?.name}</h1>
            <p className="text-sm text-slate-400 font-medium">Department: {profile?.department || 'Computer Science'}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 justify-center md:justify-start text-xs text-slate-400">
              <span>Reg: <strong>{profile?.registrationNumber}</strong></span>
              <span className="hidden sm:inline">|</span>
              <span>Roll: <strong>{profile?.rollNumber}</strong></span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Semester</span>
              <span className="block text-xl font-heading font-bold text-primary">{semesterInfo?.semester}</span>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Session</span>
              <span className="block text-sm font-semibold text-slate-200 mt-1">{semesterInfo?.academicSession}</span>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard 
            title="Attendance Rate" 
            value={attendance?.overallPercentage || 0}
            suffix="%"
            icon={HiClipboardList}
            color={attendance?.overallPercentage < 75 ? 'text-red-500' : 'text-green-500'}
            description={attendance?.overallPercentage < 75 ? 'Warning: Low attendance (<75%)' : 'Good standing'}
          />
          <StatCard 
            title="Syllabus Subjects" 
            value={semesterInfo?.subjects?.length || 0}
            icon={HiCalendar}
            color="text-accent"
            description="Enrolled in current term"
          />
          <StatCard 
            title="Grades Released" 
            value={marks.length}
            icon={HiAcademicCap}
            color="text-amber-500"
            description="Released course grades"
          />
        </div>

        {/* Subjects & Marks Transcript */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Attendance progress list */}
          <div className="lg:col-span-6 bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-heading font-extrabold text-base text-secondary">
              Subject-wise Attendance
            </h3>
            
            <div className="flex flex-col gap-6">
              {attendance?.records && attendance.records.length > 0 ? (
                attendance.records.map((rec) => (
                  <div key={rec._id} className="space-y-2 text-left">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-secondary">{rec.subject?.subjectName}</span>
                      <span className={`font-semibold ${rec.lowAttendance ? 'text-red-500 font-bold' : 'text-slate-600'}`}>
                        {rec.attendedClasses}/{rec.totalClasses} ({rec.attendancePercentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          rec.lowAttendance ? 'bg-red-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${rec.attendancePercentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-secondary py-4 text-center">No attendance reports uploaded yet.</p>
              )}
            </div>
          </div>

          {/* Sessional / Mid Marks list */}
          <div className="lg:col-span-6 bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <h3 className="font-heading font-extrabold text-base text-secondary">
              Course Transcript (Out of 50)
            </h3>
            
            <div className="divide-y divide-slate-100 flex flex-col">
              {marks.length > 0 ? (
                marks.map((mark) => (
                  <div key={mark._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-left">
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="font-bold text-sm text-secondary truncate">{mark.subject?.subjectName}</span>
                      <span className="text-[10px] text-text-secondary leading-none">
                        Mid: <strong>{mark.midMarks}</strong> | Sessional: <strong>{mark.sessionalTotal}</strong>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right flex flex-col items-end">
                        <span className="font-heading font-extrabold text-base text-secondary">
                          {mark.grandTotal} <span className="text-xs text-text-secondary">/50</span>
                        </span>
                        <span className="text-[10px] text-text-secondary mt-0.5">{mark.percentage}%</span>
                      </div>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                        mark.grade === 'A' ? 'bg-green-50 border-green-200 text-green-600' :
                        mark.grade === 'B' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                        mark.grade === 'C' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                        'bg-red-50 border-red-200 text-red-600'
                      }`}>
                        {mark.grade}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-secondary py-8 text-center">No sessional transcripts released yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
