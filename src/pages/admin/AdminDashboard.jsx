import { useState, useEffect } from 'react';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useCachedGet } from '../../hooks/useCachedGet';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import SkeletonLoader from '../../components/SkeletonLoader';
import { 
  HiAcademicCap, HiBell, HiClipboardList, HiUserGroup, 
  HiBan, HiShieldCheck, HiInbox
} from 'react-icons/hi';
import { FaUserTie } from 'react-icons/fa';
// Since we don't have date-fns in package.json (we saw it in package.json earlier), let's use a simple inline date formatter function!
const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const AdminDashboard = () => {
  useDocumentMetadata(
    "Admin Dashboard | GPGC Lakki Marwat",
    "Department administrator central stats panel and recent activities stream."
  );

  const { data: stats, loading } = useCachedGet('/admin/dashboard');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <SkeletonLoader count={3} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 text-left">
        
        {/* Welcome Area */}
        <div className="bg-gradient-to-r from-primary to-accent text-white p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-2">
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl leading-none">
              Welcome back, Administrator
            </h1>
            <p className="font-body text-xs md:text-sm text-slate-100 max-w-xl leading-relaxed">
              Centralized controls for enrollment rosters, class timetables, teacher mappings, and academic sessions audit logs.
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 py-2.5 px-5 rounded-xl font-heading text-xs font-bold whitespace-nowrap">
            System Online
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Total Students" 
            value={stats?.totalStudents || 0}
            icon={HiUserGroup}
            description="Active enrollment in current sessions"
          />
          <StatCard 
            title="Total Teachers" 
            value={stats?.totalTeachers || 0}
            icon={FaUserTie}
            color="text-accent"
            description="Registered subject instructors"
          />
          <StatCard 
            title="Total Subjects" 
            value={stats?.totalSubjects || 0}
            icon={HiAcademicCap}
            color="text-amber-500"
            description="Active courses in BS CS syllabus"
          />
          <StatCard 
            title="Total Complaints" 
            value={stats?.totalComplaints || 0}
            icon={HiInbox}
            color="text-red-500"
            description="Pending student grievance forms"
          />
          <StatCard 
            title="Active Logins" 
            value={stats?.activeUsers || 0}
            icon={HiShieldCheck}
            color="text-green-500"
            description="Validated active portal profiles"
          />
          <StatCard 
            title="Blocked Users" 
            value={stats?.blockedUsers || 0}
            icon={HiBan}
            color="text-slate-600"
            description="Blocked accounts with sessions revoked"
          />
        </div>

        {/* Action stream / Log Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recent Audit Activities */}
          <div className="lg:col-span-8 bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading font-extrabold text-base text-secondary mb-6">
              Recent System Activities
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((log, logIdx) => (
                    <li key={log._id}>
                      <div className="relative pb-8">
                        {logIdx !== stats.recentActivities.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center text-secondary text-sm">
                              {log.module?.slice(0, 1).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-text-primary">
                                {log.action}{' '}
                              </p>
                              <span className="text-xs text-text-secondary">
                                Module: <span className="font-semibold text-secondary capitalize">{log.module}</span>
                              </span>
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-text-secondary">
                              <time dateTime={log.timestamp}>{timeAgo(log.timestamp)}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-text-secondary py-4">No recent system audits recorded.</p>
                )}
              </ul>
            </div>
          </div>

          {/* System Notifications Panel */}
          <div className="lg:col-span-4 bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="font-heading font-extrabold text-base text-secondary">
                System Broadcasts
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                Recent sessional notice updates
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                <HiBell className="text-primary text-xl shrink-0 mt-0.5" />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-xs text-secondary leading-tight">System Backup Complete</span>
                  <span className="text-[10px] text-text-secondary mt-1">Automated replica sets shard synchronized.</span>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl border border-slate-100">
                <HiClipboardList className="text-accent text-xl shrink-0 mt-0.5" />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-xs text-secondary leading-tight">Timetables Mapped</span>
                  <span className="text-[10px] text-text-secondary mt-1">BSCS Semester 3 schedule parsed without conflicts.</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
