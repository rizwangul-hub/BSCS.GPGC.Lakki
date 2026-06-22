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
import { HiPlusCircle, HiUserCircle, HiPencil, HiTrash } from 'react-icons/hi';

const Subjects = () => {
  useDocumentMetadata(
    "Subjects Management | GPGC Lakki Marwat",
    "Admin panel to create syllabus courses, credit hours, and map assigned teachers."
  );

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    semester: '1',
    creditHours: '4',
    academicSession: '',
    teacherId: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch subjects, teachers and sessions using cache
  const { data: subjectsData, loading: subjectsLoading, refetch: refetchSubjects } = useCachedGet('/admin/subjects');
  const subjects = subjectsData || [];

  const { data: teachersData, loading: teachersLoading } = useCachedGet('/admin/teachers');
  const teachers = teachersData || [];

  const { data: sessionsData, loading: sessionsLoading } = useCachedGet('/admin/sessions');
  const sessions = sessionsData || [];

  const loading = subjectsLoading || teachersLoading || sessionsLoading;

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

  const validateForm = () => {
    const errors = {};
    if (!formData.subjectName) errors.subjectName = 'Subject Name is required';
    if (!formData.subjectCode) errors.subjectCode = 'Subject Code is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const res = await api.post('/admin/subjects', {
        ...formData,
        semester: Number(formData.semester),
        creditHours: Number(formData.creditHours),
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Subject created successfully!');
        setCreateModalOpen(false);
        resetForm();
        invalidateCache('/admin/subjects');
        refetchSubjects();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create subject.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditOpen = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      subjectName: subject.subjectName,
      subjectCode: subject.subjectCode,
      semester: String(subject.semester),
      creditHours: String(subject.creditHours),
      academicSession: subject.academicSession || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/subjects/${selectedSubject._id}`, {
        subjectName: formData.subjectName,
        subjectCode: formData.subjectCode,
        semester: Number(formData.semester),
        creditHours: Number(formData.creditHours),
        academicSession: formData.academicSession,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Subject updated successfully!');
        setEditModalOpen(false);
        resetForm();
        invalidateCache('/admin/subjects');
        refetchSubjects();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update subject details.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignOpen = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      teacherId: subject.assignedTeacher?._id || '',
    });
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teacherId) {
      toast.error('Please select an instructor from the dropdown list');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/subjects/${selectedSubject._id}/assign-teacher`, {
        teacherId: formData.teacherId,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Teacher mapped to course successfully!');
        setAssignModalOpen(false);
        resetForm();
        invalidateCache('/admin/subjects');
        refetchSubjects();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to map teacher to subject.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setActionLoading(true);
    try {
      const res = await api.delete(`/admin/subjects/${selectedSubject._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Subject configuration deleted.');
        setConfirmOpen(false);
        invalidateCache('/admin/subjects');
        refetchSubjects();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete subject.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subjectName: '',
      subjectCode: '',
      semester: '1',
      creditHours: '4',
      academicSession: sessions[0]?.sessionName || '',
      teacherId: '',
    });
    setFormErrors({});
    setSelectedSubject(null);
  };

  // Filter subjects locally
  const filteredSubjects = subjects.filter((subj) => {
    const codeNameMatch = subj.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          subj.subjectCode.toLowerCase().includes(searchQuery.toLowerCase());
    const semMatch = semesterFilter ? subj.semester === Number(semesterFilter) : true;
    const sessMatch = sessionFilter ? subj.academicSession === sessionFilter : true;
    return codeNameMatch && semMatch && sessMatch;
  });

  const headers = [
    { label: 'Subject Code', key: 'subjectCode' },
    { label: 'Subject Name', key: 'subjectName' },
    {
      label: 'Syllabus Info',
      key: 'semester',
      render: (row) => (
        <div className="flex flex-col text-left">
          <span className="font-semibold text-xs text-slate-700 font-heading">Semester {row.semester}</span>
          <span className="text-[10px] text-slate-400 font-body">Credit Hours: {row.creditHours}</span>
        </div>
      ),
    },
    { label: 'Academic Session', key: 'academicSession' },
    {
      label: 'Assigned Instructor',
      key: 'assignedTeacher',
      render: (row) => {
        const teacherName = row.assignedTeacher?.userId?.name;
        return teacherName ? (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-[10px]">
              {teacherName.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-semibold text-slate-800 text-xs">{teacherName}</span>
          </div>
        ) : (
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 font-bold text-[9px] uppercase tracking-tight">
            Not Assigned
          </span>
        );
      },
    },
    {
      label: 'Actions',
      key: '_id',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleAssignOpen(row)}
            className="py-1 px-2.5 font-bold text-[10px] border-slate-200 text-secondary hover:bg-slate-50"
          >
            <HiUserCircle className="mr-1 text-sm text-slate-400" />
            Assign Teacher
          </Button>
          <button
            onClick={() => handleEditOpen(row)}
            className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-accent hover:bg-slate-50 transition-colors"
            title="Edit Details"
          >
            <HiPencil />
          </button>
          <button
            onClick={() => {
              setSelectedSubject(row);
              setConfirmOpen(true);
            }}
            className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete Subject"
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
            Subjects & Course Management
          </h1>
          <p className="text-xs font-body text-slate-400 mt-1">
            Configure semesters courses, syllabus codes, and map faculty instructors.
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
          Create Course Subject
        </Button>
      </div>

      {/* Course Subjects Table */}
      <DataTable
        headers={headers}
        data={filteredSubjects}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by Course Code or Subject Name..."
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
          </div>
        }
      />

      {/* Create Subject Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Syllabus Subject">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Subject Name"
              name="subjectName"
              placeholder="e.g. Database Systems"
              value={formData.subjectName}
              onChange={handleInputChange}
              error={formErrors.subjectName}
              required
            />
            <FormInput
              label="Subject Code"
              name="subjectCode"
              placeholder="e.g. CS-DB-301"
              value={formData.subjectCode}
              onChange={handleInputChange}
              error={formErrors.subjectCode}
              required
            />
            <FormInput
              label="Credit Hours"
              name="creditHours"
              type="select"
              value={formData.creditHours}
              onChange={handleInputChange}
              options={[
                { value: '1', label: '1 Credit Hour' },
                { value: '2', label: '2 Credit Hours' },
                { value: '3', label: '3 Credit Hours' },
                { value: '4', label: '4 Credit Hours' },
              ]}
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
          </div>

          <FormInput
            label="Academic Session Scope"
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
              Create Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit Course: ${selectedSubject?.subjectName || ''}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Subject Name"
              name="subjectName"
              placeholder="e.g. Database Systems"
              value={formData.subjectName}
              onChange={handleInputChange}
              error={formErrors.subjectName}
              required
            />
            <FormInput
              label="Subject Code"
              name="subjectCode"
              placeholder="e.g. CS-DB-301"
              value={formData.subjectCode}
              onChange={handleInputChange}
              error={formErrors.subjectCode}
              required
            />
            <FormInput
              label="Credit Hours"
              name="creditHours"
              type="select"
              value={formData.creditHours}
              onChange={handleInputChange}
              options={[
                { value: '1', label: '1 Credit Hour' },
                { value: '2', label: '2 Credit Hours' },
                { value: '3', label: '3 Credit Hours' },
                { value: '4', label: '4 Credit Hours' },
              ]}
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
          </div>

          <FormInput
            label="Academic Session Scope"
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
              Save Course Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Teacher Modal */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title={`Assign Instructor: ${selectedSubject?.subjectName || ''}`}>
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <FormInput
            label="Select Teacher Profile"
            name="teacherId"
            type="select"
            value={formData.teacherId}
            onChange={handleInputChange}
            options={teachers.map((t) => ({
              value: t._id,
              label: `${t.userId?.name} (${t.designation})`,
            }))}
            placeholder="Choose an instructor..."
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="py-2 px-4 text-xs border-slate-200 text-secondary"
            >
              Cancel
            </Button>
            <Button type="submit" loading={actionLoading} className="py-2 px-4 text-xs text-white">
              Map Teacher
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Subject Configuration?"
        message="Are you sure you want to delete this course from the department roster? Students registered under this course code will lose associated attendance and marks records."
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

export default Subjects;
