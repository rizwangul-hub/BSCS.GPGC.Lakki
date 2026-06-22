import { useState, useEffect } from 'react';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import api from '../../services/api';
import { useCachedGet } from '../../hooks/useCachedGet';
import DashboardLayout from '../../components/DashboardLayout';
import SkeletonLoader from '../../components/SkeletonLoader';
import Modal from '../../components/Modal';
import FileUpload from '../../components/FileUpload';
import { motion } from 'framer-motion';
import {
  HiDocumentReport, HiUpload, HiClock, HiCheckCircle, HiXCircle,
  HiExclamationCircle, HiDownload, HiCalendar, HiStar
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const statusConfig = {
  pending:   { label: 'Pending',   icon: HiClock,            cls: 'text-amber-600 bg-amber-50 border-amber-200' },
  graded:    { label: 'Graded',    icon: HiStar,             cls: 'text-blue-600 bg-blue-50 border-blue-200' },
  submitted: { label: 'Submitted', icon: HiCheckCircle,      cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  late:      { label: 'Late',      icon: HiExclamationCircle,cls: 'text-orange-600 bg-orange-50 border-orange-200' },
  missing:   { label: 'Missing',   icon: HiXCircle,          cls: 'text-red-600 bg-red-50 border-red-200' },
};

const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

const StudentAssignments = () => {
  useDocumentMetadata(
    'My Assignments | GPGC Lakki Marwat',
    'View, submit, and track your assignment submissions across all enrolled subjects.'
  );

  const { data: assignmentsData, loading, refetch } = useCachedGet('/student/assignments');
  const assignments = assignmentsData || [];
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [note, setNote] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileData && !note.trim()) {
      toast.error('Please attach a file or add a note.');
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      if (fileData) form.append('file', fileData);
      if (note.trim()) form.append('note', note);
      const res = await api.post(`/student/assignments/${selected._id}/submit`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success('Assignment submitted successfully!');
        setSelected(null);
        setFileData(null);
        setNote('');
        refetch();
      }
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><SkeletonLoader count={4} /></DashboardLayout>;

  const submitted = assignments.filter((a) => a.mySubmission?.status === 'submitted' || a.mySubmission?.status === 'graded');
  const pending   = assignments.filter((a) => !a.mySubmission || a.mySubmission.status === 'pending');

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-secondary to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HiDocumentReport className="text-primary text-2xl" />
                <h1 className="font-heading font-extrabold text-2xl">My Assignments</h1>
              </div>
              <p className="text-slate-400 text-sm">Track submissions and deadlines for all enrolled subjects.</p>
            </div>
            <div className="flex gap-4 shrink-0">
              {[['Pending', pending.length, 'text-amber-300'], ['Submitted', submitted.length, 'text-emerald-300'], ['Total', assignments.length, 'text-white']].map(([label, val, cls]) => (
                <div key={label} className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">{label}</span>
                  <span className={`block text-2xl font-heading font-bold mt-0.5 ${cls}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <HiDocumentReport className="mx-auto text-5xl text-slate-300 mb-3" />
            <p className="text-text-secondary font-medium">No assignments posted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map((assignment, idx) => {
              const submission = assignment.mySubmission;
              const status = submission?.status || (isOverdue(assignment.dueDate) ? 'missing' : 'pending');
              const cfg = statusConfig[status] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              const overdue = isOverdue(assignment.dueDate) && status === 'pending';
              const canSubmit = status !== 'submitted' && status !== 'graded';

              return (
                <motion.div
                  key={assignment._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow ${overdue ? 'border-red-200' : 'border-slate-200/50'}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-secondary text-base leading-tight truncate">{assignment.title}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">{assignment.subject?.subjectName}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1 shrink-0 ${cfg.cls}`}>
                      <StatusIcon className="text-sm" />
                      {cfg.label}
                    </span>
                  </div>

                  {assignment.description && (
                    <p className="text-xs text-text-secondary mb-4 line-clamp-2">{assignment.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <HiCalendar className="text-slate-400" />
                      <span className={overdue ? 'text-red-600 font-semibold' : ''}>
                        Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No deadline'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {assignment.attachmentUrl && (
                        <a href={assignment.attachmentUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <HiDownload /> Download
                        </a>
                      )}
                      {canSubmit && (
                        <button
                          onClick={() => { setSelected(assignment); setNote(''); setFileData(null); }}
                          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
                        >
                          <HiUpload /> Submit
                        </button>
                      )}
                      {submission?.marks != null && (
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
                          Marks: {submission.marks}
                        </span>
                      )}
                    </div>
                  </div>

                  {submission?.feedback && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                      <p className="text-[10px] font-semibold text-blue-600 uppercase mb-0.5">Teacher Feedback</p>
                      <p className="text-xs text-blue-800">{submission.feedback}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Submit: ${selected?.title}`}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Attach File</label>
            <FileUpload
              accept=".pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.png"
              onFileSelect={(f) => setFileData(f)}
              label="Upload your assignment file"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">Note (optional)</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any note or comment for your teacher..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setSelected(null)}
              className="flex-1 border border-slate-200 text-text-secondary font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default StudentAssignments;
