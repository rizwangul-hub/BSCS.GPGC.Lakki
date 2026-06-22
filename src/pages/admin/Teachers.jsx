import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { HiUserAdd, HiEye, HiPencil, HiTrash, HiBan, HiCheckCircle } from 'react-icons/hi';

const Teachers = () => {
  useDocumentMetadata(
    "Teachers Management | GPGC Lakki Marwat",
    "Admin panel to manage teacher accounts, assigned subjects, qualifications, and system privileges."
  );

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState('delete'); // delete, block, unblock
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    teacherId: '',
    qualification: '',
    designation: 'Lecturer',
    department: 'Computer Science',
    address: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all teachers using cache
  const { data: teachersData, loading, refetch: refetchTeachers } = useCachedGet('/admin/teachers');
  const teachers = teachersData || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = (isEdit = false) => {
    const errors = {};
    if (!isEdit) {
      if (!formData.name.trim()) errors.name = 'Full name is required';
      if (!formData.mobileNumber) errors.mobileNumber = 'Mobile contact is required';
      if (!formData.password) {
        errors.password = 'Portal login password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      }
      if (!formData.teacherId.trim()) errors.teacherId = 'Teacher ID is required';
      if (!formData.qualification.trim()) errors.qualification = 'Qualification is required';
      if (!formData.designation.trim()) errors.designation = 'Designation is required';
    }
    if (formData.mobileNumber && !/^\d{11}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = 'Mobile number must be exactly 11 digits';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    setActionLoading(true);
    try {
      const res = await api.post('/admin/teachers', formData);
      if (res.data.success) {
        toast.success(res.data.message || 'Teacher account created successfully!');
        setAddModalOpen(false);
        resetForm();
        invalidateCache('/admin/teachers');
        refetchTeachers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add teacher account';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditOpen = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      qualification: teacher.qualification || '',
      designation: teacher.designation || 'Lecturer',
      department: teacher.department || 'Computer Science',
      mobileNumber: teacher.mobile || '',
      address: teacher.address || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/teachers/${selectedTeacher._id}`, {
        qualification: formData.qualification,
        designation: formData.designation,
        department: formData.department,
        mobile: formData.mobileNumber,
        address: formData.address,
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Teacher profile updated successfully!');
        setEditModalOpen(false);
        resetForm();
        invalidateCache('/admin/teachers');
        refetchTeachers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update teacher profile';
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
        res = await api.delete(`/admin/teachers/${selectedTeacher._id}`);
      } else if (confirmType === 'block') {
        res = await api.patch(`/admin/teachers/${selectedTeacher._id}/block`);
      } else if (confirmType === 'unblock') {
        res = await api.patch(`/admin/teachers/${selectedTeacher._id}/unblock`);
      }

      if (res.data.success) {
        toast.success(res.data.message || 'Action executed successfully');
        setConfirmOpen(false);
        invalidateCache('/admin/teachers');
        refetchTeachers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete action';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirm = (teacher, type) => {
    setSelectedTeacher(teacher);
    setConfirmType(type);
    setConfirmOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobileNumber: '',
      password: '',
      teacherId: '',
      qualification: '',
      designation: 'Lecturer',
      department: 'Computer Science',
      address: '',
    });
    setFormErrors({});
    setSelectedTeacher(null);
  };

  // Filter local teachers array
  const filteredTeachers = teachers.filter((teacher) => {
    const nameMatch = teacher.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      teacher.teacherId?.toLowerCase().includes(searchQuery.toLowerCase());
    const desMatch = designationFilter ? teacher.designation === designationFilter : true;
    const depMatch = departmentFilter ? teacher.department === departmentFilter : true;
    return nameMatch && desMatch && depMatch;
  });

  const headers = [
    {
      label: 'Teacher Profile',
      key: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-accent/10 text-accent border border-accent/20 rounded-full flex items-center justify-center font-bold text-sm">
            {row.userId?.name?.slice(0, 2).toUpperCase() || 'TR'}
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-slate-800 leading-none mb-1">{row.userId?.name}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{row.userId?.email}</span>
          </div>
        </div>
      ),
    },
    { label: 'Teacher ID', key: 'teacherId' },
    {
      label: 'Designation & Dept',
      key: 'designation',
      render: (row) => (
        <div className="flex flex-col text-left">
          <span className="font-semibold text-xs text-slate-700">{row.designation}</span>
          <span className="text-[10px] text-slate-400 font-body">{row.department}</span>
        </div>
      ),
    },
    { label: 'Qualification', key: 'qualification' },
    {
      label: 'Assigned Courses',
      key: 'subjects',
      render: (row) => (
        <div className="flex flex-col text-left gap-1">
          {row.subjects && row.subjects.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {row.subjects.map((sub) => (
                <span
                  key={sub._id}
                  className="bg-slate-50 border border-slate-200/60 rounded px-1.5 py-0.5 text-[9px] font-bold text-secondary uppercase"
                  title={sub.subjectName}
                >
                  {sub.subjectCode}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 italic">No assigned subjects</span>
          )}
        </div>
      ),
    },
    {
      label: 'Status',
      key: 'isActive',
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
            title={row.userId?.isBlocked ? 'Unblock Teacher' : 'Block Teacher'}
          >
            {row.userId?.isBlocked ? <HiCheckCircle /> : <HiBan />}
          </button>
          <button
            onClick={() => openConfirm(row, 'delete')}
            className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Suspend Teacher"
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
            Faculty Directory
          </h1>
          <p className="text-xs font-body text-slate-400 mt-1">
            Manage teacher profiles, qualifications, subject mappings, and access credentials.
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setAddModalOpen(true);
          }}
          className="py-2.5 px-4 font-semibold text-xs text-white"
        >
          <HiUserAdd className="mr-2 text-sm" />
          Register Teacher
        </Button>
      </div>

      {/* Roster Directory Table */}
      <DataTable
        headers={headers}
        data={filteredTeachers}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by Name or Teacher ID..."
        filterComponent={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Designations</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Lecturer">Lecturer</option>
              <option value="Lab Instructor">Lab Instructor</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Software Engineering">Software Engineering</option>
            </select>
          </div>
        }
      />

      {/* Add Teacher Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Register Faculty Member">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              name="name"
              placeholder="e.g. Dr. John Doe"
              value={formData.name}
              onChange={handleInputChange}
              error={formErrors.name}
              required
            />
            <FormInput
              label="Institutional Email"
              name="email"
              type="email"
              placeholder="e.g. john.doe@gpgc.edu.pk"
              value={formData.email}
              onChange={handleInputChange}
              error={formErrors.email}
              required
            />
            <FormInput
              label="Teacher ID"
              name="teacherId"
              placeholder="e.g. TCH-CS-50"
              value={formData.teacherId}
              onChange={handleInputChange}
              error={formErrors.teacherId}
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
              label="Portal Password"
              name="password"
              type="password"
              placeholder="Initial login password"
              value={formData.password}
              onChange={handleInputChange}
              error={formErrors.password}
              required
            />
            <FormInput
              label="Designation"
              name="designation"
              type="select"
              value={formData.designation}
              onChange={handleInputChange}
              options={[
                { value: 'Professor', label: 'Professor' },
                { value: 'Associate Professor', label: 'Associate Professor' },
                { value: 'Assistant Professor', label: 'Assistant Professor' },
                { value: 'Lecturer', label: 'Lecturer' },
                { value: 'Lab Instructor', label: 'Lab Instructor' },
              ]}
              required
            />
            <FormInput
              label="Department"
              name="department"
              type="select"
              value={formData.department}
              onChange={handleInputChange}
              options={[
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Information Technology', label: 'Information Technology' },
                { value: 'Software Engineering', label: 'Software Engineering' },
              ]}
              required
            />
            <FormInput
              label="Qualification"
              name="qualification"
              placeholder="e.g. PhD Computer Science, MS IT"
              value={formData.qualification}
              onChange={handleInputChange}
              required
            />
          </div>

          <FormInput
            label="Home Location / Office Room"
            name="address"
            placeholder="Office room number or location details"
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

      {/* Edit Teacher Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit Faculty Profile: ${selectedTeacher?.userId?.name || ''}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Designation"
              name="designation"
              type="select"
              value={formData.designation}
              onChange={handleInputChange}
              options={[
                { value: 'Professor', label: 'Professor' },
                { value: 'Associate Professor', label: 'Associate Professor' },
                { value: 'Assistant Professor', label: 'Assistant Professor' },
                { value: 'Lecturer', label: 'Lecturer' },
                { value: 'Lab Instructor', label: 'Lab Instructor' },
              ]}
              required
            />
            <FormInput
              label="Department"
              name="department"
              type="select"
              value={formData.department}
              onChange={handleInputChange}
              options={[
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Information Technology', label: 'Information Technology' },
                { value: 'Software Engineering', label: 'Software Engineering' },
              ]}
              required
            />
            <FormInput
              label="Qualification"
              name="qualification"
              placeholder="e.g. MS Computer Science"
              value={formData.qualification}
              onChange={handleInputChange}
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
            label="Home Location / Office Room"
            name="address"
            placeholder="Office room number or location details"
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

      {/* Confirmation modal */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={
          confirmType === 'delete'
            ? 'Suspend Teacher Account?'
            : confirmType === 'block'
            ? 'Block Teacher Account?'
            : 'Unblock Teacher Account?'
        }
        message={
          confirmType === 'delete'
            ? 'Are you sure you want to suspend this teacher profile? Their active status will be set to suspended and they will lose database management keys.'
            : confirmType === 'block'
            ? 'Confirming block will instantly sign out the teacher from active sessions and revoke portal permissions.'
            : 'Unblocking this teacher will restore full teacher portal access capabilities.'
        }
        confirmLabel={
          confirmType === 'delete'
            ? 'Suspend Profile'
            : confirmType === 'block'
            ? 'Block Faculty'
            : 'Restore Faculty Access'
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

export default Teachers;
