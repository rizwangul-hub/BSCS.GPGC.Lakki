import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { HiExclamation } from 'react-icons/hi';

/**
 * Reusable Confirmation Dialog Modal for destructive / block actions
 */
const ConfirmDialog = ({
  isOpen = false,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Please confirm to proceed.',
  confirmLabel = 'Delete Record',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'danger', // danger, warning, info
}) => {
  if (!isOpen) return null;

  const colorMap = {
    danger: {
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-primary hover:bg-primary/95',
    },
  };

  const style = colorMap[variant] || colorMap.danger;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black transition-opacity"
          />

          {/* Center alignment spacer */}
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
            &#8203;
          </span>

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="inline-block transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          >
            <div className="sm:flex sm:items-start gap-4">
              <div className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${style.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                <HiExclamation className={`h-6 w-6 ${style.iconColor}`} />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:text-left flex-grow">
                <h3 className="font-heading font-extrabold text-lg text-secondary leading-6">
                  {title}
                </h3>
                <p className="mt-2 font-body text-sm text-slate-500 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="w-full sm:w-auto py-2.5 border-slate-200 text-secondary hover:bg-slate-50"
              >
                {cancelLabel}
              </Button>
              <Button
                onClick={onConfirm}
                loading={loading}
                className={`w-full sm:w-auto py-2.5 text-white ${style.buttonBg}`}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
