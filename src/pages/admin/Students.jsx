import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useCachedGet, invalidateCache } from '../../hooks/useCachedGet';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import FileUpload from '../../components/FileUpload';
import ConfirmDialog from '../../components/ConfirmDialog';
import { HiUserAdd, HiUpload, HiEye, HiPencil, HiTrash, HiBan, HiCheckCircle } from 'react-icons/hi';

const Students = () => {
  useDocumentMetadata(
    "Students Management | GPGC Lakki Marwat",
    "Admin panel to manage student registrations, upload sheets, edit profiles, and block/unblock accounts."
  );

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState('delete'); // delete, block, unblock
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    registrationNumber: '',
    rollNumber: '',
    semester: '1',
    academicSession: '',
    address: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Upload States
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadReport, setUploadReport] = useState(null);

  // Debounced search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Students with search & filters using cache
  const studentParams = {
    name: debouncedSearchQuery || undefined,
    semester: semesterFilter || undefined,
    session: sessionFilter || undefined,
    status: statusFilter || undefined
  };
  const { data: studentsData, loading, refetch: refetchStudents } = useCachedGet('/admin/students/search', studentParams);
  const students = studentsData || [];

  // Fetch sessions to populate select dropdowns using cache
  const { data: sessionsData } = useCachedGet('/admin/sessions');
  const sessions = sessionsData || [];

  useEffect(() => {
    if (sessionsData && sessionsData.length > 0 && !formData.academicSession) {
      setFormData((prev) => ({ ...prev, academicSession: sessionsData[0].sessionName }));
    }
  }, [sessionsData, formData.academicSession]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form before submit
  const validateForm = (isEdit = false) => {
    const errors = {};
    if (!isEdit) {
      if (!formData.name) errors.name = 'Full name is required';
      if (!formData.email) errors.email = 'Institutional email is required';
      if (!formData.mobileNumber) errors.mobileNumber = 'Mobile number is required';
      if (!formData.password) {
        errors.password = 'Default portal password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      }
      if (!formData.registrationNumber) errors.registrationNumber = 'Registration number is required';
      if (!formData.rollNumber) errors.rollNumber = 'Roll number is required';
    }
    if (formData.mobileNumber && !/^\d{11}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = 'Mobile number must be exactly 11 digits';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Institutional email format is invalid';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setActionLoading(true);
    try {
      const res = await api.post('/admin/students', {
        ...formData,
        semester: Number(formData.semester),
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Student account created successfully!');
        setAddModalOpen(false);
        resetForm();
        invalidateCache('/admin/students/search');
        refetchStudents();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create student account.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditOpen = (student) => {
    setSelectedStudent(student);
    setFormData({
      semester: String(student.semester),
      mobileNumber: student.mobile || '',
      address: student.address || '',
      academicSession: student.academicSession || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/students/${selectedStudent._id}`, {
        semester: Number(formData.semester),
        mobile: formData.mobileNumber,
        address: formData.address,
        academicSession: formData.academicSession,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Student profile updated successfully!');
        setEditModalOpen(false);
        resetForm();
        invalidateCache('/admin/students/search');
        refetchStudents();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to edit student details.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    setActionLoading(true);
    try {
      let res;
      if (confirmType === 'delete') {
        res = await api.delete(`/admin/students/${selectedStudent._id}`);
      } else if (confirmType === 'block') {
        res = await api.patch(`/admin/students/${selectedStudent._id}/block`);
      } else if (confirmType === 'unblock') {
        res = await api.patch(`/admin/students/${selectedStudent._id}/unblock`);
      }

      if (res.data.success) {
        toast.success(res.data.message || 'Action executed successfully.');
        setConfirmOpen(false);
        invalidateCache('/admin/students/search');
        refetchStudents();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete action.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirm = (student, type) => {
    setSelectedStudent(student);
    setConfirmType(type);
    setConfirmOpen(true);
  };

  const handleFileSelect = async (file) => {
    setUploadFile(file);
    setUploadProgress(0);
    setUploadReport(null);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      toast.error('Please select a student list file first');
      return;
    }

    setActionLoading(true);
    setUploadProgress(15);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', uploadFile);

      setUploadProgress(50);
      const res = await api.post('/admin/registration-numbers', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadProgress(90);
      if (res.data.success) {
        toast.success(res.data.message || 'Bulk student list processed successfully');
        setUploadReport(res.data.data);
        setUploadProgress(100);
        invalidateCache('/admin/students/search');
        refetchStudents();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload student list.';
      toast.error(msg);
      setUploadProgress(0);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/admin/export/students', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Students_List.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Students roster exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export students data');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobileNumber: '',
      password: '',
      registrationNumber: '',
      rollNumber: '',
      semester: '1',
      academicSession: sessions[0]?.sessionName || '',
      address: '',
    });
    setFormErrors({});
    setSelectedStudent(null);
  };

  // DataTable Headers configuration
  const headers = [
    {
      label: 'Student Name',
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center font-bold text-sm">
            {row.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-slate-800 leading-none mb-1">{row.name}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{row.userId?.email}</span>
          </div>
        </div>
      ),
    },
    { label: 'Registration No', key: 'registrationNumber' },
    { label: 'Roll Number', key: 'rollNumber' },
    {
      label: 'Academic Info',
      key: 'semester',
      render: (row) => (
        <div className="flex flex-col text-left">
          <span className="font-semibold text-xs text-slate-700">Semester {row.semester}</span>
          <span className="text-[10px] text-slate-400 font-body">{row.academicSession}</span>
        </div>
      ),
    },
    {
      label: 'Status',
      key: 'currentStatus',
      render: (row) => {
        const isBlocked = row.userId?.isBlocked;
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase ${
              isBlocked
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-green-50 text-green-600 border border-green-100'
            }`}
          >
            {isBlocked ? 'Blocked' : 'Active'}
          </span>
        );
      },
    },
    {
      label: 'Actions',
      key: '_id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedStudent(row);
              setDetailsModalOpen(true);
            }}
            className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors"
            title="View Details"
          >
            <HiEye />
          </button>
          <button
            onClick={() => handleEditOpen(row)}
            className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-accent hover:bg-slate-50 transition-colors"
            title="Edit Profile"
          >
            <HiPencil />
          </button>
          <button
            onClick={() => {
              const isBlocked = row.userId?.isBlocked;
              openConfirm(row, isBlocked ? 'unblock' : 'block');
            }}
            className={`p-1.5 rounded-lg border border-slate-100 transition-colors ${
              row.userId?.isBlocked
                ? 'text-green-500 hover:bg-green-50'
                : 'text-amber-500 hover:bg-amber-50'
            }`}
            title={row.userId?.isBlocked ? 'Unblock Student' : 'Block Student'}
          >
            {row.userId?.isBlocked ? <HiCheckCircle /> : <HiBan />}
          </button>
          <button
            onClick={() => openConfirm(row, 'delete')}
            className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Suspended Account"
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
            Student Enrolled Roster
          </h1>
          <p className="text-xs font-body text-slate-400 mt-1">
            Search, filter, promote student semesters, or add registration lists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setUploadFile(null);
              setUploadReport(null);
              setUploadProgress(0);
              setUploadModalOpen(true);
            }}
            className="py-2.5 px-4 font-semibold text-xs border-slate-200 hover:bg-slate-50 text-secondary"
          >
            <HiUpload className="mr-2 text-sm" />
            Bulk Reg Pre-approval
          </Button>

          <Button
            onClick={() => {
              resetForm();
              setAddModalOpen(true);
            }}
            className="py-2.5 px-4 font-semibold text-xs text-white"
          >
            <HiUserAdd className="mr-2 text-sm" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Roster List Table */}
      <DataTable
        headers={headers}
        data={students}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by Name or Registration Number..."
        onExport={handleExport}
        exportLabel="Export CSV"
        filterComponent={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Semesters</option>
              {Array.from({ length: 8 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  Semester {i + 1}
                </option>
              ))}
            </select>

            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Sessions</option>
              {sessions.map((s) => (
                <option key={s._id} value={s.sessionName}>
                  {s.sessionName}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        }
      />

      {/* Add Student Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Create Student Portal Profile">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              name="name"
              placeholder="e.g. Ali Khan"
              value={formData.name}
              onChange={handleInputChange}
              error={formErrors.name}
              required
            />
            <FormInput
              label="Institutional Email"
              name="email"
              type="email"
              placeholder="e.g. ali@gpgc.edu.pk"
              value={formData.email}
              onChange={handleInputChange}
              error={formErrors.email}
              required
            />
            <FormInput
              label="Registration Number"
              name="registrationNumber"
              placeholder="e.g. REG-CS-101"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              error={formErrors.registrationNumber}
              required
            />
            <FormInput
              label="Roll Number"
              name="rollNumber"
              placeholder="e.g. ROLL-CS-101"
              value={formData.rollNumber}
              onChange={handleInputChange}
              error={formErrors.rollNumber}
              required
            />
            <FormInput
              label="Mobile Number"
              name="mobileNumber"
              placeholder="e.g. 03112223334"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              error={formErrors.mobileNumber}
              required
            />
            <FormInput
              label="Default Portal Password"
              name="password"
              type="password"
              placeholder="Default login key"
              value={formData.password}
              onChange={handleInputChange}
              error={formErrors.password}
              required
            />
            <FormInput
              label="Semester"
              name="semester"
              type="select"
              value={formData.semester}
              onChange={handleInputChange}
              options={Array.from({ length: 8 }).map((_, i) => ({
                value: String(i + 1),
                label: `Semester ${i + 1}`,
              }))}
              required
            />
            <FormInput
              label="Academic Session"
              name="academicSession"
              type="select"
              value={formData.academicSession}
              onChange={handleInputChange}
              options={sessions.map((s) => ({
                value: s.sessionName,
                label: s.sessionName,
              }))}
              placeholder="Select session scope"
              required
            />
          </div>

          <FormInput
            label="Home Address"
            name="address"
            placeholder="Student home location"
            value={formData.address}
            onChange={handleInputChange}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="py-2 px-4 text-xs border-slate-200 text-secondary"
            >
              Cancel
            </Button>
            <Button type="submit" loading={actionLoading} className="py-2 px-4 text-xs text-white">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit Student Details: ${selectedStudent?.name || ''}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Semester"
              name="semester"
              type="select"
              value={formData.semester}
              onChange={handleInputChange}
              options={Array.from({ length: 8 }).map((_, i) => ({
                value: String(i + 1),
                label: `Semester ${i + 1}`,
              }))}
              required
            />
            <FormInput
              label="Academic Session"
              name="academicSession"
              type="select"
              value={formData.academicSession}
              onChange={handleInputChange}
              options={sessions.map((s) => ({
                value: s.sessionName,
                label: s.sessionName,
              }))}
              required
            />
            <FormInput
              label="Mobile Number"
              name="mobileNumber"
              placeholder="e.g. 03112223334"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              error={formErrors.mobileNumber}
              required
            />
          </div>

          <FormInput
            label="Home Address"
            name="address"
            placeholder="Student location"
            value={formData.address}
            onChange={handleInputChange}
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
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk student list upload Modal */}
      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Bulk Student Pre-approvals">
        <div className="space-y-4">
          <FileUpload
            onFileSelect={handleFileSelect}
            loading={actionLoading}
            progress={uploadProgress}
            report={uploadReport}
            title="Upload Allowed Registration List"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setUploadModalOpen(false)}
              className="py-2 px-4 text-xs border-slate-200 text-secondary"
            >
              Close
            </Button>
            <Button
              onClick={handleUploadSubmit}
              loading={actionLoading}
              disabled={!uploadFile}
              className="py-2 px-4 text-xs text-white"
            >
              Process File
            </Button>
          </div>
        </div>
      </Modal>

      {/* Student Details View Modal */}
      <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="Student Academic Record Card">
        {selectedStudent && (
          <div className="space-y-6 text-left">
            {/* Header info */}
            <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className="h-14 w-14 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center font-bold text-lg">
                {selectedStudent.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-heading font-black text-base text-secondary">{selectedStudent.name}</span>
                <span className="text-xs text-slate-400 font-body mt-0.5">{selectedStudent.userId?.email}</span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 border border-slate-200/60 rounded px-1.5 py-0.5 mt-2 w-max uppercase">
                  {selectedStudent.currentStatus}
                </span>
              </div>
            </div>

            {/* Stats Ratios grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-200/60 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Overall Attendance
                </span>
                <div className="font-heading font-black text-2xl text-primary">
                  {selectedStudent.overallAttendancePercentage || 0}%
                </div>
              </div>
              <div className="border border-slate-200/60 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Current Session
                </span>
                <div className="font-heading font-bold text-sm text-secondary truncate max-w-full">
                  {selectedStudent.academicSession || 'N/A'}
                </div>
              </div>
            </div>

            {/* Details List */}
            <div className="border border-slate-100 rounded-xl divide-y divide-slate-100">
              <div className="py-2.5 px-4 flex justify-between text-xs font-body">
                <span className="text-slate-400 font-medium">Registration Number</span>
                <span className="font-bold text-secondary">{selectedStudent.registrationNumber}</span>
              </div>
              <div className="py-2.5 px-4 flex justify-between text-xs font-body">
                <span className="text-slate-400 font-medium">Roll Number</span>
                <span className="font-bold text-secondary">{selectedStudent.rollNumber}</span>
              </div>
              <div className="py-2.5 px-4 flex justify-between text-xs font-body">
                <span className="text-slate-400 font-medium">Current Semester</span>
                <span className="font-bold text-secondary">Semester {selectedStudent.semester}</span>
              </div>
              <div className="py-2.5 px-4 flex justify-between text-xs font-body">
                <span className="text-slate-400 font-medium">Mobile Contact</span>
                <span className="font-bold text-secondary">{selectedStudent.mobile || 'N/A'}</span>
              </div>
              <div className="py-2.5 px-4 flex justify-between text-xs font-body">
                <span className="text-slate-400 font-medium">Home Location</span>
                <span className="font-bold text-secondary">{selectedStudent.address || 'N/A'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setDetailsModalOpen(false)}
                className="py-2 px-5 text-xs border-slate-200 text-secondary"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog (Delete or block) */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={
          confirmType === 'delete'
            ? 'Suspend Student Account?'
            : confirmType === 'block'
            ? 'Block Student Account?'
            : 'Unblock Student Account?'
        }
        message={
          confirmType === 'delete'
            ? 'Are you sure you want to suspend Ali Khan? Their active status will be set to suspended and they will lose access to student portal.'
            : confirmType === 'block'
            ? 'Confirming block will revoke all active student portal sessions and prevent new logins.'
            : 'Unblocking this student will restore portal login capability.'
        }
        confirmLabel={
          confirmType === 'delete'
            ? 'Suspend'
            : confirmType === 'block'
            ? 'Block User'
            : 'Restore Active Status'
        }
        variant={confirmType === 'delete' || confirmType === 'block' ? 'danger' : 'info'}
        loading={actionLoading}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  </DashboardLayout>
);
};

export default Students;
