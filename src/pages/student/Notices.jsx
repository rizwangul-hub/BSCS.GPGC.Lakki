import { useState, useEffect } from 'react';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useCachedGet } from '../../hooks/useCachedGet';
import DashboardLayout from '../../components/DashboardLayout';
import SkeletonLoader from '../../components/SkeletonLoader';
import { motion } from 'framer-motion';
import { HiBell, HiSpeakerphone, HiTag, HiCalendar, HiInformationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const priorityConfig = {
  high:   { cls: 'bg-red-50 border-red-200 text-red-700',    dot: 'bg-red-500',    label: 'Urgent' },
  medium: { cls: 'bg-amber-50 border-amber-200 text-amber-700', dot: 'bg-amber-500', label: 'Important' },
  low:    { cls: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500', label: 'Info' },
};

const StudentNotices = () => {
  useDocumentMetadata(
    'Notices & Announcements | GPGC Lakki Marwat',
    'View department notices, exam announcements, and important updates from administration.'
  );

  const { data: noticesData, loading } = useCachedGet('/student/notices');
  const notices = noticesData || [];
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  if (loading) return <DashboardLayout><SkeletonLoader count={5} /></DashboardLayout>;

  const categories = ['all', ...new Set(notices.map((n) => n.category).filter(Boolean))];
  const filtered = filter === 'all' ? notices : notices.filter((n) => n.category === filter);

  const recent = notices.filter((n) => {
    const diff = Date.now() - new Date(n.createdAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000; // within 7 days
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HiBell className="text-primary text-2xl" />
                <h1 className="font-heading font-extrabold text-2xl">Notices & Announcements</h1>
              </div>
              <p className="text-slate-400 text-sm">Latest updates from the Computer Science Department.</p>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">New (7d)</span>
                <span className="block text-2xl font-heading font-bold text-primary mt-0.5">{recent.length}</span>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Total</span>
                <span className="block text-2xl font-heading font-bold text-white mt-0.5">{notices.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`shrink-0 text-xs font-semibold px-4 py-2 rounded-xl border transition-colors capitalize ${
                  filter === cat
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text-secondary border-slate-200 hover:border-primary hover:text-primary'
                }`}
              >
                {cat === 'all' ? 'All Notices' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Notices */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <HiBell className="mx-auto text-5xl text-slate-300 mb-3" />
            <p className="text-text-secondary font-medium">No notices found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((notice, idx) => {
              const priority = notice.priority || 'low';
              const cfg = priorityConfig[priority] || priorityConfig.low;
              const isNew = Date.now() - new Date(notice.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
              const isExpanded = expanded === notice._id;

              return (
                <motion.div
                  key={notice._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-white border border-slate-200/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isExpanded ? null : notice._id)}
                    className="w-full text-left p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${cfg.cls}`}>
                        <HiSpeakerphone className="text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-secondary text-sm leading-tight">{notice.title}</h3>
                          {isNew && (
                            <span className="text-[9px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full uppercase">New</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-[10px] text-text-secondary">
                          <span className="flex items-center gap-1"><HiCalendar />{new Date(notice.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {notice.category && <span className="flex items-center gap-1"><HiTag />{notice.category}</span>}
                          <span className={`flex items-center gap-1 font-semibold ${cfg.cls} border rounded-full px-2 py-0.5`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                      <span className={`text-text-secondary text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 px-5 py-4"
                    >
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{notice.content || notice.description}</p>
                      {notice.attachmentUrl && (
                        <a href={notice.attachmentUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-3">
                          <HiInformationCircle /> View Attachment
                        </a>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentNotices;
