import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiPhone, HiMap, HiAcademicCap, HiBookmark, HiIdentification } from 'react-icons/hi';
import { useCachedGet } from '../../hooks/useCachedGet';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/Card';
import SkeletonLoader from '../../components/SkeletonLoader';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';

const Profile = () => {
  useDocumentMetadata(
    "My Profile | Teacher Portal",
    "View your profile information, academic designations, and assigned subjects."
  );

  // Fetch profile details using cache
  const { data: profileData, loading } = useCachedGet('/auth/me');

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 text-left">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-secondary">
            My Profile
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Overview of your instructor credentials and teaching scope.
          </p>
        </div>

        {loading ? (
          <SkeletonLoader count={2} />
        ) : !profileData ? (
          <div className="bg-white border border-slate-200 p-8 text-center rounded-2xl shadow-sm">
            <p className="text-sm text-slate-400 font-semibold">Failed to fetch profile information.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* left Column - Profile Card */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              <Card className="p-6 bg-white border border-slate-100 flex flex-col items-center text-center shadow-sm" hoverEffect={false}>
                <div className="h-24 w-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-extrabold text-primary text-3xl select-none mb-4">
                  {profileData.user?.name?.slice(0, 2).toUpperCase()}
                </div>
                
                <h2 className="font-heading font-bold text-lg text-secondary">
                  {profileData.user?.name}
                </h2>
                <p className="text-xs text-primary font-bold px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mt-1 select-none">
                  {profileData.profile?.designation || 'Instructor'}
                </p>

                <div className="w-full border-t border-slate-100 mt-6 pt-6 flex flex-col gap-4 text-left text-xs text-text-secondary">
                  <div className="flex items-center gap-3">
                    <HiMail className="text-slate-400 text-lg shrink-0" />
                    <span className="truncate">{profileData.user?.email || 'No email registered'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HiPhone className="text-slate-400 text-lg shrink-0" />
                    <span>{profileData.user?.mobileNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HiMap className="text-slate-400 text-lg shrink-0" />
                    <span className="line-clamp-2">{profileData.user?.address || 'No address specified'}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Academic Credentials */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card className="p-6 bg-white border border-slate-100 shadow-sm text-left" hoverEffect={false}>
                <h3 className="font-heading font-extrabold text-base text-secondary border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                  <HiAcademicCap className="text-primary text-xl" /> Academic Credentials
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructor ID</span>
                    <span className="text-sm font-bold text-secondary flex items-center gap-1.5 mt-0.5">
                      <HiIdentification className="text-slate-400 text-lg" />
                      {profileData.profile?.teacherId || 'N/A'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
                    <span className="text-sm font-semibold text-secondary flex items-center gap-1.5 mt-0.5">
                      <HiBookmark className="text-slate-400 text-lg" />
                      {profileData.profile?.department || 'Computer Science'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Highest Qualifications</span>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-text-secondary font-medium mt-1">
                      {profileData.profile?.qualification || 'Not specified'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Assigned Courses Grid */}
              <Card className="p-6 bg-white border border-slate-100 shadow-sm text-left" hoverEffect={false}>
                <h3 className="font-heading font-extrabold text-base text-secondary border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
                  <HiBookmark className="text-primary text-xl" /> Teaching Assignments
                </h3>

                {profileData.profile?.subjects?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No assigned subjects listed under your account.</p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {profileData.profile?.subjects?.map(sub => (
                      <span 
                        key={sub._id} 
                        className="inline-flex items-center text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200/50"
                      >
                        {sub.subjectName} ({sub.subjectCode} - Sem {sub.semester})
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
