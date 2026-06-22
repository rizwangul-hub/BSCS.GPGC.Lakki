import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useCachedGet, invalidateCache } from '../../hooks/useCachedGet';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import ConfirmDialog from '../../components/ConfirmDialog';
import { HiPlusCircle, HiTrash, HiPencil } from 'react-icons/hi';

const Notices = () => {
  useDocumentMetadata(
    "Notice Board | GPGC Lakki Marwat",
    "Admin panel to broadcast department updates, filter notices, and manage expired announcements."
  );

  // Audience filter state
  const [audienceFilter, setAudienceFilter] = useState('');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: 'all',
    expiryDate: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch notices using cache
  const { data: noticesData, loading, refetch: refetchNotices } = useCachedGet('/admin/notices');
  const notices = noticesData || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = 'Announcement Title is required';
    if (!formData.description) errors.description = 'Notice content description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const res = await api.post('/admin/notices', {
        title: formData.title,
        description: formData.description,
        targetAudience: formData.targetAudience,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Notice broadcasted successfully!');
        setCreateModalOpen(false);
        resetForm();
        invalidateCache('/admin/notices');
        refetchNotices();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post notice.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditOpen = (notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description,
      targetAudience: notice.targetAudience || 'all',
      expiryDate: notice.expiryDate ? notice.expiryDate.split('T')[0] : '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/notices/${selectedNotice._id}`, {
        title: formData.title,
        description: formData.description,
        targetAudience: formData.targetAudience,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Notice updated successfully!');
        setEditModalOpen(false);
        resetForm();
        invalidateCache('/admin/notices');
        refetchNotices();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update notice.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setActionLoading(true);
    try {
      const res = await api.delete(`/admin/notices/${selectedNotice._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Announcement deleted.');
        setConfirmOpen(false);
        invalidateCache('/admin/notices');
        refetchNotices();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete notice.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAudience: 'all',
      expiryDate: '',
    });
    setFormErrors({});
    setSelectedNotice(null);
  };

  // Filter notices locally
  const filteredNotices = notices.filter((notice) => {
    return audienceFilter ? notice.targetAudience === audienceFilter : true;
  });

  const headers = [
    {
      label: 'Notice Details',
      key: 'title',
      render: (row) => (
        <div className="flex flex-col text-left max-w-sm">
          <span className="font-bold text-slate-800 leading-snug mb-1">{row.title}</span>
          <span className="text-xs text-slate-500 font-body line-clamp-2 leading-relaxed">
            {row.description}
          </span>
        </div>
      ),
    },
    {
      label: 'Audience Scope',
      key: 'targetAudience',
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase border ${
            row.targetAudience === 'students'
              ? 'bg-blue-50 text-blue-600 border-blue-100'
              : row.targetAudience === 'teachers'
              ? 'bg-amber-50 text-amber-600 border-amber-100'
              : 'bg-indigo-50 text-indigo-600 border-indigo-100'
          }`}
        >
          {row.targetAudience === 'all' ? 'All Portal Users' : row.targetAudience}
        </span>
      ),
    },
    {
      label: 'Created Date',
      key: 'createdAt',
      render: (row) => (
        <span className="text-xs font-body text-slate-500">
          {new Date(row.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      label: 'Expiry Status',
      key: 'expiryDate',
      render: (row) => {
        if (!row.expiryDate) {
          return <span className="text-xs text-slate-400 font-medium font-body">Never Expires</span>;
        }
        const isExpired = new Date(row.expiryDate) < new Date();
        return (
          <div className="flex flex-col text-left">
            <span
              className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight w-max ${
                isExpired
                  ? 'bg-slate-100 text-slate-500 border border-slate-200'
                  : 'bg-green-50 text-green-600 border border-green-100'
              }`}
            >
              {isExpired ? 'Expired' : 'Active'}
            </span>
            <span className="text-[10px] text-slate-400 font-body mt-1">
              Expires: {new Date(row.expiryDate).toLocaleDateString()}
            </span>
          </div>
        );
      },
    },
    {
      label: 'Actions',
      key: '_id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditOpen(row)}
            className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-accent hover:bg-slate-50 transition-colors"
            title="Edit Details"
          >
            <HiPencil />
          </button>
          <button
            onClick={() => {
              setSelectedNotice(row);
              setConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete Announcement"
          >
            <HiTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 text-left">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/50 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="font-heading font-black text-xl md:text-2xl text-secondary">
            Announcements & Notice Board
          </h1>
          <p className="text-xs font-body text-slate-400 mt-1">
            Broadcast messages and notifications dynamically to students, faculty, or all portal users.
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setCreateModalOpen(true);
          }}
          className="py-2.5 px-4 font-semibold text-xs text-white"
        >
          <HiPlusCircle className="mr-2 text-sm" />
          Broadcast Update
        </Button>
      </div>

      {/* Notices Directory Table */}
      <DataTable
        headers={headers}
        data={filteredNotices}
        loading={loading}
        emptyMessage="No notices posted on the department board."
        filterComponent={
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Audiences</option>
            <option value="all">All Portal Users</option>
            <option value="students">Students Only</option>
            <option value="teachers">Teachers Only</option>
          </select>
        }
      />

      {/* Create Announcement Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Broadcast Announcement">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormInput
            label="Announcement Title"
            name="title"
            placeholder="e.g. Midterm Exams Schedule"
            value={formData.title}
            onChange={handleInputChange}
            error={formErrors.title}
            required
          />

          <FormInput
            label="Target Audience Scope"
            name="targetAudience"
            type="select"
            value={formData.targetAudience}
            onChange={handleInputChange}
            options={[
              { value: 'all', label: 'All Students & Faculty Instructors' },
              { value: 'students', label: 'Students Only' },
              { value: 'teachers', label: 'Faculty Teachers Only' },
            ]}
            required
          />

          <FormInput
            label="Notice Expiry Date (Optional)"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleInputChange}
          />

          <FormInput
            label="Notice Description / Body Content"
            name="description"
            type="textarea"
            placeholder="Write notice instructions or description details..."
            value={formData.description}
            onChange={handleInputChange}
            error={formErrors.description}
            rows={5}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="py-2 px-4 text-xs border-slate-200 text-secondary"
            >
              Cancel
            </Button>
            <Button type="submit" loading={actionLoading} className="py-2 px-4 text-xs text-white">
              Dispatch Notice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Notice Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit Announcement`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <FormInput
            label="Announcement Title"
            name="title"
            placeholder="e.g. Midterm Exams Schedule"
            value={formData.title}
            onChange={handleInputChange}
            error={formErrors.title}
            required
          />

          <FormInput
            label="Target Audience Scope"
            name="targetAudience"
            type="select"
            value={formData.targetAudience}
            onChange={handleInputChange}
            options={[
              { value: 'all', label: 'All Students & Faculty' },
              { value: 'students', label: 'Students Only' },
              { value: 'teachers', label: 'Teachers Only' },
            ]}
            required
          />

          <FormInput
            label="Notice Expiry Date (Optional)"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleInputChange}
          />

          <FormInput
            label="Notice Description / Body Content"
            name="description"
            type="textarea"
            placeholder="Write notice instructions..."
            value={formData.description}
            onChange={handleInputChange}
            error={formErrors.description}
            rows={5}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="py-2 px-4 text-xs border-slate-200 text-secondary"
            >
              Cancel
            </Button>
            <Button type="submit" loading={actionLoading} className="py-2 px-4 text-xs text-white">
              Save notice changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Notice Board Announcement?"
        message="Are you sure you want to remove this notice? It will disappear from all students and teachers notice boards instantly."
        confirmLabel="Confirm Delete"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDeleteSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  </DashboardLayout>
);
};

export default Notices;
