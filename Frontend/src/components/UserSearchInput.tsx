import React, { useState, useEffect, useRef } from 'react';
import { searchUsers } from '../api/apiService';
import type { User } from '../types';
import './UserSearchInput.css';

interface UserSearchInputProps {
  onUserSelect: (user: User) => void;
  placeholder?: string;
  excludeIds?: string[]; // IDs to filter out from search results
}

const UserSearchInput: React.FC<UserSearchInputProps> = ({ onUserSelect, placeholder, excludeIds = [] }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeout = useRef<number | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    
    setIsLoading(true);
    debounceTimeout.current = window.setTimeout(async () => {
      try {
        const response = await searchUsers(query);
        // Filter out any users whose IDs are in the excludeIds list
        const availableUsers = response.data.data.users.filter(
          user => !excludeIds.includes(user._id)
        );
        setResults(availableUsers);
      } catch (error) {
        console.error("Failed to search users:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [query, excludeIds]);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (user: User) => {
    onUserSelect(user);
    setQuery('');
    setResults([]);
    setIsFocused(false);
  };

  return (
    <div className="search-input-container" ref={componentRef}>
      <input
        type="text"
        className="form-input"
        placeholder={placeholder || 'Search by name or student ID...'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        autoComplete="off"
      />
      {isLoading && <div className="spinner"></div>}
      
      {isFocused && query.length > 1 && (
        <div className="search-results">
          {!isLoading && results.length === 0 && (
            <div className="search-empty-state">No users found.</div>
          )}
          {results.map(user => (
            <div
              key={user._id}
              className="search-result-item"
              onClick={() => handleSelect(user)}
            >
              {user.name}
              <span className="student-id">({user.studentId})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserSearchInput;