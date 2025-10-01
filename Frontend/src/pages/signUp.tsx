import React, { useState, } from 'react';
import type {ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom';
import { register } from '../context/authContext'; 
import type { UserRegistrationPayload } from '../types';
import './SignUp.css';


type FormErrors = Partial<Record<keyof UserRegistrationPayload | 'general' | 'surname', string>>;

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    faculty: '',
    gender: '',
    yearOfStudy: '',
    studentId: '',  
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validate = (): FormErrors => {
    const err: FormErrors = {};
    if (!formData.firstName.trim()) err.name = 'First name is required.';
    if (!formData.surname.trim()) err.surname = 'Surname is required.';
    if (!formData.studentId.trim()) err.studentId = 'ID Number is required.';
    if (!formData.email.trim()) err.email = 'Email is required.';
    if (!formData.password) err.password = 'Password is required.';
    if (!formData.faculty) err.faculty = 'Faculty is required.';
    if (!formData.gender) err.gender = 'Gender is required.';
    if (!formData.yearOfStudy) err.yearOfStudy = 'Year of Study is required.';
    return err;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setSubmitting(true);

    const payload: UserRegistrationPayload = {
      name: `${formData.firstName.trim()} ${formData.surname.trim()}`, 
      studentId: formData.studentId,
      email: formData.email,
      password: formData.password,
      faculty: formData.faculty,
      gender: formData.gender,
      yearOfStudy: parseInt(formData.yearOfStudy, 10),
    };

    try {
      const { user } = await register(payload);
      setSuccess(`Account for ${user.name} created successfully! Redirecting to login...`);
      setTimeout(() => navigate('/login'), 2000); 
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'An unknown error occurred during registration.';
      setErrors({ general: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
        <h1>Create New User</h1>
        <p>Please fill in all the required fields marked with <span className="required">*</span></p>
      </div>

      <form id="userForm" onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name <span className="required">*</span></label>
            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="surname">Surname <span className="required">*</span></label>
            <input type="text" id="surname" name="surname" value={formData.surname} onChange={handleChange} required />
            {errors.surname && <span className="error-message">{errors.surname}</span>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="faculty">Faculty <span className="required">*</span></label>
          <input type="text" id="faculty" name="faculty" value={formData.faculty} onChange={handleChange} required />
          {errors.faculty && <span className="error-message">{errors.faculty}</span>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="gender">Gender <span className="required">*</span></label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
            {errors.gender && <span className="error-message">{errors.gender}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="yearOfStudy">Year of Study <span className="required">*</span></label>
            <input type="number" id="yearOfStudy" name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} required min="1" />
            {errors.yearOfStudy && <span className="error-message">{errors.yearOfStudy}</span>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="studentId">ID Number (Student ID) <span className="required">*</span></label>
          <input type="text" id="studentId" name="studentId" value={formData.studentId} onChange={handleChange} required />
          {errors.studentId && <span className="error-message">{errors.studentId}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email <span className="required">*</span></label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password <span className="required">*</span></label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        {errors.general && <div className="general-message error-alert">{errors.general}</div>}
        {success && <div className="general-message success-alert">{success}</div>}
        
        <div className="buttons">
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" className="cancel-btn" onClick={() => navigate('/login')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
