import React, { useState } from "react";
import type { FormEvent } from "react";
import { login, register } from "../services/authService"; 
import "./login.css";

type FieldErrors = { studentId?: string, name?: string; email?: string; password?: string; general?: string };

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState<string | null>(null);

  const validation = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!studentId.trim()) e.studentId = "Student ID is required";
    if (!password) e.password = "Password is required";

    if (mode === 'register') {
      if (!name.trim()) e.name = "Full Name is required";
      if (!email.trim()) e.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";
    }
    return e;
  };

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const v = validation();
    setErrors(v);
    setSuccess(null);
    if (Object.keys(v).length) return;

    setSubmitting(true);
    setErrors({});
    
    try {

      if (mode === 'login') {
        const res = await login({ studentId: studentId.trim(), password });
        setSuccess(`Welcome back, ${res.user.name}!`);
      } else { // 'register' mode
        const res = await register({
          studentId: studentId.trim(),
          name: name.trim(),
          email: email.trim(),
          password,
        });
        setSuccess(`Welcome, ${res.user.name}! Your account has been created.`);
      }
      
      setTimeout(() => {
        window.location.href = "/voting";
      }, 1000);
      
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "An unknown error occurred.";
      setErrors({ general: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
    setErrors({});
    setSuccess(null);
    setStudentId("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="page">
      <div className="instruction-box">
        <div className="alert-logo" aria-hidden="true"></div>
        <span className="instruction-text">Sign in with your Account to Access Monash Portal Apps</span>
      </div>

      <div className="monash-logo"></div>
      <span className="SignIn">{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
    
    <form className="userForm" onSubmit={onSubmit} noValidate>
        
 
        {mode === 'register' && (
          <>
            <label className="EmailText">Full Name</label>
            <div className="EmailBox">
              <input
                id="name" 
                name="name" 
                type="text" 
                placeholder="Your Full Name"
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className={`input ${errors.name ? "input--error" : ""}`}
              />
               {errors.name && <p className="error-email">{errors.name}</p>}
            </div>

            <label className="EmailText">Email</label>
            <div className="EmailBox">
              <input
                id="email" 
                name="email" 
                type="email" 
                placeholder="name@university.edu"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className={`input ${errors.email ? "input--error" : ""}`}
              />
              {errors.email && <p className="error-email">{errors.email}</p>}
            </div>
          </>
        )}
        
        <label className="EmailText">Student ID</label>
        <div className="EmailBox">
          <input
            id="studentId" 
            name="studentId" 
            type="text" 
            placeholder="Your Student ID"
            value={studentId} 
            onChange={(e) => setStudentId(e.target.value)}
            className={`input ${errors.studentId ? "input--error" : ""}`}
          />
           {errors.studentId && <p id="email-error" className="error-email">{errors.studentId}</p>}
        </div>
        
        <label htmlFor="password" className="PasswordText">Password</label>
        <div className="PasswordBox">
          <div className="password-wrap">
            <input
              id="password" 
              name="password" 
              type="password"
              placeholder="Your password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className={`input ${errors.password ? "input--error" : ""}`}
            />
          </div>
          {errors.password && <div className="error-pass">{errors.password}</div>}
        </div>


        <div className="remember-row">
          <input id="remember" 
          type="checkbox"
          checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          
          <label htmlFor="remember">Remember me</label>
        </div>
        {mode === 'login' && <a href="/forgot-password" className="forgot-password">Forgot Password</a>}


        <button type="submit" className="primary-btn" disabled={submitting}>
          {submitting ? 'Submitting...' : (mode === 'login' ? 'Sign in' : 'Create Account')}
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
        <span className="no-account">{mode === 'login' ? "Don’t have an account? " : "Already have an account? "}</span>
        <button type="button" onClick={toggleMode} className="sign-up">
          {mode === 'login' ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
      
    </div>
  );
}
