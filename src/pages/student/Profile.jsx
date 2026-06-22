import { useState, useEffect } from 'react';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useCachedGet } from '../../hooks/useCachedGet';
import DashboardLayout from '../../components/DashboardLayout';
import SkeletonLoader from '../../components/SkeletonLoader';
import { motion } from 'framer-motion';
import {
  HiUserCircle, HiPencil, HiSave, HiPhone, HiMail,
  HiIdentification, HiAcademicCap, HiLockClosed, HiShieldCheck
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const FieldRow = ({ label, icon: Icon, value, editable, name, onChange, type = 'text', readOnly = false }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-4 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2 sm:w-44 shrink-0">
      <Icon className="text-primary text-base" />
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</span>
    </div>
    {editable && !readOnly ? (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
      />
    ) : (
      <span className="flex-1 text-sm font-medium text-secondary">{value || '—'}</span>
    )}
  </div>
);

const StudentProfile = () => {
  useDocumentMetadata(
    'My Profile | GPGC Lakki Marwat',
    'Manage your student profile, personal information, and academic details.'
  );

  const { user } = useAuth();
  const { data: profile, loading, refetch } = useCachedGet('/student/profile');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        mobileNumber: profile.mobileNumber,
        fatherName: profile.fatherName,
        address: profile.address,
      });
    }
  }, [profile]);

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPw, setChangingPw] = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/student/profile', formData);
      if (res.data.success) {
        toast.success('Profile updated successfully!');
        setEditing(false);
        refetch();
      }
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setChangingPw(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPwSection(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Password change failed.');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) return <DashboardLayout><SkeletonLoader count={5} /></DashboardLayout>;

  const initials = profile?.name?.slice(0, 2).toUpperCase() || 'ST';

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-4xl">

        {/* Profile Banner */}
        <div className="bg-gradient-to-r from-secondary to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-3xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center font-heading font-extrabold text-4xl text-primary shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h1 className="font-heading font-extrabold text-2xl">{profile?.name}</h1>
              <p className="text-slate-400 text-sm">Computer Science Department</p>
              <div className="flex flex-wrap gap-3 pt-2 justify-center sm:justify-start">
                {[
                  ['Reg #', profile?.registrationNumber],
                  ['Roll #', profile?.rollNumber],
                  ['Semester', profile?.semester],
                  ['Section', profile?.section],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-center">
                    <span className="block text-[9px] text-slate-400 uppercase font-semibold">{label}</span>
                    <span className="block text-sm font-bold text-white leading-tight">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
              className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors shrink-0 text-sm ${
                editing ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {editing ? (
                <><HiSave /> {saving ? 'Saving…' : 'Save Changes'}</>
              ) : (
                <><HiPencil /> Edit Profile</>
              )}
            </button>
          </div>
        </div>

        {/* Personal Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200/50 rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <HiUserCircle className="text-primary text-xl" />
            <h2 className="font-heading font-bold text-base text-secondary">Personal Information</h2>
            {editing && <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full ml-auto">Editing Mode</span>}
          </div>

          <div>
            <FieldRow label="Full Name"   icon={HiUserCircle}     value={formData.name}         editable={editing} name="name"         onChange={handleChange} />
            <FieldRow label="Email"       icon={HiMail}           value={formData.email}        editable={editing} name="email"        onChange={handleChange} type="email" />
            <FieldRow label="Mobile"      icon={HiPhone}          value={formData.mobileNumber} editable={editing} name="mobileNumber" onChange={handleChange} type="tel" />
            <FieldRow label="Father Name" icon={HiIdentification} value={formData.fatherName}   editable={editing} name="fatherName"   onChange={handleChange} />
            <FieldRow label="Address"     icon={HiIdentification} value={formData.address}      editable={editing} name="address"      onChange={handleChange} />
          </div>

          {editing && (
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditing(false)}
                className="flex-1 border border-slate-200 text-text-secondary font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </motion.div>

        {/* Academic Info (read-only) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-slate-200/50 rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <HiAcademicCap className="text-primary text-xl" />
            <h2 className="font-heading font-bold text-base text-secondary">Academic Information</h2>
          </div>
          <div>
            <FieldRow label="Reg Number"  icon={HiIdentification} value={profile?.registrationNumber} readOnly />
            <FieldRow label="Roll Number" icon={HiIdentification} value={profile?.rollNumber}          readOnly />
            <FieldRow label="Semester"    icon={HiAcademicCap}    value={profile?.semester?.toString()} readOnly />
            <FieldRow label="Section"     icon={HiAcademicCap}    value={profile?.section}              readOnly />
            <FieldRow label="Session"     icon={HiAcademicCap}    value={profile?.academicSession}      readOnly />
            <FieldRow label="Department"  icon={HiAcademicCap}    value="Computer Science"              readOnly />
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-200/50 rounded-2xl shadow-sm overflow-hidden"
        >
          <button
            onClick={() => setShowPwSection((p) => !p)}
            className="flex items-center justify-between w-full p-6 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HiLockClosed className="text-primary text-xl" />
              <h2 className="font-heading font-bold text-base text-secondary">Change Password</h2>
            </div>
            <span className={`text-text-secondary text-sm transition-transform ${showPwSection ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {showPwSection && (
            <div className="px-6 pb-6 border-t border-slate-100">
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 pt-5">
                {[
                  ['currentPassword', 'Current Password', 'Your existing password'],
                  ['newPassword',     'New Password',     'Minimum 6 characters'],
                  ['confirmPassword', 'Confirm Password', 'Re-enter new password'],
                ].map(([field, label, placeholder]) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wide">{label}</label>
                    <input
                      type="password"
                      placeholder={placeholder}
                      value={pwForm[field]}
                      onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                ))}
                <button type="submit" disabled={changingPw}
                  className="flex items-center justify-center gap-2 bg-secondary text-white font-semibold py-3 rounded-xl hover:bg-secondary/90 transition-colors text-sm disabled:opacity-60 mt-2">
                  <HiShieldCheck /> {changingPw ? 'Changing…' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </motion.div>

      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
