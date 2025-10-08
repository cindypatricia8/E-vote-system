import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminDashboard.css'; // We can reuse the same CSS

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li><NavLink to="/admin/dashboard">Overview</NavLink></li>
          <li><NavLink to="/admin/create-election">New Election</NavLink></li>
          {/* Add analytics links here later */}
        </ul>
      </nav>
      <main className="admin-main-content">
        <Outlet /> 
      </main>
    </div>
  );
}