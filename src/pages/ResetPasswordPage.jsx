import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocumentMetadata from '../hooks/useDocumentMetadata';
import Button from '../components/Button';
import Card from '../components/Card';
import { toast } from 'react-hot-toast';
import { FaLock, FaArrowLeft } from 'react-icons/fa';

const ResetPasswordPage = () => {
  useDocumentMetadata(
    "Reset Password | GPGC Lakki Marwat",
    "Set your new password to restore portal account access."
  );

  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        toast.success(res.message || "Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate('/login'), 2500);
      } else {
        toast.error(res.message || "Unable to reset password. The link may have expired or is invalid.");
      }
    } catch (err) {
      toast.error("An error occurred during password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8 selection:bg-primary/20 selection:text-primary">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[150px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary text-sm font-medium mb-8 transition-colors group"
        >
          <FaArrowLeft className="text-xs transform group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        <Card glass={true} className="p-8 md:p-10 shadow-2xl bg-white/90">
          <div className="flex flex-col items-center text-center mb-6">
            <h2 className="font-heading font-extrabold text-2xl text-secondary">
              Reset Password
            </h2>
            <p className="text-sm text-text-secondary mt-1 font-body">
              Please enter and confirm your new portal password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="newPass" 
                className="text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5"
              >
                <FaLock className="text-slate-400" />
                New Password
              </label>
              <input 
                id="newPass"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-primary transition-colors text-sm text-secondary bg-slate-50/50"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label 
                htmlFor="confirmPass" 
                className="text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5"
              >
                <FaLock className="text-slate-400" />
                Confirm Password
              </label>
              <input 
                id="confirmPass"
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-primary transition-colors text-sm text-secondary bg-slate-50/50"
                required
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              loading={loading}
              className="w-full py-3 justify-center shadow-lg shadow-primary/20"
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
