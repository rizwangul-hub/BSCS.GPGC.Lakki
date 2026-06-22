import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

/**
 * Reusable Drag and Drop CSV/Excel File Uploader Component
 */
const FileUpload = ({
  onFileSelect,
  accept = '.csv, .xlsx, .xls, .docx, .txt, .pdf',
  loading = false,
  progress = 0,
  report = null, // { successful: [...], failed: [...] }
  title = 'Upload Registration List',
  subtitle = 'Drag & drop Excel/CSV/Word/PDF/Text file here, or click to browse files',
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left w-full">
      <div className="border border-slate-200/60 bg-slate-50/30 rounded-2xl p-6">
        <h4 className="font-heading font-extrabold text-sm text-secondary mb-1">
          {title}
        </h4>
        <p className="text-xs text-slate-400 font-body mb-4">
          File format must contain registration numbers.
        </p>

        {/* Drag and Drop Box */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-slate-200 hover:border-primary hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={loading}
            className="hidden"
          />

          <span className="text-3xl mb-3">📁</span>
          <span className="font-semibold text-xs text-secondary leading-tight mb-1">
            {subtitle}
          </span>
          <span className="text-[10px] text-slate-400 font-body">
            Supports Excel (.xlsx, .xls), Word (.docx), PDF (.pdf), CSV, and Text (.txt) lists up to 10MB
          </span>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="mt-6 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>Uploading and processing...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-primary h-full rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Success/Failure Report Card */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4"
        >
          <h5 className="font-heading font-extrabold text-sm text-secondary">
            Process Upload Report
          </h5>

          {/* Counts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl flex flex-col">
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">
                Success Count
              </span>
              <span className="font-heading font-black text-2xl text-green-700">
                {report.successful?.length || 0}
              </span>
            </div>
            <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl flex flex-col">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">
                Failed Rows
              </span>
              <span className="font-heading font-black text-2xl text-red-700">
                {report.failed?.length || 0}
              </span>
            </div>
          </div>

          {/* Failure Log stream */}
          {report.failed && report.failed.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-secondary">Detailed Error Log</span>
              <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50/50 divide-y divide-slate-100 flex flex-col">
                {report.failed.map((row, idx) => (
                  <div key={idx} className="py-2 text-[11px] font-body text-slate-600 flex justify-between gap-4">
                    <span className="font-semibold text-secondary">
                      {row.registrationNumber || row.RegistrationNumber || `Row #${idx + 1}`}
                    </span>
                    <span className="text-red-500 text-right leading-tight">
                      {row.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
