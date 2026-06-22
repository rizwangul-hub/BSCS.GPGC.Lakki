import { useState, useEffect } from 'react';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import api from '../../services/api';
import { useCachedGet } from '../../hooks/useCachedGet';
import DashboardLayout from '../../components/DashboardLayout';
import SkeletonLoader from '../../components/SkeletonLoader';
import Modal from '../../components/Modal';
import { motion } from 'framer-motion';
import { HiInbox, HiPlus, HiClock, HiCheckCircle, HiRefresh, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const statusCfg = {
  pending:    { label: 'Pending',     cls: 'text-amber-600 bg-amber-50 border-amber-200',    icon: HiClock },
  reviewing:  { label: 'Reviewing',   cls: 'text-blue-600 bg-blue-50 border-blue-200',       icon: HiRefresh },
  resolved:   { label: 'Resolved',    cls: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: HiCheckCircle },
  rejected:   { label: 'Rejected',    cls: 'text-red-600 bg-red-50 border-red-200',          icon: HiExclamationCircle },
};

const CATEGORIES = ['Academic', 'Administrative', 'Facilities', 'Fee Related', 'Other'];

const StudentComplaints = () => {
  useDocumentMetadata(
    'My Complaints | GPGC Lakki Marwat',
    'Submit and track academic or administrative complaints to department management.'
  );

  const { data: complaintsData, loading, refetch } = useCachedGet('/student/complaints');
  const complaints = complaintsData || [];
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'Academic', description: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/student/complaints', form);
      if (res.data.success) {
        toast.success('Complaint submitted successfully!');
        setShowModal(false);
        setForm({ subject: '', category: 'Academic', description: '' });
        refetch();
      }
    } catch {
      toast.error('Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

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
                <HiInbox className="text-primary text-2xl" />
                <h1 className="font-heading font-extrabold text-2xl">Complaints</h1>
              </div>
              <p className="text-slate-400 text-sm">Submit and track your academic or administrative complaints.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shrink-0"
            >
              <HiPlus className="text-lg" /> New Complaint
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusCfg).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const count = complaints.filter((c) => c.status === key).length;
            return (
              <div key={key} className={`flex items-center gap-3 border rounded-2xl px-4 py-3 ${cfg.cls}`}>
                <Icon className="text-xl shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase opacity-70">{cfg.label}</p>
                  <p className="font-heading font-bold text-lg leading-none">{count}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* List */}
        {complaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <HiInbox className="mx-auto text-5xl text-slate-300 mb-3" />
            <p className="text-text-secondary font-medium">No complaints submitted yet.</p>
            <button onClick={() => setShowModal(true)} className="mt-4 text-sm text-primary font-semibold hover:underline">
              Submit your first complaint
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {complaints.map((complaint, idx) => {
              const cfg = statusCfg[complaint.status] || statusCfg.pending;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={complaint._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-secondary text-base leading-tight">{complaint.subject}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-text-secondary uppercase font-semibold tracking-wide bg-slate-100 px-2 py-0.5 rounded-md">
                          {complaint.category}
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          {new Date(complaint.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold border rounded-full px-3 py-1 shrink-0 ${cfg.cls}`}>
                      <Icon className="text-sm" /> {cfg.label}
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed">{complaint.description}</p>

                  {complaint.adminResponse && (
                    <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-semibold text-emerald-700 uppercase mb-1">Admin Response</p>
                      <p className="text-sm text-emerald-800">{complaint.adminResponse}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Complaint Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Submit New Complaint">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Subject *</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Brief title of your complaint"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">Description *</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your complaint in detail..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 border border-slate-200 text-text-secondary font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default StudentComplaints;
