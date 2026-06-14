import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  getActiveUsers,
  updateUserAdmin,
  deleteUserAdmin,
  AdminUser,
} from '../api/usersApi';
import UserAvatar from '../components/UserAvatar';
import { formatDate } from '../utils/dateUtils';

const AdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'User' });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAllUsers,
  });

  const { data: activeUsers = [] } = useQuery({
    queryKey: ['admin-active-users'],
    queryFn: getActiveUsers,
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; email: string; role: string } }) =>
      updateUserAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-active-users'] });
    },
  });

  const startEdit = (user: AdminUser) => {
    setEditingId(user._id);
    setEditForm({ name: user.name, email: user.email, role: user.role });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`למחוק את המשתמש ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <h1>ניהול מערכת</h1>
          <p>ניהול משתמשים וצפייה בפעילות</p>
        </div>
      </header>

      <section className="admin-active-section">
        <h2>משתמשים פעילים כעת ({activeUsers.length})</h2>
        <p className="admin-hint">משתמשים שהיו פעילים ב-5 דקות האחרונות</p>
        {activeUsers.length === 0 ? (
          <p>אין משתמשים פעילים כרגע</p>
        ) : (
          <div className="admin-active-list">
            {activeUsers.map((u) => (
              <div key={u._id} className="admin-active-chip">
                <UserAvatar name={u.name} avatarUrl={u.avatarUrl} size={32} />
                <span>{u.name}</span>
                {u.lastSeen && <small>{formatDate(u.lastSeen)}</small>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="admin-users-section">
        <h2>כל המשתמשים ({users.length})</h2>
        {isLoading ? (
          <p>טוען...</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>משתמש</th>
                  <th>אימייל</th>
                  <th>תגובות</th>
                  <th>תפקיד</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    {editingId === user._id ? (
                      <>
                        <td>
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="admin-edit-input"
                          />
                        </td>
                        <td>
                          <input
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="admin-edit-input"
                          />
                        </td>
                        <td>{user.commentsCount ?? 0}</td>
                        <td>
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="admin-edit-input"
                          >
                            <option value="User">משתמש</option>
                            <option value="Admin">מנהל</option>
                          </select>
                        </td>
                        <td className="admin-actions">
                          <button
                            className="button"
                            onClick={() => updateMutation.mutate({ id: user._id, data: editForm })}
                          >
                            שמור
                          </button>
                          <button className="navbar-button" onClick={() => setEditingId(null)}>
                            ביטול
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div className="admin-user-cell">
                            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size={32} />
                            {user.name}
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.commentsCount ?? 0}</td>
                        <td>
                          <span className={user.role === 'Admin' ? 'admin-role-badge' : ''}>
                            {user.role === 'Admin' ? 'מנהל' : 'משתמש'}
                          </span>
                        </td>
                        <td className="admin-actions">
                          <button className="navbar-button" onClick={() => startEdit(user)}>
                            ערוך
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() => handleDelete(user._id, user.name)}
                          >
                            מחק
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminPage;
