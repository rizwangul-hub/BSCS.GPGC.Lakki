import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useCachedGet, invalidateCache } from '../../hooks/useCachedGet';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import ConfirmDialog from '../../components/ConfirmDialog';
import { HiPlusCircle, HiCalendar, HiPencil, HiTrash } from 'react-icons/hi';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetables = () => {
  useDocumentMetadata(
    "Timetable Scheduler | GPGC Lakki Marwat",
    "Admin panel to schedule class slots, assign rooms, and prevent calendar booking overlaps."
  );

  // States
  const [semesterFilter, setSemesterFilter] = useState('1');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    semester: '1',
    subject: '',
    teacher: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    roomNumber: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch timetable slots, subjects and teachers using cache
  const { data: timetableData, loading: timetableLoading, refetch: refetchTimetable } = useCachedGet('/admin/timetable');
  const timetableSlots = timetableData || [];

  const { data: subjectsData, loading: subjectsLoading } = useCachedGet('/admin/subjects');
  const subjects = subjectsData || [];

  const { data: teachersData, loading: teachersLoading } = useCachedGet('/admin/teachers');
  const teachers = teachersData || [];

  const loading = timetableLoading || subjectsLoading || teachersLoading;

  useEffect(() => {
    if (subjectsData && subjectsData.length > 0 && !formData.subject) {
      setFormData((prev) => ({ ...prev, subject: subjectsData[0]._id }));
    }
  }, [subjectsData, formData.subject]);

  useEffect(() => {
    if (teachersData && teachersData.length > 0 && !formData.teacher) {
      setFormData((prev) => ({ ...prev, teacher: teachersData[0]._id }));
    }
  }, [teachersData, formData.teacher]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.roomNumber) errors.roomNumber = 'Room/Lab Identifier is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const res = await api.post('/admin/timetable', {
        ...formData,
        semester: Number(formData.semester),
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Timetable slot scheduled successfully!');
        setCreateModalOpen(false);
        setSemesterFilter(String(formData.semester));
        resetForm();
        invalidateCache('/admin/timetable');
        refetchTimetable();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create timetable slot.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditOpen = (slot) => {
    setSelectedSlot(slot);
    setFormData({
      semester: String(slot.semester),
      subject: slot.subject?._id || '',
      teacher: slot.teacher?._id || '',
      day: slot.day || 'Monday',
      startTime: slot.startTime || '',
      endTime: slot.endTime || '',
      roomNumber: slot.roomNumber || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/admin/timetable/${selectedSlot._id}`, {
        ...formData,
        semester: Number(formData.semester),
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Timetable slot updated successfully!');
        setEditModalOpen(false);
        setSemesterFilter(String(formData.semester));
        resetForm();
        invalidateCache('/admin/timetable');
        refetchTimetable();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update timetable slot.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setActionLoading(true);
    try {
      const res = await api.delete(`/admin/timetable/${selectedSlot._id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Timetable slot deleted.');
        setConfirmOpen(false);
        invalidateCache('/admin/timetable');
        refetchTimetable();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete timetable slot.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      semester: semesterFilter,
      subject: subjects[0]?._id || '',
      teacher: teachers[0]?._id || '',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      roomNumber: '',
    });
    setFormErrors({});
    setSelectedSlot(null);
  };

  // Filter local timetable entries by selected semester
  const semesterSlots = timetableSlots.filter((slot) => {
    return slot.semester === Number(semesterFilter);
  });

  // Helper to compile slots by Day
  const getSlotsForDay = (day) => {
    return semesterSlots
      .filter((s) => s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 text-left">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/50 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="font-heading font-black text-xl md:text-2xl text-secondary">
            Weekly Timetable Scheduler
          </h1>
          <p className="text-xs font-body text-slate-400 mt-1">
            Build weekly class timetables and configure room occupancies without time overlaps.
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
          Schedule Class Slot
        </Button>
      </div>

      {/* Semester filter bar */}
      <div className="flex items-center gap-2 flex-wrap border-b border-slate-200 pb-3">
        <span className="text-xs font-bold font-heading text-slate-400 mr-2 uppercase">Select Semester:</span>
        {Array.from({ length: 8 }).map((_, i) => {
          const sem = String(i + 1);
          const isActive = semesterFilter === sem;
          return (
            <button
              key={sem}
              onClick={() => setSemesterFilter(sem)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold font-heading tracking-tight transition-all ${
                isActive
                  ? 'bg-primary text-white shadow shadow-primary/25'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200/60 hover:text-secondary'
              }`}
            >
              Semester {sem}
            </button>
          );
        })}
      </div>

      {/* Scheduler Calendar Grid */}
      {loading ? (
        <div className="border border-slate-200 border-dashed rounded-2xl p-16 text-center text-slate-400 bg-white">
          Loading timetable...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {DAYS.map((day) => {
            const daySlots = getSlotsForDay(day);
            return (
              <div key={day} className="bg-white border border-slate-200/50 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
                {/* Day Header */}
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <span className="font-heading font-extrabold text-sm text-secondary tracking-tight">
                    {day}
                  </span>
                  <span className="bg-slate-50 border border-slate-200/60 rounded px-1.5 py-0.5 text-[9px] font-bold text-slate-400">
                    {daySlots.length} Slots
                  </span>
                </div>

                {/* Day Slots List */}
                <div className="flex-1 flex flex-col gap-3 min-h-[280px]">
                  {daySlots.length > 0 ? (
                    daySlots.map((slot) => (
                      <div
                        key={slot._id}
                        className="bg-slate-50/60 border border-slate-100 p-3.5 rounded-xl flex flex-col gap-2 relative group hover:border-primary/20 hover:bg-white hover:shadow-md transition-all duration-200"
                      >
                        {/* Time duration */}
                        <span className="text-[10px] font-black text-primary font-heading flex items-center gap-1">
                          <HiCalendar className="text-xs" />
                          {slot.startTime} - {slot.endTime}
                        </span>

                        {/* Subject & Code */}
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-xs text-secondary leading-snug truncate" title={slot.subject?.subjectName}>
                            {slot.subject?.subjectName || 'Course deleted'}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold leading-tight mt-0.5 uppercase">
                            {slot.subject?.subjectCode}
                          </span>
                        </div>

                        {/* Teacher & Location info */}
                        <div className="flex flex-col text-left border-t border-slate-100 pt-2 text-[10px] font-body text-slate-500 gap-0.5">
                          <span className="truncate">Instructor: <span className="font-semibold text-secondary">{slot.teacher?.userId?.name || 'N/A'}</span></span>
                          <span>Location: <span className="font-semibold text-secondary uppercase">{slot.roomNumber}</span></span>
                        </div>

                        {/* Quick hover controls */}
                        <div className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 bg-white border border-slate-100 rounded-lg p-1 shadow-sm transition-opacity duration-200">
                          <button
                            onClick={() => handleEditOpen(slot)}
                            className="p-1 text-[11px] text-slate-400 hover:text-accent"
                            title="Edit slot"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSlot(slot);
                              setConfirmOpen(true);
                            }}
                            className="p-1 text-[11px] text-slate-400 hover:text-red-500"
                            title="Remove slot"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 border border-dashed border-slate-100 rounded-xl flex items-center justify-center text-center p-6 text-[11px] text-slate-350 italic font-body">
                      No classes scheduled.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create timetable entry modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Schedule Class Slot">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Day of Week"
              name="day"
              type="select"
              value={formData.day}
              onChange={handleInputChange}
              options={DAYS.map((d) => ({ value: d, label: d }))}
              required
            />
            <FormInput
              label="Room / Lab Number"
              name="roomNumber"
              placeholder="e.g. Lab-3, Class-A"
              value={formData.roomNumber}
              onChange={handleInputChange}
              error={formErrors.roomNumber}
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
              label="Select Subject"
              name="subject"
              type="select"
              value={formData.subject}
              onChange={handleInputChange}
              options={subjects.map((s) => ({
                value: s._id,
                label: `${s.subjectName} (${s.subjectCode})`,
              }))}
              placeholder="Select course..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Instructor / Teacher"
              name="teacher"
              type="select"
              value={formData.teacher}
              onChange={handleInputChange}
              options={teachers.map((t) => ({
                value: t._id,
                label: `${t.userId?.name} (${t.designation})`,
              }))}
              placeholder="Select instructor..."
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <FormInput
                label="Start Time"
                name="startTime"
                type="select"
                value={formData.startTime}
                onChange={handleInputChange}
                options={[
                  { value: '08:30', label: '08:30 AM' },
                  { value: '09:00', label: '09:00 AM' },
                  { value: '09:30', label: '09:30 AM' },
                  { value: '10:00', label: '10:00 AM' },
                  { value: '10:30', label: '10:30 AM' },
                  { value: '11:00', label: '11:00 AM' },
                  { value: '11:30', label: '11:30 AM' },
                  { value: '12:00', label: '12:00 PM' },
                  { value: '12:30', label: '12:30 PM' },
                  { value: '01:00', label: '01:00 PM' },
                  { value: '01:30', label: '01:30 PM' },
                  { value: '02:00', label: '02:00 PM' },
                  { value: '02:30', label: '02:30 PM' },
                  { value: '03:00', label: '03:00 PM' },
                ]}
                required
              />
              <FormInput
                label="End Time"
                name="endTime"
                type="select"
                value={formData.endTime}
                onChange={handleInputChange}
                options={[
                  { value: '09:30', label: '09:30 AM' },
                  { value: '10:00', label: '10:00 AM' },
                  { value: '10:30', label: '10:30 AM' },
                  { value: '11:00', label: '11:00 AM' },
                  { value: '11:30', label: '11:30 AM' },
                  { value: '12:00', label: '12:00 PM' },
                  { value: '12:30', label: '12:30 PM' },
                  { value: '01:00', label: '01:00 PM' },
                  { value: '01:30', label: '01:30 PM' },
                  { value: '02:00', label: '02:00 PM' },
                  { value: '02:30', label: '02:30 PM' },
                  { value: '03:00', label: '03:00 PM' },
                  { value: '03:30', label: '03:30 PM' },
                  { value: '04:00', label: '04:00 PM' },
                ]}
                required
              />
            </div>
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
              Schedule Slot
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit timetable slot modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Timetable Slot">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Day of Week"
              name="day"
              type="select"
              value={formData.day}
              onChange={handleInputChange}
              options={DAYS.map((d) => ({ value: d, label: d }))}
              required
            />
            <FormInput
              label="Room / Lab Number"
              name="roomNumber"
              placeholder="e.g. Lab-3, Class-A"
              value={formData.roomNumber}
              onChange={handleInputChange}
              error={formErrors.roomNumber}
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
              label="Select Subject"
              name="subject"
              type="select"
              value={formData.subject}
              onChange={handleInputChange}
              options={subjects.map((s) => ({
                value: s._id,
                label: `${s.subjectName} (${s.subjectCode})`,
              }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Instructor / Teacher"
              name="teacher"
              type="select"
              value={formData.teacher}
              onChange={handleInputChange}
              options={teachers.map((t) => ({
                value: t._id,
                label: `${t.userId?.name} (${t.designation})`,
              }))}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <FormInput
                label="Start Time"
                name="startTime"
                type="select"
                value={formData.startTime}
                onChange={handleInputChange}
                options={[
                  { value: '08:30', label: '08:30 AM' },
                  { value: '09:00', label: '09:00 AM' },
                  { value: '09:30', label: '09:30 AM' },
                  { value: '10:00', label: '10:00 AM' },
                  { value: '10:30', label: '10:30 AM' },
                  { value: '11:00', label: '11:00 AM' },
                  { value: '11:30', label: '11:30 AM' },
                  { value: '12:00', label: '12:00 PM' },
                  { value: '12:30', label: '12:30 PM' },
                  { value: '01:00', label: '01:00 PM' },
                  { value: '01:30', label: '01:30 PM' },
                  { value: '02:00', label: '02:00 PM' },
                  { value: '02:30', label: '02:30 PM' },
                  { value: '03:00', label: '03:00 PM' },
                ]}
                required
              />
              <FormInput
                label="End Time"
                name="endTime"
                type="select"
                value={formData.endTime}
                onChange={handleInputChange}
                options={[
                  { value: '09:30', label: '09:30 AM' },
                  { value: '10:00', label: '10:00 AM' },
                  { value: '10:30', label: '10:30 AM' },
                  { value: '11:00', label: '11:00 AM' },
                  { value: '11:30', label: '11:30 AM' },
                  { value: '12:00', label: '12:00 PM' },
                  { value: '12:30', label: '12:30 PM' },
                  { value: '01:00', label: '01:00 PM' },
                  { value: '01:30', label: '01:30 PM' },
                  { value: '02:00', label: '02:00 PM' },
                  { value: '02:30', label: '02:30 PM' },
                  { value: '03:00', label: '03:00 PM' },
                  { value: '03:30', label: '03:30 PM' },
                  { value: '04:00', label: '04:00 PM' },
                ]}
                required
              />
            </div>
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
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Remove scheduled class slot?"
        message="Are you sure you want to delete this scheduled class slot? This room allocation will become vacant on the timetable board."
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

export default Timetables;
