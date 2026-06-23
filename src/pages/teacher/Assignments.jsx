import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlusCircle, HiTrash, HiPencilAlt, HiInbox, HiDocumentText, HiDownload, HiCheck, HiX } from 'react-icons/hi';
import { useCachedGet, invalidateCache } from '../../hooks/useCachedGet';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import SkeletonLoader from '../../components/SkeletonLoader';
import { toast } from 'react-hot-toast';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';

const Assignments = () => {
  useDocumentMetadata(
    "Assignment Desk | Teacher Portal",
    "Post assignments, view student submissions, and grade PDFs."
  );

  const [searchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId') || '';

  // Data lists with cache
  const { data: subjectsData, loading: subjectsLoading } = useCachedGet('/teacher/subjects');
  const subjects = subjectsData || [];

  const { data: assignmentsData, loading: assignmentsLoading, refetch: refetchAssignments } = useCachedGet('/teacher/assignments');
  const assignments = assignmentsData || [];

  const loading = subjectsLoading || assignmentsLoading;
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', subject: initialSubjectId });
  const [pdfFile, setPdfFile] = useState(null);

  // Delete Dialog state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Submissions Modal states
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionsRoster, setSubmissionsRoster] = useState([]);
  const [gradingRowId, setGradingRowId] = useState(null);

  // Selected assignment ID for submissions roster
  const [activeAssignmentId, setActiveAssignmentId] = useState(null);
  const { data: submissionsData, loading: subsLoading, refetch: refetchSubmissions } = useCachedGet(
    activeAssignmentId ? `/teacher/assignments/${activeAssignmentId}/submissions` : null
  );

  useEffect(() => {
    if (submissionsData) {
      setSubmissionsRoster(submissionsData);
    } else {
      setSubmissionsRoster([]);
    }
  }, [submissionsData]);

  // Update form subject when initialSubjectId loads
  useEffect(() => {
    if (initialSubjectId) {
      setForm(f => ({ ...f, subject: initialSubjectId }));
    }
  }, [initialSubjectId]);

  // Handle Form open for Add/Edit
  const handleOpenForm = (assign = null) => {
    if (assign) {
      setEditingAssignment(assign);
      // Format date to YYYY-MM-DD
      const formattedDate = assign.deadline ? new Date(assign.deadline).toISOString().split('T')[0] : '';
      setForm({
        title: assign.title,
        description: assign.description || '',
        deadline: formattedDate,
        subject: assign.subject?._id || ''
      });
    } else {
      setEditingAssignment(null);
      setForm({ title: '', description: '', deadline: '', subject: initialSubjectId || (subjects[0]?._id || '') });
    }
    setPdfFile(null);
    setIsFormOpen(true);
  };

  // Submit Add/Edit assignment
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.title || !form.deadline) {
      toast.error('Please enter all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('subject', form.subject);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('deadline', form.deadline);
      if (pdfFile) {
        formData.append('pdfFile', pdfFile);
      }

      let res;
      if (editingAssignment) {
        // Edit Assignment
        res = await api.put(`/teacher/assignments/${editingAssignment._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Add Assignment
        res = await api.post('/teacher/assignments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        toast.success(editingAssignment ? 'Assignment updated.' : 'Assignment created.');
        setIsFormOpen(false);
        invalidateCache('/teacher/assignments');
        refetchAssignments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/teacher/assignments/${deleteId}`);
      if (res.data.success) {
        toast.success('Assignment deleted successfully.');
        setDeleteId(null);
        invalidateCache('/teacher/assignments');
        refetchAssignments();
      }
    } catch (err) {
      toast.error('Failed to delete assignment.');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewSubmissions = (assignmentObj) => {
    setSelectedAssignment(assignmentObj);
    setIsSubModalOpen(true);
    setActiveAssignmentId(assignmentObj._id);
  };

  // Grade student submission
  const handleSaveGrade = async (studentId, index) => {
    const sub = submissionsRoster[index];
    if (sub.marks === '') {
      toast.error('Please enter a grade.');
      return;
    }
    if (Number(sub.marks) < 0 || Number(sub.marks) > 10) {
      toast.error('Grade must be between 0 and 10.');
      return;
    }

    setGradingRowId(studentId);
    try {
      const res = await api.put(`/teacher/submissions/${sub.submissionId}/grade`, {
        marks: Number(sub.marks),
        feedback: sub.feedback
      });
      if (res.data.success) {
        toast.success(`Graded submission for ${sub.student.name}`);
        setSubmissionsRoster(prev => prev.map((s, idx) => idx === index ? { ...s, isGraded: true } : s));
        invalidateCache(`/teacher/assignments/${activeAssignmentId}/submissions`);
        refetchSubmissions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to grade submission.');
    } finally {
      setGradingRowId(null);
    }
  };

  const handleGradeChange = (index, field, value) => {
    setSubmissionsRoster(prev => prev.map((s, idx) => {
      if (idx === index) {
        return {
          ...s,
          [field]: value
        };
      }
      return s;
    }));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 text-left">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-secondary">
              Assignments Desk
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Create, review, edit, and grade academic assignments.
            </p>
          </div>

          <Button variant="primary" onClick={() => handleOpenForm(null)}>
            <HiPlusCircle className="mr-2 text-base" /> Post New Assignment
          </Button>
        </div>

        {/* Assignments List */}
        {loading ? (
          <SkeletonLoader count={3} />
        ) : assignments.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center shadow-sm">
            <HiDocumentText className="mx-auto text-4xl text-slate-300 mb-3" />
            <h3 className="font-heading font-bold text-lg text-secondary">No Assignments Posted</h3>
            <p className="text-sm text-slate-500 mt-1">Click the button above to upload your first assignment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assign) => (
              <Card 
                key={assign._id}
                className="p-6 bg-white flex flex-col justify-between h-full border border-slate-100 shadow-sm hover:shadow-lg transition-all"
                hoverEffect={false}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">
                      {assign.subject?.subjectCode}
                    </span>
                    <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-md">
                      Due: {new Date(assign.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-base text-secondary line-clamp-1">
                      {assign.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Subject: {assign.subject?.subjectName}</p>
                    <p className="text-xs text-text-secondary mt-3 line-clamp-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                      {assign.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center gap-3">
                  {assign.pdfFile ? (
                    <a 
                      href={assign.pdfFile} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                    >
                      <HiDownload className="text-base" /> Download Attachment
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No Attachment</span>
                  )}

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleViewSubmissions(assign)}
                      className="text-xs bg-slate-100 text-secondary hover:bg-slate-200 font-bold px-2.5 py-1.5 rounded-md transition-all"
                    >
                      Submissions
                    </button>
                    <button 
                      onClick={() => handleOpenForm(assign)}
                      className="p-1.5 text-slate-400 hover:text-primary transition-all"
                      title="Edit"
                    >
                      <HiPencilAlt className="text-lg" />
                    </button>
                    <button 
                      onClick={() => setDeleteId(assign._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-all"
                      title="Delete"
                    >
                      <HiTrash className="text-lg" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>

      {/* Add / Edit Assignment Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingAssignment ? "Edit Assignment Details" : "Publish Classroom Assignment"}>
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Subject Class</label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-sm bg-slate-50/50"
              required
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName} (Sem {s.semester})</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Assignment Title</label>
            <input 
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Sessional Test Assignment 1"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-sm bg-slate-50/50"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Detailed Description / Instructions</label>
            <textarea 
              rows="4"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide grading criteria or task descriptions..."
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-sm bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Deadline Target Date</label>
              <input 
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-sm bg-slate-50/50"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Assignment File (PDF only)</label>
              <input 
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" loading={submitting} className="w-full mt-2 py-2.5 justify-center font-bold">
            {editingAssignment ? "Update Assignment" : "Publish Assignment"}
          </Button>
        </form>
      </Modal>

      {/* Submissions Roster Modal */}
      <Modal isOpen={isSubModalOpen} onClose={() => { setIsSubModalOpen(false); setActiveAssignmentId(null); }} title={`Submissions: ${selectedAssignment?.title}`} size="large">
        {subsLoading ? (
          <SkeletonLoader count={3} />
        ) : submissionsRoster.length === 0 ? (
          <div className="text-center py-8">
            <HiInbox className="mx-auto text-4xl text-slate-200 mb-2" />
            <p className="text-sm text-slate-400 font-semibold">No students registered in this class.</p>
          </div>
        ) : (
          <div className="overflow-x-auto text-left">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead>
                <tr className="text-xs text-slate-400 font-semibold tracking-wider bg-slate-50">
                  <th className="px-6 py-3">Student Info</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submission Details</th>
                  <th className="px-6 py-3 text-center">Grade (0-10)</th>
                  <th className="px-6 py-3">Feedback Notes</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-secondary">
                {submissionsRoster.map((sub, idx) => (
                  <tr key={sub.student._id} className="hover:bg-slate-50/40">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold">{sub.student.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{sub.student.rollNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {sub.submitted ? (
                        <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                          Submitted
                        </span>
                      ) : (
                        <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-100">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub.submitted ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] text-slate-400">{sub.submittedAt}</span>
                          {sub.fileUrl ? (
                            <a 
                              href={sub.fileUrl} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-primary font-bold hover:underline"
                            >
                              <HiDownload /> View Submission
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No File Uploaded</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </td>
                    
                    {/* Grade field */}
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="number"
                        min="0"
                        max="10"
                        value={sub.marks}
                        onChange={(e) => handleGradeChange(idx, 'marks', e.target.value)}
                        disabled={!sub.submitted}
                        className="w-16 text-center px-1.5 py-1 border border-slate-200 rounded disabled:bg-slate-100 disabled:text-slate-400 text-xs font-semibold"
                        placeholder="-"
                      />
                    </td>

                    {/* Feedback field */}
                    <td className="px-6 py-4">
                      <input 
                        type="text"
                        value={sub.feedback}
                        onChange={(e) => handleGradeChange(idx, 'feedback', e.target.value)}
                        disabled={!sub.submitted}
                        className="w-full min-w-[120px] px-2.5 py-1 border border-slate-200 rounded text-xs disabled:bg-slate-100 disabled:text-slate-400"
                        placeholder="Feedback..."
                      />
                    </td>

                    <td className="px-6 py-4 text-right">
                      {sub.submitted && (
                        <Button
                          variant={sub.isGraded ? "outline" : "primary"}
                          onClick={() => handleSaveGrade(sub.student._id, idx)}
                          loading={gradingRowId === sub.student._id}
                          className="px-2.5 py-1 text-xs justify-center ml-auto font-bold"
                        >
                          {sub.isGraded ? "Update" : "Grade"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Assignment"
        message="Are you sure you want to permanently delete this assignment? Enrolled students will no longer be able to submit their files."
        loading={deleting}
      />
    </DashboardLayout>
  );
};

export default Assignments;
