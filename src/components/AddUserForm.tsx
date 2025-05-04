import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { styles } from '../styles';

export function AddUserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const utils = trpc.useUtils();
  const createUserMutation = trpc.createUser.useMutation({
    onSuccess: () => {
      setName('');
      setEmail('');
      utils.getUsers.invalidate();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate({ name, email });
  };

  return (
    <div>
      <h2 style={styles.formTitle}>Add New User</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Name
            <span style={styles.requiredMark}>*</span>
          </label>
          <input 
            style={styles.input}
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            minLength={2}
            placeholder="Enter user name"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Email
            <span style={styles.requiredMark}>*</span>
          </label>
          <input 
            style={styles.input}
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            placeholder="Enter user email"
          />
        </div>
        <button 
          type="submit" 
          disabled={createUserMutation.isPending}
          style={styles.submitButton}
        >
          {createUserMutation.isPending ? 'Adding...' : 'Add User'}
        </button>
        {createUserMutation.error && (
          <p style={styles.error}>Error: {createUserMutation.error.message}</p>
        )}
        {showSuccess && (
          <div style={styles.successMessage}>
            ✓ User added successfully!
          </div>
        )}
      </form>
    </div>
  );
} 