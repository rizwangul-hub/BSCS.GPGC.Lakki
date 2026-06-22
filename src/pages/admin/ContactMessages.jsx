import { useState, useEffect } from 'react';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useCachedGet, invalidateCache } from '../../hooks/useCachedGet';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import SkeletonLoader from '../../components/SkeletonLoader';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from 'react-hot-toast';
import { HiInbox, HiTrash, HiSearch, HiEye } from 'react-icons/hi';

const ContactMessages = () => {
  useDocumentMetadata(
    "Contact Messages | Admin Portal",
    "View and manage visitor messages submitted from the college landing page contact desk."
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch messages using cache
  const { data: fetchResult, loading, refetch } = useCachedGet(
    '/contact/admin/messages',
    { page, limit: 10, search: debouncedSearch }
  );

  const messages = fetchResult?.messages || [];
  const totalPages = fetchResult?.pages || 1;

  const handleDeleteOpen = (msg) => {
    setSelectedMessage(msg);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedMessage) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/contact/admin/messages/${selectedMessage._id}`);
      if (res.data.success) {
        toast.success("Message deleted successfully.");
        setIsDeleteConfirmOpen(false);
        setSelectedMessage(null);
        invalidateCache('/contact/admin/messages');
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message.");
    } finally {
      setDeleting(false);
    }
  };

  const handleViewOpen = (msg) => {
    setSelectedMessage(msg);
    setIsViewModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 text-left">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-secondary">
              Contact Desk Messages
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Read and manage public inquiries submitted from the Landing Page.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <HiSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 text-base" />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or content..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-xs text-secondary bg-slate-50/50"
            />
          </div>
        </div>

        {/* Content Card */}
        <Card className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm" hoverEffect={false}>
          {loading ? (
            <SkeletonLoader count={4} />
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <HiInbox className="mx-auto text-5xl text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 font-semibold">No messages found.</p>
              <p className="text-xs text-slate-400 mt-1">Visitor queries submitted from the website homepage will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left">
                  <thead>
                    <tr className="text-xs text-slate-400 font-semibold tracking-wider bg-slate-50">
                      <th className="px-6 py-4">Sender</th>
                      <th className="px-6 py-4">Message Preview</th>
                      <th className="px-6 py-4">Received Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-secondary">
                    {messages.map((msg) => (
                      <tr key={msg._id} className="hover:bg-slate-50/40">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-secondary">{msg.name}</span>
                            <span className="text-xs text-slate-400 font-mono mt-0.5">{msg.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate">
                          {msg.message}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(msg.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleViewOpen(msg)}
                              className="p-1.5 rounded-lg border border-slate-100 text-slate-500 hover:text-primary hover:bg-slate-50 transition-colors"
                              title="Read Full Message"
                            >
                              <HiEye className="text-base" />
                            </button>
                            <button
                              onClick={() => handleDeleteOpen(msg)}
                              className="p-1.5 rounded-lg border border-slate-100 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete Message"
                            >
                              <HiTrash className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                  <span className="text-text-secondary">
                    Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="py-1 px-3 border-slate-200 text-secondary disabled:opacity-50 text-[11px] font-bold"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className="py-1 px-3 border-slate-200 text-secondary disabled:opacity-50 text-[11px] font-bold"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Message Reader Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Contact Message">
        {selectedMessage && (
          <div className="flex flex-col gap-5 text-left">
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium">Sender Name:</span>
                <span className="font-bold text-secondary text-sm">{selectedMessage.name}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400 font-medium">Email Address:</span>
                <a href={`mailto:${selectedMessage.email}`} className="font-semibold text-primary hover:underline text-sm">{selectedMessage.email}</a>
              </div>
              <div className="flex flex-col gap-0.5 col-span-2 mt-1">
                <span className="text-slate-400 font-medium">Received Date:</span>
                <span className="font-medium text-slate-600">
                  {new Date(selectedMessage.createdAt).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 font-medium">Message Body:</span>
              <p className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm leading-relaxed text-secondary whitespace-pre-wrap font-body max-h-64 overflow-y-auto">
                {selectedMessage.message}
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="py-2 px-4 border-slate-200 text-secondary text-xs font-bold"
              >
                Close View
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleDeleteOpen(selectedMessage);
                }}
                className="py-2 px-4 border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 text-xs font-bold"
              >
                Delete Message
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteSubmit}
        title="Delete Contact Message"
        message="Are you sure you want to delete this message? This action is permanent and cannot be undone."
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default ContactMessages;
