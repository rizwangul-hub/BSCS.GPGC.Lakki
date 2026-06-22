import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExclamation, HiCheckCircle, HiCalendar, HiSearch } from 'react-icons/hi';
import { useCachedGet, invalidateCache } from '../../hooks/useCachedGet';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import Button from '../../components/Button';
import Card from '../../components/Card';
import SkeletonLoader from '../../components/SkeletonLoader';
import { toast } from 'react-hot-toast';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Attendance = () => {
  useDocumentMetadata(
    "Attendance Logs | Teacher Portal",
    "Record and manage monthly attendance sheets for your assigned classes."
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subjectId') || '';

  // Filter dropdowns
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectId);
  const [selectedMonth, setSelectedMonth] = useState('June');
  const [selectedYear, setSelectedYear] = useState(2026);
  
  // Data lists
  const [roster, setRoster] = useState([]); // Array of { student, attendance }
  const [savingRowId, setSavingRowId] = useState(null);
  
  // Search
  const [search, setSearch] = useState('');
  const [globalTotal, setGlobalTotal] = useState(30);
  const [savingAll, setSavingAll] = useState(false);

  // Fetch Assigned Subjects using cache
  const { data: subjectsData, loading: subjectsLoading } = useCachedGet('/teacher/subjects');
  const subjects = subjectsData || [];

  useEffect(() => {
    if (subjectsData && subjectsData.length > 0 && !selectedSubject) {
      setSelectedSubject(subjectsData[0]._id);
    }
  }, [subjectsData, selectedSubject]);

  // Fetch Attendance Roster using cache
  const rosterParams = selectedSubject ? { subject: selectedSubject, month: selectedMonth, year: selectedYear } : null;
  const { data: rosterData, loading, refetch: refetchRoster } = useCachedGet(
    selectedSubject ? '/teacher/attendance' : null,
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

  const handleApplyGlobalTotal = () => {
    const numVal = Number(globalTotal);
    if (!numVal || numVal < 1) {
      toast.error('Please enter a valid number of total classes.');
      return;
    }

    setRoster(prev => prev.map(item => {
      const currentAtt = item.attendance || {
        totalClasses: numVal,
        attendedClasses: 0
      };

      const attendedVal = currentAtt.attendedClasses > numVal ? numVal : currentAtt.attendedClasses;

      return {
        ...item,
        attendance: {
          ...currentAtt,
          totalClasses: numVal,
          attendedClasses: attendedVal
        },
        isDirty: true
      };
    }));

    toast.success(`Set total classes to ${numVal} for all students.`);
  };

  const handleSaveAll = async () => {
    const dirtyItems = roster.filter(item => item.isDirty);
    if (dirtyItems.length === 0) return;

    for (const item of dirtyItems) {
      const total = item.attendance ? item.attendance.totalClasses : globalTotal;
      const attended = item.attendance ? item.attendance.attendedClasses : 0;
      if (total === '' || attended === '' || Number(attended) > Number(total)) {
        toast.error(`Invalid attendance values for ${item.student.name}`);
        return;
      }
    }

    setSavingAll(true);
    let successCount = 0;
    try {
      let updatedRoster = [...roster];
      for (const item of dirtyItems) {
        const total = item.attendance ? item.attendance.totalClasses : globalTotal;
        const attended = item.attendance ? item.attendance.attendedClasses : 0;
        const payload = {
          student: item.student._id,
          subject: selectedSubject,
          month: selectedMonth,
          year: Number(selectedYear),
          totalClasses: Number(total),
          attendedClasses: Number(attended)
        };

        let res;
        if (item.attendance && item.attendance._id) {
          res = await api.put(`/teacher/attendance/${item.attendance._id}`, {
            totalClasses: Number(total),
            attendedClasses: Number(attended)
          });
        } else {
          res = await api.post('/teacher/attendance', payload);
        }

        if (res.data.success) {
          const savedRecord = res.data.data;
          updatedRoster = updatedRoster.map(r => {
            if (r.student._id === item.student._id) {
              return {
                ...r,
                attendance: savedRecord,
                isDirty: false
              };
            }
            return r;
          });
          successCount++;
        }
      }
      setRoster(updatedRoster);
      toast.success(`Successfully saved attendance sheets for ${successCount} student(s)`);
      invalidateCache('/teacher/attendance');
    } catch (err) {
      toast.error('Failed to save some attendance records.');
    } finally {
      setSavingAll(false);
    }
  };

  // Handle local change for attended/total classes
  const handleAttendanceChange = (studentId, field, value) => {
    const numVal = value === '' ? '' : Number(value);
    
    setRoster(prev => prev.map(item => {
      if (item.student._id === studentId) {
        const currentAtt = item.attendance || {
          totalClasses: globalTotal,
          attendedClasses: 0
        };

        const updatedAtt = {
          ...currentAtt,
          [field]: numVal
        };

        // Validation checks
        if (field === 'attendedClasses' && numVal !== '' && numVal > updatedAtt.totalClasses) {
          toast.error('Attended classes cannot exceed total classes.');
          return item;
        }

        return {
          ...item,
          attendance: updatedAtt,
          isDirty: true
        };
      }
      return item;
    }));
  };

  // Save row attendance log
  const handleSaveRow = async (item) => {
    if (!selectedSubject) return;
    const total = item.attendance ? item.attendance.totalClasses : globalTotal;
    const attended = item.attendance ? item.attendance.attendedClasses : 0;

    if (total === '' || attended === '') {
      toast.error('Please enter valid attended and total classes.');
      return;
    }

    if (attended > total) {
      toast.error('Attended classes cannot exceed total classes.');
      return;
    }

    setSavingRowId(item.student._id);
    try {
      const payload = {
        student: item.student._id,
        subject: selectedSubject,
        month: selectedMonth,
        year: Number(selectedYear),
        totalClasses: Number(total),
        attendedClasses: Number(attended)
      };

      let res;
      if (item.attendance && item.attendance._id) {
        // Log exists in database -> Update
        res = await api.put(`/teacher/attendance/${item.attendance._id}`, {
          totalClasses: Number(total),
          attendedClasses: Number(attended)
        });
      } else {
        // Log doesn't exist -> Create new record
        res = await api.post('/teacher/attendance', payload);
      }

      if (res.data.success) {
        const savedRecord = res.data.data;
        setRoster(prev => prev.map(r => {
          if (r.student._id === item.student._id) {
            return {
              ...r,
              attendance: savedRecord,
              isDirty: false
            };
          }
          return r;
        }));
        toast.success(`Saved attendance for ${item.student.name}`);
        invalidateCache('/teacher/attendance');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record attendance.');
    } finally {
      setSavingRowId(null);
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
        
        {/* Header */}
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-secondary">
            Class Attendance Sheets
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Specify the subject class month, and record student monthly attendance sheets.
          </p>
        </div>

        {/* Filter Card */}
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none text-xs text-secondary bg-slate-50/50 w-full"
              >
                {MONTHS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 w-full md:w-36">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Year</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none text-xs text-secondary bg-slate-50/50 w-full font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1 w-full md:w-48">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Classes (Global)</label>
              <div className="flex gap-2 w-full animate-fade-in">
                <input
                  type="number"
                  min="1"
                  value={globalTotal}
                  onChange={(e) => setGlobalTotal(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none text-xs text-secondary bg-slate-50/50 w-16 font-semibold shrink-0"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyGlobalTotal}
                  className="py-1 px-3 border-slate-200 text-secondary hover:bg-slate-50 text-[10px] font-bold whitespace-nowrap grow"
                >
                  Apply All
                </Button>
              </div>
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
              <HiCalendar className="mx-auto text-4xl text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 font-semibold">No students found for this subject semester.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead>
                  <tr className="text-xs text-slate-400 font-semibold tracking-wider bg-slate-50">
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Roll Number</th>
                    <th className="px-6 py-4 text-center">Attended Classes</th>
                    <th className="px-6 py-4 text-center">Total Classes</th>
                    <th className="px-6 py-4 text-center w-48">Attendance Ratio</th>
                    <th className="px-6 py-4 text-center">Ratios</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-secondary">
                  <AnimatePresence>
                    {filteredRoster.map((item) => {
                      const total = item.attendance ? item.attendance.totalClasses : globalTotal;
                      const attended = item.attendance ? item.attendance.attendedClasses : '';
                      
                      let percent = 0;
                      if (total > 0 && attended !== '') {
                        percent = Math.round((attended / total) * 100);
                      } else if (item.attendance && item.attendance.attendancePercentage) {
                        percent = item.attendance.attendancePercentage;
                      }

                      const isLowAttendance = percent < 75;
                      const hasLogs = item.attendance && item.attendance._id;

                      return (
                        <motion.tr
                          key={item.student._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`transition-colors duration-150 ${
                            isLowAttendance && attended !== '' 
                              ? 'bg-red-50/50 hover:bg-red-50 text-red-900 border-l-4 border-red-500' 
                              : 'hover:bg-slate-50/30'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold">{item.student.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{item.student.registrationNumber}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono">{item.student.rollNumber}</td>
                          
                          {/* Attended Input */}
                          <td className="px-6 py-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max={total || 100}
                              value={attended}
                              onChange={(e) => handleAttendanceChange(item.student._id, 'attendedClasses', e.target.value)}
                              className="w-16 text-center px-2 py-1 border border-slate-200 rounded-md text-xs font-semibold bg-white"
                              placeholder="-"
                            />
                          </td>

                          {/* Total Input */}
                          <td className="px-6 py-4 text-center">
                            <input
                              type="number"
                              min="1"
                              value={total}
                              onChange={(e) => handleAttendanceChange(item.student._id, 'totalClasses', e.target.value)}
                              className="w-16 text-center px-2 py-1 border border-slate-200 rounded-md text-xs font-semibold bg-white"
                              placeholder="30"
                            />
                          </td>

                          {/* Progress Bar UI */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 w-full justify-center">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                <span>{percent}%</span>
                                {isLowAttendance && attended !== '' && (
                                  <span className="flex items-center gap-0.5 text-red-600 font-extrabold uppercase text-[9px] tracking-wide animate-pulse">
                                    <HiExclamation className="text-red-500 text-sm" /> Low Risk
                                  </span>
                                )}
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    isLowAttendance && attended !== '' ? 'bg-red-500' : 'bg-primary'
                                  }`}
                                  style={{ width: `${Math.min(percent, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Ratio Status Badge */}
                          <td className="px-6 py-4 text-center">
                            {hasLogs ? (
                              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100 select-none">
                                <HiCheckCircle className="text-emerald-500 text-sm" /> Saved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] bg-slate-50 text-slate-500 font-bold px-2 py-0.5 rounded-full border border-slate-100 select-none">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Save Actions */}
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
                        No students found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Attendance;
