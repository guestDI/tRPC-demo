import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { styles } from '../styles';

type User = {
  id: string;
  name: string;
  email: string;
};

const userDetailsStyles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginTop: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '1.5rem',
    color: '#2c3e50',
    marginBottom: '20px',
    fontWeight: '600',
  },
  info: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1rem',
    color: '#2c3e50',
  },
  label: {
    fontWeight: '600',
    minWidth: '60px',
  },
  value: {
    color: '#34495e',
  },
};

export function UsersList() {
  const usersQuery = trpc.getUsers.useQuery();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const userByIdQuery = trpc.getUserById.useQuery(selectedUserId as string, {
    enabled: !!selectedUserId,
  });
  
  const utils = trpc.useUtils();
  const deleteUserMutation = trpc.deleteUser.useMutation({
    onSuccess: () => {
      utils.getUsers.invalidate();
      if (selectedUserId) {
        setSelectedUserId(null);
      }
    },
  });

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (usersQuery.isLoading) return <p style={styles.loading}>Loading users...</p>;
  if (usersQuery.error) return <p style={styles.error}>Error loading users: {usersQuery.error.message}</p>;

  return (
    <div>
      <h2 style={styles.sectionTitle}>Users</h2>
      <ul style={styles.userList}>
        {usersQuery.data?.map((user: User) => (
          <li key={user.id} style={styles.userItem}>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user.name}</span>
              <span style={styles.userEmail}>{user.email}</span>
            </div>
            <div style={styles.buttonGroup}>
              <button 
                style={styles.button}
                onClick={() => setSelectedUserId(user.id)}
              >
                Show Details
              </button>
              <button 
                style={styles.deleteButton}
                onClick={() => handleDelete(user.id)}
                disabled={deleteUserMutation.isPending}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {selectedUserId && (
        <div style={userDetailsStyles.container}>
          <h3 style={userDetailsStyles.title}>User Details</h3>
          {userByIdQuery.isLoading && <p style={styles.loading}>Loading user details...</p>}
          {userByIdQuery.error && (
            <p style={styles.error}>Error loading user details: {userByIdQuery.error.message}</p>
          )}
          {userByIdQuery.data && (
            <div style={userDetailsStyles.info}>
              <div style={userDetailsStyles.item}>
                <span style={userDetailsStyles.label}>ID:</span>
                <span style={userDetailsStyles.value}>{userByIdQuery.data.id}</span>
              </div>
              <div style={userDetailsStyles.item}>
                <span style={userDetailsStyles.label}>Name:</span>
                <span style={userDetailsStyles.value}>{userByIdQuery.data.name}</span>
              </div>
              <div style={userDetailsStyles.item}>
                <span style={userDetailsStyles.label}>Email:</span>
                <span style={userDetailsStyles.value}>{userByIdQuery.data.email}</span>
              </div>
              <div style={styles.buttonGroup}>
                <button 
                  style={styles.deleteButton}
                  onClick={() => handleDelete(userByIdQuery.data.id)}
                  disabled={deleteUserMutation.isPending}
                >
                  Delete User
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 