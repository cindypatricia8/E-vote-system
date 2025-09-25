import React, { useEffect, useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import "./voting.css";

/* ---------- Types ---------- */
type Values = {
  firstName: string;
  lastName: string;
  studentId: string; // 8 digits
  faculty: string;
  level: string;
};

type Errors = Partial<Record<keyof Values, string>> & { general?: string };

/* ---------- Component ---------- */
export default function MsaElectionDetailsForm() {
  const [values, setValues] = useState<Values>({
    firstName: "",
    lastName: "",
    studentId: "",
    faculty: "",
    level: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof Values>(key: K, val: Values[K]) {
    setValues((v) => ({ ...v, [key]: val }));
    // clear a field's error as user types
    setErrors((e) => ({ ...e, [key]: undefined, general: undefined }));
  }

  function validate(v: Values): Errors {
    const e: Errors = {};

    if (!v.firstName.trim()) e.firstName = "First name is required";
    if (!v.lastName.trim()) e.lastName = "Last name is required";

    const sid = v.studentId.trim();
    if (!sid) e.studentId = "Student ID is required";
    else if (!/^\d{8}$/.test(sid)) e.studentId = "Student ID must be 8 digits";

    if (!v.faculty.trim()) e.faculty = "Faculty is required";
    if (!v.level.trim()) e.level = "Level is required";

    return e;
  }

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setSuccess(null);
    const vErrors = validate(values);
    if (Object.keys(vErrors).length) {
      setErrors(vErrors);
      return;
    }

    // Simulate submit
    try {
      setSubmitting(true);
      // TODO: replace with your API call
      await new Promise((r) => setTimeout(r, 500));
      setSuccess("Thanks! Your details have been recorded.");
      // optionally reset the form:
      // setValues({ firstName: "", lastName: "", studentId: "", faculty: "", level: "" });
    } catch {
      setErrors({ general: "Could not submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
        {/* Header / branding */}
        <div className="header">
          <div className="monash-logo"></div>
          <h1 style={{ margin: 0, fontWeight: 600 }}>MSA Election 2026/2027</h1>
        </div>

        <span className="instruction-text">Please enter your details below</span> 

          <form className="userForm" onSubmit={onSubmit} noValidate>
            {errors.general && (
              <div role="alert" className="error-banner">
                {errors.general}
              </div>
            )}
            {success && (
              <div role="status" className="success-banner">
                {success}
              </div>
            )}

            {/* First Name */}
            <div className="field">
              <label htmlFor="firstName" className="EmailText">First Name</label>
              <input
                id="firstName"
                className={`input ${errors.firstName ? "input-error" : ""}`}
                value={values.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p id="firstName-error" className="error-email">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="field">
              <label htmlFor="lastName" className="PasswordText">Last Name</label>
              <input
                id="lastName"
                className={`input ${errors.lastName ? "input-error" : ""}`}
                value={values.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p id="lastName-error" className="error-email">{errors.lastName}</p>
              )}
            </div>

            {/* Student ID */}
            <div className="field">
              <label htmlFor="studentId" className="PasswordText">Student ID</label>
              <input
                id="studentId"
                inputMode="numeric"
                pattern="\d*"
                className={`input ${errors.studentId ? "input-error" : ""}`}
                value={values.studentId}
                onChange={(e) =>
                  // keep only digits
                  setField("studentId", e.target.value.replace(/\D/g, ""))
                }
                aria-invalid={!!errors.studentId}
                aria-describedby={errors.studentId ? "studentId-error" : undefined}
              />
              {errors.studentId && (
                <p id="studentId-error" className="error-email">{errors.studentId}</p>
              )}
            </div>

            {/* Faculty */}
            <div className="field">
              <label htmlFor="faculty" className="PasswordText">Faculty</label>
              <input
                id="faculty"
                className={`input ${errors.faculty ? "input-error" : ""}`}
                value={values.faculty}
                onChange={(e) => setField("faculty", e.target.value)}
                aria-invalid={!!errors.faculty}
                aria-describedby={errors.faculty ? "faculty-error" : undefined}
              />
              {errors.faculty && (
                <p id="faculty-error" className="error-email">{errors.faculty}</p>
              )}
            </div>

            {/* Level */}
            <div className="field">
              <label htmlFor="level" className="PasswordText">Level</label>
              <input
                id="level"
                className={`input ${errors.level ? "input-error" : ""}`}
                value={values.level}
                onChange={(e) => setField("level", e.target.value)}
                aria-invalid={!!errors.level}
                aria-describedby={errors.level ? "level-error" : undefined}
              />
              {errors.level && (
                <p id="level-error" className="error-email">{errors.level}</p>
              )}
            </div>

            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Next"}
            </button>
          </form>
    </div>
  );
}
