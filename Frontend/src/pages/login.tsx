import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext'; 
import './login.css'

type FieldErrors = { studentId?: string; password?: string; general?: string };

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth(); 

  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState<string | null>(null);

  // if user is already logged in instantly sign in
  useEffect(() => {
    if (user) {
      navigate('/dashboard'); 
    }
  }, [user, navigate]);

  const validation = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!studentId.trim()) e.studentId = 'Student ID is required';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const v = validation();
    setErrors(v);
    setSuccess(null);
    if (Object.keys(v).length > 0) return;  

    setSubmitting(true);
    setErrors({});

    try {

      await login({ studentId: studentId.trim(), password });
      
      setSuccess(`Login successful! Redirecting...`);


      setTimeout(() => {
        navigate('/dashboard'); 
      }, 1000);

    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setErrors({ general: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
      return <div>Loading...</div>;
  }

  return (
    <div className="login-page-container">
      <div className="instruction-box">
        <span className="instruction-text">Sign in with your Account to Access Monash Portal Apps</span>
      </div>

      <div className="login-form-wrapper">
        <div className="monash-logo"></div>
        
        <div className="login-header">
          <span className="SignIn">Sign In</span>
        </div>
    
        <form className="userForm" onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="studentId" className="form-label-required">Student ID</label>
            <input
              id="studentId" 
              name="studentId" 
              type="text" 
              placeholder="Your Student ID"
              value={studentId} 
              onChange={(e) => setStudentId(e.target.value)}
              className="input"
            />
            {errors.studentId && <p className="error-email">{errors.studentId}</p>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label-required">Password</label>
            <input
              id="password" 
              name="password" 
              type="password"
              placeholder="Your password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
            {errors.password && <p className="error-pass">{errors.password}</p>}
          </div>

          <div className="remember-row">
            <input 
            id="remember" 
            type="checkbox" />
            <label htmlFor="remember">Remember me</label>
          </div>
          
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>

          {errors.general && <div className="error-alert">{errors.general}</div>}
          {success && <div className="success-alert">{success}</div>}
        </form>
        
        <div className="toggle-container">
          <span className="no-account">Don’t have an account?</span>
          <button type="button" onClick={() => navigate('/register')} className="sign-up">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;