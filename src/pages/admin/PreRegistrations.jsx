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
import { 
  HiPlusCircle, HiPencil, HiTrash, HiCheckCircle, HiBan, 
  HiUpload, HiSearch, HiFilter, HiFolderOpen 
} from 'react-icons/hi';
import { FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';

const PreRegistrations = () => {
  useDocumentMetadata(
    "Pre-Registrations | GPGC Lakki Marwat",
    "Pre-register student records manually or via bulk upload to let them activate their portal accounts."
  );

  // Lists & data fetching
  const [page, setPage] = useState(1);
  const [searchName, setSearchName] = useState('');
  const [searchReg, setSearchReg] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterSession, setFilterSession] = useState('');

  // Modals & operations
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // File upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Forms states
  const [formData, setFormData] = useState({
    registrationNumber: '',
    rollNumber: '',
    name: '',
    semester: '1',
    session: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch active sessions for dropdown selection
  const { data: sessionsData } = useCachedGet('/admin/sessions');
  const sessions = sessionsData || [];

  // Default session selection
  useEffect(() => {
    if (sessions.length > 0 && !formData.session) {
      const activeSession = sessions.find(s => s.isActive)?.sessionName || sessions[0].sessionName;
      setFormData(prev => ({ ...prev, session: activeSession }));
      setFilterSession(activeSession);
    }
  }, [sessions, formData.session]);

  // Fetch pre-registrations with backend query parameters
  const queryParams = {
    page,
    limit: 10,
    registrationNumber: searchReg,
    name: searchName,
    semester: filterSemester,
    session: filterSession
  };

  const { data: preRegData, loading: preRegLoading, refetch } = useCachedGet('/admin/pre-registrations', queryParams);
  const preRegList = preRegData?.records || [];
  const pagination = {
    page: preRegData?.page || 1,
    pages: preRegData?.pages || 1,
    total: preRegData?.total || 0,
    onPageChange: (newPage) => setPage(newPage),
  };

  // Form input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const resetForm = () => {
    const defaultSession = sessions.find(s => s.isActive)?.sessionName || sessions[0]?.sessionName || '';
    setFormData({
      registrationNumber: '',
      rollNumber: '',
      name: '',
      semester: '1',
      session: defaultSession,
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.registrationNumber) errors.registrationNumber = 'Registration number is required';
    if (!formData.rollNumber) errors.rollNumber = 'Roll number is required';
    if (!formData.name) errors.name = 'Student name is required';
    if (!formData.session) errors.session = 'Academic session is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create single record
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const res = await api.post('/admin/pre-registrations', {
        ...formData,
        semester: Number(formData.semester)
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Student pre-registration record added!');
        setCreateModalOpen(false);
        resetForm();
        invalidateCache('/admin/pre-registrations');
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student record.');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit open & submit
  const handleEditOpen = (record) => {
    setSelectedRecord(record);
    setFormData({
      registrationNumber: record.registrationNumber,
      rollNumber: record.rollNumber,
      name: record.name,
      semester: String(record.semester),
      session: record.session,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/pre-registrations/${selectedRecord._id}`, {
        rollNumber: formData.rollNumber,
        name: formData.name,
        semester: Number(formData.semester),
        session: formData.session,
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Record updated successfully!');
        setEditModalOpen(false);
        resetForm();
        invalidateCache('/admin/pre-registrations');
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update record.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteOpen = (record) => {
    setSelectedRecord(record);
    setConfirmOpen(true);
  };

  const handleDeleteSubmit = async () => {
    setActionLoading(true);
    try {
      const res = await api.delete(`/admin/pre-registrations/${selectedRecord._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Student record deleted successfully.');
        setConfirmOpen(false);
        invalidateCache('/admin/pre-registrations');
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setActionLoading(false);
    }
  };

  // CSV/Excel file selection and upload
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a CSV or Excel file.');
      return;
    }

    const data = new FormData();
    data.append('file', uploadFile);

    setUploading(true);
    try {
      const res = await api.post('/admin/pre-registrations/bulk', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Bulk student records uploaded successfully!');
        setUploadFile(null);
        // Clear file input
        const fileInput = document.getElementById('bulk-file-input');
        if (fileInput) fileInput.value = '';
        
        invalidateCache('/admin/pre-registrations');
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk upload failed. Verify column headers.');
    } finally {
      setUploading(false);
    }
  };

  // Headers config for DataTable
  const tableHeaders = [
    { label: 'Registration No', key: 'registrationNumber' },
    { label: 'Roll No', key: 'rollNumber' },
    { label: 'Name', key: 'name' },
    { label: 'Semester', render: (row) => `Semester ${row.semester}` },
    { label: 'Session', key: 'session' },
    {
      label: 'Portal Account Status',
      render: (row) => (
        row.isRegistered ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <HiCheckCircle className="text-sm shrink-0" /> Registered
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <HiBan className="text-sm shrink-0" /> Pending Signup
          </span>
        )
      )
    },
    {
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditOpen(row)}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-primary text-text-secondary hover:text-primary transition-all hover:bg-slate-50"
            title="Edit Details"
          >
            <HiPencil className="text-sm" />
          </button>
          {!row.isRegistered && (
            <button
              onClick={() => handleDeleteOpen(row)}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-red-500 text-text-secondary hover:text-red-500 transition-all hover:bg-slate-50"
              title="Delete Record"
            >
              <HiTrash className="text-sm" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
      {/* Header and Controls */}
      <div className="bg-gradient-to-r from-secondary to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <HiFolderOpen className="text-primary text-2xl" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-2xl">Pre-Registration Management</h1>
              <p className="text-slate-400 text-sm mt-0.5">Prepare student records so they can register their portal accounts.</p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => { resetForm(); setCreateModalOpen(true); }}
            className="md:self-center py-2.5 px-4 shadow-lg shadow-primary/20 font-semibold"
          >
            <HiPlusCircle className="mr-2 text-lg" />
            Add Student Record
          </Button>
        </div>
      </div>

      {/* Bulk Upload Segment */}
      <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <HiUpload className="text-primary text-xl" />
          <h2 className="font-heading font-bold text-base text-secondary">Bulk Import Pre-Registrations</h2>
        </div>
        <form onSubmit={handleBulkUpload} className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Select CSV or Excel (.xlsx/.xls) File</label>
            <div className="flex items-center gap-3">
              <input
                id="bulk-file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-secondary hover:file:bg-slate-200"
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            loading={uploading}
            disabled={!uploadFile}
            className="py-2.5 px-5 font-semibold shrink-0"
          >
            Upload & Sync Records
          </Button>
        </form>
        <p className="text-xs text-text-secondary">
          <strong>Tip:</strong> Ensure your document columns match: <code>Registration Number</code>, <code>Roll Number</code>, <code>Name</code>, <code>Semester</code>, <code>Session</code>. Headers are case-insensitive.
        </p>
      </div>

      {/* Filter Options */}
      <div className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <HiSearch className="text-slate-400" /> Search Name
          </label>
          <input
            type="text"
            placeholder="Search by student name..."
            value={searchName}
            onChange={(e) => { setSearchName(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-sm text-secondary bg-slate-50/20"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <HiSearch className="text-slate-400" /> Search Registration
          </label>
          <input
            type="text"
            placeholder="Search by registration no..."
            value={searchReg}
            onChange={(e) => { setSearchReg(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-sm text-secondary bg-slate-50/20"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <FaGraduationCap className="text-slate-400" /> Filter Semester
          </label>
          <select
            value={filterSemester}
            onChange={(e) => { setFilterSemester(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-sm text-secondary bg-slate-50/20"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
            <FaCalendarAlt className="text-slate-400" /> Filter Session
          </label>
          <select
            value={filterSession}
            onChange={(e) => { setFilterSession(e.target.value); setPage(1); }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-sm text-secondary bg-slate-50/20"
          >
            <option value="">All Academic Sessions</option>
            {sessions.map((s) => (
              <option key={s._id} value={s.sessionName}>{s.sessionName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main List */}
      <DataTable
        headers={tableHeaders}
        data={preRegList}
        loading={preRegLoading}
        pagination={pagination}
        emptyMessage="No pre-registration records found matching your filters."
      />

      {/* Manual Creation Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => { setCreateModalOpen(false); resetForm(); }}
        title="Add Manual Student Record"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <FormInput
            label="Registration Number"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleInputChange}
            placeholder="e.g. 2024-CS-001"
            error={formErrors.registrationNumber}
            required
          />
          <FormInput
            label="Roll Number"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleInputChange}
            placeholder="e.g. 001"
            error={formErrors.rollNumber}
            required
          />
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Ahmad Khan"
            error={formErrors.name}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase">Semester</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-sm text-secondary bg-slate-50/50"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase">Academic Session</label>
            <select
              name="session"
              value={formData.session}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-sm text-secondary bg-slate-50/50 animate-none"
              required
            >
              <option value="" disabled>Select Session</option>
              {sessions.map(s => (
                <option key={s._id} value={s.sessionName}>{s.sessionName}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setCreateModalOpen(false); resetForm(); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={actionLoading}
            >
              Save Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); resetForm(); }}
        title={`Edit Record details: ${selectedRecord?.registrationNumber}`}
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <FormInput
            label="Roll Number"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleInputChange}
            placeholder="e.g. 001"
            error={formErrors.rollNumber}
            required
          />
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Ahmad Khan"
            error={formErrors.name}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase">Semester</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-sm text-secondary bg-slate-50/50"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase">Academic Session</label>
            <select
              name="session"
              value={formData.session}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary text-sm text-secondary bg-slate-50/50 animate-none"
              required
            >
              <option value="" disabled>Select Session</option>
              {sessions.map(s => (
                <option key={s._id} value={s.sessionName}>{s.sessionName}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setEditModalOpen(false); resetForm(); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={actionLoading}
            >
              Update Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteSubmit}
        title="Delete Pre-Registration"
        message={`Are you sure you want to delete the pre-registration record for ${selectedRecord?.name} (${selectedRecord?.registrationNumber})? This student will no longer be able to self-register.`}
        loading={actionLoading}
      />
    </div>
  </DashboardLayout>
);
};

export default PreRegistrations;
