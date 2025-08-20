import React, { useState, useEffect} from 'react';
import type { ChangeEvent, FormEvent } from 'react'
import { fetchUsers, createUser, updateUser, deleteUser } from './api/apiService';
import type { User } from './types';
import './App.css';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Fetch initial users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetchUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Name and email are required');
      return;
    }

    try {
      if (editingUserId) {
        // Update existing user
        await updateUser(editingUserId, formData);
      } else {
        // Create new user
        await createUser(formData);
      }
      loadUsers(); // Refresh the user list
      resetForm();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleEdit = (user: User) => {
    setFormData({ name: user.name, email: user.email });
    setEditingUserId(user._id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        loadUsers(); // Refresh the user list
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '' });
    setEditingUserId(null);
  };

  return (
    <div className="container">
      <h1>User Management</h1>

      <form className="user-form" onSubmit={handleFormSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <div className="form-actions">
          <button type="submit">{editingUserId ? 'Update User' : 'Add User'}</button>
          {editingUserId && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="user-list">
        {users.map((user) => (
          <li key={user._id} className="user-item">
            <div className="info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <div className="actions">
              <button className="edit-btn" onClick={() => handleEdit(user)}>
                Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(user._id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;