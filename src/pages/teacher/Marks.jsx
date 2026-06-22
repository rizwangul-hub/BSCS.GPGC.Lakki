import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlusCircle, HiDownload, HiUpload, HiClipboardList, HiCheckCircle, HiExclamationCircle, HiSearch } from 'react-icons/hi';
import { useCachedGet, invalidateCache } from '../../hooks/useCachedGet';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FileUpload from '../../components/FileUpload';
import Modal from '../../components/Modal';
import SkeletonLoader from '../../components/SkeletonLoader';
import { toast } from 'react-hot-toast';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';

const CATEGORIES = [
  { label: 'Mid Term (30)', key: 'midMarks', max: 30 },
  { label: 'Presentation (5)', key: 'presentation', max: 5 },
  { label: 'Test 1 (5)', key: 'test1', max: 5 },
  { label: 'Test 2 (5)', key: 'test2', max: 5 },
  { label: 'Assignment (5)', key: 'assignment', max: 5 },
  { label: 'Quiz (5)', key: 'quiz', max: 5 },
  { label: 'Attendance (5)', key: 'attendanceMarks', max: 5 },
];

const Marks = () => {
  useDocumentMetadata(
    "Marks Management | Teacher Portal",
    "Enter, edit, or bulk upload sessional grades for students."
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId') || '';

  // Dropdowns
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectId);
  const [selectedCategory, setSelectedCategory] = useState('midMarks');
  
  // States
  const [roster, setRoster] = useState([]); // Array of { student, marks }
  const [savingRowId, setSavingRowId] = useState(null);
  const [savingAll, setSavingAll] = useState(false);
  
  // Search
  const [search, setSearch] = useState('');
  
  // Excel Modal
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);

  // Fetch Assigned Subjects using cache
  const { data: subjectsData, loading: subjectsLoading } = useCachedGet('/teacher/subjects');
  const subjects = subjectsData || [];

  useEffect(() => {
    if (subjectsData && subjectsData.length > 0 && !selectedSubject) {
      setSelectedSubject(subjectsData[0]._id);
    }
  }, [subjectsData, selectedSubject]);

  // Fetch Roster when subject changes using cache
  const rosterParams = selectedSubject ? { subject: selectedSubject } : null;
  const { data: rosterData, loading, refetch: refetchRoster } = useCachedGet(
    selectedSubject ? '/teacher/marks' : null,
    rosterParams
  );

  useEffect(() => {
    if (rosterData) {
      setRoster(rosterData);
    } else {
      setRoster([]);
    }
  }, [rosterData]);

  const activeSubjectObj = subjects.find(s => s._id === selectedSubject);
  const activeCategoryObj = CATEGORIES.find(c => c.key === selectedCategory);

  // Handle obtained marks input change
  const handleMarksChange = (studentId, value) => {
    const numVal = value === '' ? '' : Number(value);
    
    // Check validation against category max
    if (numVal !== '' && (numVal < 0 || numVal > activeCategoryObj.max)) {
      toast.error(`Marks cannot exceed maximum of ${activeCategoryObj.max}`);
      return;
    }

    setRoster(prev => prev.map(item => {
      if (item.student._id === studentId) {
        const currentMarks = item.marks || {
          midMarks: 0,
          presentation: 0,
          test1: 0,
          test2: 0,
          assignment: 0,
          quiz: 0,
          attendanceMarks: 0
        };
        return {
          ...item,
          marks: {
            ...currentMarks,
            [selectedCategory]: numVal
          },
          isDirty: true // Track modified state
        };
      }
      return item;
    }));
  };

  // Save row-level changes
  const handleSaveRow = async (item) => {
    if (!selectedSubject) return;
    const value = item.marks ? item.marks[selectedCategory] : 0;
    
    if (value === '') {
      toast.error('Please enter a valid marks value.');
      return;
    }

    setSavingRowId(item.student._id);
    try {
      const payload = {
        student: item.student._id,
        subject: selectedSubject,
        semester: activeSubjectObj.semester,
        midMarks: item.marks?.midMarks || 0,
        presentation: item.marks?.presentation || 0,
        test1: item.marks?.test1 || 0,
        test2: item.marks?.test2 || 0,
        assignment: item.marks?.assignment || 0,
        quiz: item.marks?.quiz || 0,
        attendanceMarks: item.marks?.attendanceMarks || 0,
      };

      let res;
      if (item.marks && item.marks._id) {
        // Marks already exist in DB -> Update it
        res = await api.put(`/teacher/marks/${item.marks._id}`, payload);
      } else {
        // Marks don't exist -> Create new record
        res = await api.post('/teacher/marks', payload);
      }

      if (res.data.success) {
        const savedRecord = res.data.data;
        setRoster(prev => prev.map(r => {
          if (r.student._id === item.student._id) {
            return {
              ...r,
              marks: savedRecord,
              isDirty: false
            };
          }
          return r;
        }));
        toast.success(`Saved marks for ${item.student.name}`);
        invalidateCache('/teacher/marks');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save marks.');
    } finally {
      setSavingRowId(null);
    }
  };

  const handleSaveAll = async () => {
    const dirtyItems = roster.filter(item => item.isDirty);
    if (dirtyItems.length === 0) return;

    // Validate all dirty items first
    for (const item of dirtyItems) {
      const val = item.marks ? item.marks[selectedCategory] : '';
      if (val === '') {
        toast.error(`Please enter valid marks for ${item.student.name}`);
        return;
      }
      if (val < 0 || val > activeCategoryObj.max) {
        toast.error(`Marks for ${item.student.name} cannot exceed ${activeCategoryObj.max}`);
        return;
      }
    }

    setSavingAll(true);
    let successCount = 0;
    try {
      let updatedRoster = [...roster];
      for (const item of dirtyItems) {
        const payload = {
          student: item.student._id,
          subject: selectedSubject,
          semester: activeSubjectObj.semester,
          midMarks: item.marks?.midMarks || 0,
          presentation: item.marks?.presentation || 0,
          test1: item.marks?.test1 || 0,
          test2: item.marks?.test2 || 0,
          assignment: item.marks?.assignment || 0,
          quiz: item.marks?.quiz || 0,
          attendanceMarks: item.marks?.attendanceMarks || 0,
        };

        let res;
        if (item.marks && item.marks._id) {
          res = await api.put(`/teacher/marks/${item.marks._id}`, payload);
        } else {
          res = await api.post('/teacher/marks', payload);
        }

        if (res.data.success) {
          const savedRecord = res.data.data;
          updatedRoster = updatedRoster.map(r => {
            if (r.student._id === item.student._id) {
              return {
                ...r,
                marks: savedRecord,
                isDirty: false
              };
            }
            return r;
          });
          successCount++;
        }
      }
      setRoster(updatedRoster);
      toast.success(`Successfully saved marks for ${successCount} student(s)`);
      invalidateCache('/teacher/marks');
    } catch (err) {
      toast.error('Failed to save some marks records.');
    } finally {
      setSavingAll(false);
    }
  };

  // Download excel template
  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/teacher/marks/template', {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Marks_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded.');
    } catch (err) {
      toast.error('Failed to download Excel template.');
    }
  };

  // Upload Excel marks sheet
  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      toast.error('Please choose a file to upload.');
      return;
    }

    setUploadingExcel(true);
    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('subject', selectedSubject);
      formData.append('semester', activeSubjectObj.semester);

      const res = await api.post('/teacher/marks/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Excel marks sheet processed successfully.');
        setIsExcelModalOpen(false);
        setExcelFile(null);
        invalidateCache('/teacher/marks');
        refetchRoster();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process Excel file.');
    } finally {
      setUploadingExcel(false);
    }
  };

  const filteredRoster = roster.filter(item => 
    item.student.name.toLowerCase().includes(search.toLowerCase()) ||
    item.student.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
    item.student.registrationNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 text-left">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-secondary">
              Marks Entry Desk
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Select class, sessional category parameter, and fill or upload Excel spreadsheets.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleDownloadTemplate} className="hover:bg-slate-50 border-slate-200">
              <HiDownload className="mr-2 text-base" /> Download Template
            </Button>
            <Button variant="primary" onClick={() => setIsExcelModalOpen(true)}>
              <HiUpload className="mr-2 text-base" /> Bulk Excel Upload
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between" hoverEffect={false}>
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            <div className="flex flex-col gap-1 w-full md:w-56">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject Class</label>
              {subjectsLoading ? (
                <div className="h-9 bg-slate-100 animate-pulse rounded-lg" />
              ) : (
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none text-xs text-secondary bg-slate-50/50 w-full"
                >
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.subjectName} (Sem {s.semester})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex flex-col gap-1 w-full md:w-44">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Semester</label>
              <div className="px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-500 bg-slate-100 font-semibold select-none">
                {activeSubjectObj ? `Semester ${activeSubjectObj.semester}` : 'N/A'}
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-56">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sessional Parameter</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none text-xs text-secondary bg-slate-50/50 w-full"
              >
                {CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0">
            <div className="relative w-full md:w-64">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-base" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student..."
                className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-xs text-secondary bg-slate-50/50 w-full"
              />
            </div>
            <Button
              onClick={handleSaveAll}
              loading={savingAll}
              disabled={!roster.some(item => item.isDirty)}
              className="py-2 px-4 text-xs text-white font-bold whitespace-nowrap bg-primary shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save All
            </Button>
          </div>
        </Card>

        {/* Student Table */}
        <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm">
          {loading ? (
            <SkeletonLoader count={4} />
          ) : roster.length === 0 ? (
            <div className="text-center py-12">
              <HiClipboardList className="mx-auto text-4xl text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 font-semibold">No students enrolled in this subject class.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead>
                  <tr className="text-xs text-slate-400 font-semibold tracking-wider bg-slate-50">
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Registration</th>
                    <th className="px-6 py-4">Roll Number</th>
                    <th className="px-6 py-4 text-center">Max Marks</th>
                    <th className="px-6 py-4 text-center w-36">Obtained Marks</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-secondary">
                  <AnimatePresence>
                    {filteredRoster.map((item) => {
                      const marksObtained = item.marks ? item.marks[selectedCategory] : '';
                      const isGraded = item.marks && item.marks._id;
                      
                      return (
                        <motion.tr
                          key={item.student._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-slate-50/40"
                        >
                          <td className="px-6 py-4 font-semibold">{item.student.name}</td>
                          <td className="px-6 py-4 text-xs font-mono">{item.student.registrationNumber}</td>
                          <td className="px-6 py-4 text-xs font-mono">{item.student.rollNumber}</td>
                          <td className="px-6 py-4 text-center font-bold text-slate-400">
                            {activeCategoryObj?.max}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max={activeCategoryObj?.max}
                              step="0.5"
                              value={marksObtained}
                              onChange={(e) => handleMarksChange(item.student._id, e.target.value)}
                              className="w-20 text-center px-2 py-1 border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary rounded-md font-semibold text-xs text-secondary bg-slate-50/50"
                              placeholder="-"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isGraded ? (
                              <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                                <HiCheckCircle className="text-emerald-500" /> Graded
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-full border border-amber-100">
                                <HiExclamationCircle className="text-amber-500" /> Ungraded
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant={item.isDirty ? 'primary' : 'outline'}
                              onClick={() => handleSaveRow(item)}
                              loading={savingRowId === item.student._id}
                              className="px-3 py-1 text-xs justify-center ml-auto font-bold"
                            >
                              Save
                            </Button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                  
                  {filteredRoster.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-xs text-slate-400">
                        No matching students found in the roster.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Excel Upload Modal */}
      <Modal isOpen={isExcelModalOpen} onClose={() => setIsExcelModalOpen(false)} title="Upload Spreadsheet Marks">
        <form onSubmit={handleExcelUpload} className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5 border border-dashed border-slate-200 p-6 rounded-xl text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <HiUpload className="mx-auto text-4xl text-slate-300 mb-2" />
            <span className="text-xs font-semibold text-slate-700">Choose Excel sheet template</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Supports .xlsx or .xls file formats</span>
            <input 
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setExcelFile(e.target.files[0])}
              className="mt-4 mx-auto w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/15 file:text-primary hover:file:bg-primary/25 cursor-pointer"
              required
            />
            {excelFile && (
              <span className="text-xs font-bold text-primary mt-2">Selected: {excelFile.name}</span>
            )}
          </div>

          <Button type="submit" variant="primary" loading={uploadingExcel} className="w-full mt-2 py-2.5 justify-center font-bold">
            Process Excel Roster
          </Button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Marks;
