import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import './login.css'; 


type FieldErrors = { studentId?: string; password?: string; general?: string };

export default function Login() {
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
      const { user } = await login({ studentId: studentId.trim(), password });
      setSuccess(`Welcome back, ${user.name}! Redirecting...`);

      // Redirect after a short delay to show the success message
      setTimeout(() => {
        navigate('/voting'); 
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
        
        <label htmlFor="password" className="PasswordText">Pa
