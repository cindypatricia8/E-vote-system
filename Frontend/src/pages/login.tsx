import React, { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { login } from "../services/authService";
import "./login.css";

type FieldErrors = { email?: string; password?: string; general?: string };

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState<string | null>(null); 

  const validation = (): FieldErrors => {
    const e: FieldErrors = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
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
      //window.location.href = "/dashboard"; // change as needed
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
    <div className="v1_2">
      <div className="v6_25"></div>
      <span className="v6_24">Sign in with your Account to Access Monash Portal Apps</span>
      <div className="v19_2"></div>
      <span className="SignIn">Sign In</span>
      <div className="v14_11"></div>
      <div className="v6_15"></div>
        <a href="/forgot-password" className="v6_17">Forgot Password</a>
        <a href="/signup" className="v6_20">Sign Up</a>
        <span className="v6_19">Don’t have an account? </span>
        
        <div className="v6_37">
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </div>
        
      {/* Success or error message */}
      {success && (
        <div className="success-banner" role="status" aria-live="polite">
          {success}
        </div>
      )}
      {errors.general && (
        <div className="error-banner" role="alert">
          {errors.general}
        </div>
      )}

      <form className="userForm" onSubmit={onSubmit} noValidate>
        <label className="EmailText">Email</label>
        <label htmlFor="password" className="PasswordText">Password</label>

        <div className="EmailBox">
          <input
            id="email" name="email" type="email" placeholder="name@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email} className="input"
          />
          {errors.email && <div className="error-text">{errors.email}</div>}
        </div>

        <div className="PasswordBox">
          <div className="password-wrap">
            <input
              id="password" name="password"
              placeholder="Your password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password} className="input"
            />
          </div>
          {errors.password && <div className="error-text">{errors.password}</div>}
        </div>

        <div className="remember-row">
          <input id="remember" type="checkbox"
            checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <label htmlFor="remember">Remember me</label>
        </div>

        {errors.general && <div className="error-banner">{errors.general}</div>}

        
        <span className="v6_38" aria-hidden="true">Sign In</span>
      </form>
    </div>
  );
}
