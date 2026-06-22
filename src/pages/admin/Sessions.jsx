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
import { HiPlusCircle, HiArrowCircleRight, HiPencil, HiTrash, HiCheckCircle, HiBan } from 'react-icons/hi';

const Sessions = () => {
  useDocumentMetadata(
    "Sessions & Promotion | GPGC Lakki Marwat",
    "Admin panel to create academic sessions and promote student rosters to their next semesters."
  );

  // States
  const [activeTab, setActiveTab] = useState('sessions'); // sessions or promotion

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [promotionConfirmOpen, setPromotionConfirmOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Form State - Session
  const [formData, setFormData] = useState({
    sessionName: '',
    startYear: new Date().getFullYear().toString(),
    endYear: (new Date().getFullYear() + 4).toString(),
    isActive: true,
  });

  // Form State - Promotion
  const [promotionData, setPromotionData] = useState({
    academicSession: '',
    currentSemester: '1',
  });

  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [promotionReport, setPromotionReport] = useState(null);

  // Fetch all sessions using cache
  const { data: sessionsData, loading, refetch: refetchSessions } = useCachedGet('/admin/sessions');
  const sessions = sessionsData || [];

  useEffect(() => {
    if (sessionsData && sessionsData.length > 0 && !promotionData.academicSession) {
      setPromotionData((prev) => ({ ...prev, academicSession: sessionsData[0].sessionName }));
    }
  }, [sessionsData, promotionData.academicSession]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePromotionChange = (e) => {
    const { name, value } = e.target;
    setPromotionData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.sessionName) {
      errors.sessionName = 'Session name is required (e.g. BSCS 2024-2028)';
    } else if (!/^[A-Za-z0-9 ]+\d{4}-\d{4}$/.test(formData.sessionName)) {
      errors.sessionName = 'Format must be like "BSCS 2024-2028"';
    }
    if (!formData.startYear || isNaN(formData.startYear)) {
      errors.startYear = 'Valid start year is required';
    }
    if (!formData.endYear || isNaN(formData.endYear)) {
      errors.endYear = 'Valid end year is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const res = await api.post('/admin/sessions', {
        sessionName: formData.sessionName,
        startYear: Number(formData.startYear),
        endYear: Number(formData.endYear),
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Academic session created successfully!');
        setCreateModalOpen(false);
        resetForm();
        invalidateCache('/admin/sessions');
        refetchSessions();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create academic session.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditOpen = (session) => {
    setSelectedSession(session);
    setFormData({
      sessionName: session.sessionName,
      startYear: String(session.startYear),
      endYear: String(session.endYear),
      isActive: session.isActive !== false,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/sessions/${selectedSession._id}`, {
        sessionName: formData.sessionName,
        startYear: Number(formData.startYear),
        endYear: Number(formData.endYear),
        isActive: formData.isActive,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Academic session updated successfully!');
        setEditModalOpen(false);
        resetForm();
        invalidateCache('/admin/sessions');
        refetchSessions();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to edit session details.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (session) => {
    try {
      const res = await api.put(`/admin/sessions/${session._id}`, {
        isActive: !session.isActive,
      });
      if (res.data.success) {
        toast.success(`Session ${session.sessionName} status updated.`);
        invalidateCache('/admin/sessions');
        refetchSessions();
      }
    } catch (err) {
      toast.error('Failed to change session status.');
    }
  };

  const handleDeleteSubmit = async () => {
    setActionLoading(true);
    try {
      const res = await api.delete(`/admin/sessions/${selectedSession._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Academic session deleted.');
        setConfirmOpen(false);
        invalidateCache('/admin/sessions');
        refetchSessions();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete session.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromotionSubmit = async () => {
    setActionLoading(true);
    setPromotionReport(null);
    try {
      const res = await api.post('/admin/promote-semester', {
        academicSession: promotionData.academicSession,
        currentSemester: Number(promotionData.currentSemester),
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Semester promotion successful!');
        setPromotionReport(res.data.data);
        setPromotionConfirmOpen(false);
        invalidateCache('/admin/students'); // Invalidate student list since semesters changed
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Semester promotion failed.';
      toast.error(msg);
      setPromotionConfirmOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sessionName: '',
      startYear: new Date().getFullYear().toString(),
      endYear: (new Date().getFullYear() + 4).toString(),
      isActive: true,
    });
    setFormErrors({});
    setSelectedSession(null);
  };

  const headers = [
    { label: 'Session Name', key: 'sessionName' },
    { label: 'Start Year', key: 'startYear' },
    { label: 'End Year', key: 'endYear' },
    {
      label: 'Status',
      key: 'isActive',
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase ${
            row.isActive !== false
              ? 'bg-green-50 text-green-600 border border-green-100'
              : 'bg-slate-50 text-slate-400 border border-slate-200/60'
          }`}
        >
          {row.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      label: 'Actions',
      key: '_id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleActive(row)}
            className={`p-1.5 rounded-lg border border-slate-100 transition-colors ${
              row.isActive !== false ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'
            }`}
            title={row.isActive !== false ? 'Deactivate Session' : 'Activate Session'}
          >
            {row.isActive !== false ? <HiBan /> : <HiCheckCircle />}
          </button>
          <button
            onClick={() => handleEditOpen(row)}
            className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-accent hover:bg-slate-50 transition-colors"
            title="Edit Details"
          >
            <HiPencil />
          </button>
          <button
            onClick={() => {
              setSelectedSession(row);
              setConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete Session"
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
            Sessions & Promotions
          </h1>
          <p className="text-xs font-body text-slate-400 mt-1">
            Manage academic session templates, and perform bulk student semester promotions.
          </p>
        </div>

        {activeTab === 'sessions' && (
          <Button
            onClick={() => {
              resetForm();
              setCreateModalOpen(true);
            }}
            className="py-2.5 px-4 font-semibold text-xs text-white"
          >
            <HiPlusCircle className="mr-2 text-sm" />
            Add Session
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 text-sm font-heading font-extrabold transition-all border-b-2 px-1 ${
            activeTab === 'sessions' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-secondary'
          }`}
        >
          Manage Sessions
        </button>
        <button
          onClick={() => setActiveTab('promotion')}
          className={`pb-3 text-sm font-heading font-extrabold transition-all border-b-2 px-1 ${
            activeTab === 'promotion' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-secondary'
          }`}
        >
          Semester Promotion System
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'sessions' ? (
        <DataTable headers={headers} data={sessions} loading={loading} emptyMessage="No academic sessions recorded." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Promotion Form */}
          <div className="lg:col-span-5 bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-heading font-extrabold text-base text-secondary">
                Bulk Promotion Config
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-body">
                Promote all active students of a selected session and semester by 1.
              </p>
            </div>

            <div className="space-y-4">
              <FormInput
                label="Target Academic Session"
                name="academicSession"
                type="select"
                value={promotionData.academicSession}
                onChange={handlePromotionChange}
                options={sessions.map((s) => ({
                  value: s.sessionName,
                  label: s.sessionName,
                }))}
                placeholder="Choose session..."
                required
              />

              <FormInput
                label="From Semester (Current)"
                name="currentSemester"
                type="select"
                value={promotionData.currentSemester}
                onChange={handlePromotionChange}
                options={Array.from({ length: 7 }).map((_, i) => ({
                  value: String(i + 1),
                  label: `Semester ${i + 1}`,
                }))}
                required
              />

              <div className="bg-amber-50/50 border border-amber-100 p-4.5 rounded-xl flex items-start gap-3">
                <span className="text-amber-500 text-lg">⚠️</span>
                <div className="flex flex-col text-xs font-body text-amber-700 leading-relaxed">
                  <span className="font-bold">Important Promotion Notice</span>
                  <span className="mt-1">
                    This will increment the semester value of all active students in the selected class by +1 (e.g. Semester {promotionData.currentSemester} &rarr; Semester {Number(promotionData.currentSemester) + 1}).
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setPromotionConfirmOpen(true)}
                disabled={!promotionData.academicSession}
                className="w-full py-2.5 font-semibold text-xs text-white"
              >
                <HiArrowCircleRight className="mr-2 text-sm" />
                Run Semester Promotion
              </Button>
            </div>
          </div>

          {/* Promotion Report Area */}
          <div className="lg:col-span-7">
            {promotionReport ? (
              <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-secondary">
                    Promotion Success Summary
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-body">
                    Roster promotion has run successfully. Database audit log saved.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Session
                    </span>
                    <span className="font-heading font-black text-sm text-secondary truncate">
                      {promotionReport.session}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Promoted Scope
                    </span>
                    <span className="font-heading font-black text-sm text-primary">
                      {promotionReport.fromSemester} &rarr; {promotionReport.toSemester}
                    </span>
                  </div>
                  <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl flex flex-col">
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">
                      Promoted Count
                    </span>
                    <span className="font-heading font-black text-base text-green-700">
                      {promotionReport.promotedCount} Students
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200/50 border-dashed rounded-2xl p-12 text-center text-slate-400 font-body text-sm bg-white">
                No promotions run in this session. Configure criteria on the left and run promotion.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Academic Session">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormInput
            label="Session Name"
            name="sessionName"
            placeholder="e.g. BSCS 2024-2028"
            value={formData.sessionName}
            onChange={handleInputChange}
            error={formErrors.sessionName}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Year"
              name="startYear"
              type="number"
              placeholder="e.g. 2024"
              value={formData.startYear}
              onChange={handleInputChange}
              error={formErrors.startYear}
              required
            />
            <FormInput
              label="End Year"
              name="endYear"
              type="number"
              placeholder="e.g. 2028"
              value={formData.endYear}
              onChange={handleInputChange}
              error={formErrors.endYear}
              required
            />
          </div>

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
              Create Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Session Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit Session: ${selectedSession?.sessionName || ''}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <FormInput
            label="Session Name"
            name="sessionName"
            placeholder="e.g. BSCS 2024-2028"
            value={formData.sessionName}
            onChange={handleInputChange}
            error={formErrors.sessionName}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Year"
              name="startYear"
              type="number"
              placeholder="e.g. 2024"
              value={formData.startYear}
              onChange={handleInputChange}
              error={formErrors.startYear}
              required
            />
            <FormInput
              label="End Year"
              name="endYear"
              type="number"
              placeholder="e.g. 2028"
              value={formData.endYear}
              onChange={handleInputChange}
              error={formErrors.endYear}
              required
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-primary focus:ring-primary rounded border-slate-300"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-secondary font-heading">
              Mark Session as Active
            </label>
          </div>

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
              Save Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Academic Session?"
        message="Are you sure you want to delete this session template? Student profiles registered under this session will not be deleted, but they must be mapped to another session."
        confirmLabel="Confirm Delete"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDeleteSubmit}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Promotion Warning Confirmation */}
      <ConfirmDialog
        isOpen={promotionConfirmOpen}
        title="Confirm Semester Bulk Promotion?"
        message={`Are you sure you want to promote ALL active students of session "${promotionData.academicSession}" currently in Semester ${promotionData.currentSemester}? This operation writes direct updates across all student rows.`}
        confirmLabel="Execute Bulk Promotion"
        variant="warning"
        loading={actionLoading}
        onConfirm={handlePromotionSubmit}
        onCancel={() => setPromotionConfirmOpen(false)}
      />
    </div>
  </DashboardLayout>
);
};

export default Sessions;
