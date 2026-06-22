import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocumentMetadata from '../hooks/useDocumentMetadata';
import Button from '../components/Button';
import Card from '../components/Card';
import { toast } from 'react-hot-toast';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

const ForgotPasswordPage = () => {
  useDocumentMetadata(
    "Forgot Password | GPGC Lakki Marwat",
    "Request a secure password reset link for your college portal account."
  );

  const [inputVal, setInputVal] = useState('');
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputVal) {
      toast.error("Please enter your registered email or mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(inputVal);
      if (res.success) {
        toast.success(res.message || "Password reset link sent to your registered email!");
        // We can redirect to login after short delay
        setTimeout(() => navigate('/login'), 3000);
      } else {
        toast.error(res.message || "Unable to send reset link. User profile may not exist.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
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
              Forgot Password
            </h2>
            <p className="text-sm text-text-secondary mt-2 font-body leading-relaxed">
              Enter your registered email or mobile number. We will send a secure link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="inputField" 
                className="text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5"
              >
                <FaEnvelope className="text-slate-400" />
                Email / Mobile Number
              </label>
              <input 
                id="inputField"
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. user@gpgclm.edu.pk or 03001234567"
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
              Send Reset Link
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
