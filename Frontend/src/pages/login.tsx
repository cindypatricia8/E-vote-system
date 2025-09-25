import React, { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { login } from "../services/authService";
import "./login.css";
import * as apiService from "../api/apiService";
import type { User } from "../types";

type FieldErrors = { email?: string; password?: string; general?: string };

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState<string | null>(null); 

  // useEffect((=> ))

  // Credentials Validation
  const validation = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    return e;
  };

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const v = validation();
    setErrors(v);
    setSuccess(null);
    if (Object.keys(v).length) return;

    // setSubmitting(true);
    setErrors({});
    try {
      setSubmitting(true);
      const res = await login(email.trim(), password );
      //if (res.token) tokenStore.save(res.token);
      //if (rememberMe) localStorage.setItem("auth.email", email.trim());
      //else localStorage.removeItem("auth.email");
      window.location.href = "/voting"; // change as needed
      setSuccess(`Welcome, ${res.user.name}! You are signed in.`);
      setPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
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
        
        <label className="EmailText">Email</label>
        <div className="EmailBox">
          <input
            id="email" 
            name="email" 
            type="email" 
            placeholder="name@gmail.com"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email || undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`input ${errors.email ? "input--error" : ""}`}
          />
           {errors.email && (
            <p id="email-error" className="error-email"> {errors.email}</p>
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
              value={password} onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password} className="input"
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
        <a href="/forgot-password" className="forgot-password">Forgot Password</a>

        <button type="submit" className="primary-btn">Sign in</button>

        {errors.general && (
          <div className="error-alert" role="alert" aria-live="assertive">
            {errors.general}
          </div>
        )}    
      </form>
      
      <span className="no-account">Don’t have an account? </span>
      <a href="/sign-up" className="sign-up">Sign Up</a>
      
    </div>
  );
}
