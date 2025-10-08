import React, { useState,  } from 'react';
import type {FormEvent} from 'react';
import { useNavigate } from 'react-router-dom'; 
import { loginUser, setAuthToken } from '../api/apiService';
import './login.css'; 

type FieldErrors = { studentId?: string; password?: string; general?: string };

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState<string | null>(null);

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
      const response  = await loginUser({ studentId: studentId.trim(), password }); // We are logging in the user here with user data
      const token = response.data.token; // We grab the token from the response data (This is the keycard)

      setAuthToken(token); // We set the keycard for the whole application so they can keep the user logged in
      setSuccess(`Welcome back, ${response.data.data.user.name}! Redirecting...`); // Respond with name by grabbing the name from response data 

      setTimeout(() => {
        navigate('/'); 
      }, 1000);

    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setErrors({ general: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="instruction-box">
        <div className="alert-logo" aria-hidden="true"></div>
        <span className="instruction-text">Sign in with your Account to Access Monash Portal Apps</span>
      </div>

      <div className="monash-logo"></div>
      <span className="SignIn">Sign In</span>
    
      <form className="userForm" onSubmit={onSubmit} noValidate>
        
        <label htmlFor="studentId" className="EmailText">Student ID</label>
        <div className="EmailBox">
          <input
            id="studentId" 
            name="studentId" 
            type="text" 
            placeholder="Your Student ID"
            value={studentId} 
            onChange={(e) => setStudentId(e.target.value)}
            className={`input ${errors.studentId ? 'input--error' : ''}`}
          />
           {errors.studentId && (
            <p id="studentId-error" className="error-email">{errors.studentId}</p>
           )}
        </div>
        
        <label htmlFor="password" className="PasswordText">Password</label>
        <div className="PasswordBox">
          <div className="password-wrap">
            <input
              id="password" 
              name="password" 
              type="password"
              placeholder="Your password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className={`input ${errors.password ? 'input--error' : ''}`}
            />
          </div>
          {errors.password && <div className="error-pass">{errors.password}</div>}
        </div>

        <div className="remember-row">
          <input 
            id="remember" 
            type="checkbox"
            checked={remember} 
            onChange={(e) => setRemember(e.target.checked)} 
          />
          <label htmlFor="remember">Remember me</label>
        </div>
        <a href="/forgot-password" className="forgot-password">Forgot Password</a>

        <button type="submit" className="primary-btn" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>

        {errors.general && (
          <div className="error-alert" role="alert" aria-live="assertive">
            {errors.general}
          </div>
        )}
        {success && (
          <div className="success-alert" role="alert" aria-live="assertive">
            {success}
          </div>
        )}
      </form>
      
      <div className="toggle-container">
        <span className="no-account">Don’t have an account? </span>
        <button type="button" onClick={() => navigate('/register')} className="sign-up">
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default LoginPage;