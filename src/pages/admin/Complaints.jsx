import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiInbox, HiChatAlt2, HiCheckCircle, HiExclamationCircle, HiUserCircle } from 'react-icons/hi';
import { useCachedGet, invalidateCache } from '../../hooks/useCachedGet';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import SkeletonLoader from '../../components/SkeletonLoader';
import { toast } from 'react-hot-toast';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';

const Complaints = () => {
  useDocumentMetadata(
    "Complaints Box | Admin Panel",
    "Grievance board: reply to student issues and resolve complaints system-wide."
  );

  // States
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'resolved'
  
  // Reply Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Fetch complaints using cache
  const { data: complaintsData, loading, refetch: refetchComplaints } = useCachedGet('/admin/complaints');
  const complaints = complaintsData || [];

  const handleOpenComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setReplyText(complaint.reply || '');
    setIsModalOpen(true);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Please enter a response message.');
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await api.post(`/admin/complaints/${selectedComplaint._id}/reply`, {
        reply: replyText,
        status: 'resolved'
      });

      if (res.data.success) {
        toast.success('Reply submitted. Complaint marked as resolved.');
        setIsModalOpen(false);
        invalidateCache('/admin/complaints');
        refetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit response.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredComplaints = complaints.filter(c => c.status === activeTab);
  const pendingCount = complaints.filter(c => c.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 text-left">
        
        {/* Header */}
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-secondary">
            Grievance & Complaints Box
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Review student grievances submitted to the administration and post resolution details.
          </p>
        </div>

        {/* Status Tab Switchers */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-secondary'
            }`}
          >
            Pending Complaints
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-bounce">
                {pendingCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'resolved'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-secondary'
            }`}
          >
            Resolved History
          </button>
        </div>

        {/* List Content */}
        {loading ? (
          <SkeletonLoader count={3} />
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
            <HiInbox className="mx-auto text-4xl text-slate-300 mb-3" />
            <h3 className="font-heading font-bold text-lg text-secondary">Complaints Box Empty</h3>
            <p className="text-sm text-slate-500 mt-1">No student grievances currently listed under this folder.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredComplaints.map((c) => (
                <motion.div
                  key={c._id}
                  layout
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="p-6 bg-white border border-slate-100 flex flex-col justify-between h-full hover:shadow-lg transition-all"
                    hoverEffect={false}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 text-sm border border-slate-200">
                            {c.student?.name?.slice(0,2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-secondary leading-none mb-1">
                              {c.student?.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Roll: {c.student?.rollNumber}
                            </span>
                          </div>
                        </div>

                        {c.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-100 uppercase">
                            <HiExclamationCircle className="text-amber-500 text-sm" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100 uppercase">
                            <HiCheckCircle className="text-emerald-500 text-sm" /> Resolved
                          </span>
                        )}
                      </div>

                      <div className="bg-slate-50 border border-slate-100/50 p-4 rounded-xl">
                        <p className="text-xs text-text-secondary line-clamp-3 italic">
                          "{c.message}"
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center text-xs text-slate-400">
                      <span>Posted: {new Date(c.createdAt).toLocaleDateString()}</span>
                      <Button 
                        variant={c.status === 'pending' ? 'primary' : 'outline'}
                        onClick={() => handleOpenComplaint(c)}
                        className="px-3 py-1.5 text-xs font-bold gap-1 justify-center"
                      >
                        <HiChatAlt2 className="text-sm shrink-0" />
                        {c.status === 'pending' ? 'Reply & Resolve' : 'View Thread'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Complaint Reply Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedComplaint?.status === 'pending' ? "Address Student Grievance" : "Grievance Correspondence Thread"}
      >
        {selectedComplaint && (
          <form onSubmit={handleReplySubmit} className="flex flex-col gap-4 text-left">
            {/* Student card info */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
              <HiUserCircle className="text-slate-400 text-4xl" />
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-secondary">{selectedComplaint.student?.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Reg: {selectedComplaint.student?.registrationNumber} | Roll: {selectedComplaint.student?.rollNumber}
                </span>
              </div>
            </div>

            {/* Student Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Grievance Message</label>
              <div className="p-3 bg-red-50/30 text-xs text-secondary rounded-lg border border-red-100/50 italic">
                "{selectedComplaint.message}"
              </div>
            </div>

            {/* Reply Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {selectedComplaint.status === 'pending' ? "Draft Reply Text" : "Admin Reply"}
              </label>
              {selectedComplaint.status === 'pending' ? (
                <textarea
                  rows="4"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Explain resolution actions or clarifications..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-sm bg-slate-50/50"
                  required
                />
              ) : (
                <div className="p-3 bg-emerald-50/20 text-xs text-secondary rounded-lg border border-emerald-100/50">
                  {selectedComplaint.reply}
                  <span className="block text-[9px] text-slate-400 mt-2 font-semibold">
                    Resolved Date: {selectedComplaint.repliedAt ? new Date(selectedComplaint.repliedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              )}
            </div>

            {selectedComplaint.status === 'pending' && (
              <Button type="submit" variant="primary" loading={submittingReply} className="w-full mt-2 py-2.5 justify-center font-bold">
                Submit Response & Close Issue
              </Button>
            )}
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default Complaints;
