import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, ArrowRight, LogIn } from 'lucide-react';

export default function VerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl border border-surface-container-high text-center"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <Mail className="text-primary" size={40} />
        </div>

        <h1 className="text-3xl font-black text-primary tracking-tighter mb-4">
          Verify Your Email
        </h1>
        
        <p className="text-on-surface-variant font-medium text-sm leading-relaxed mb-10">
          We have sent you a verification email to <span className="text-primary font-bold">{email}</span>. Please verify it and log in.
        </p>

        <button 
          onClick={() => navigate('/auth')}
          className="w-full bg-primary text-white py-5 rounded-full font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <LogIn size={20} />
          Go to Login
        </button>

        <div className="mt-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            Didn't receive the email? Check your spam folder.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
