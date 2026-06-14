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
import UserTableRow from '../components/admin/UserTableRow'; // 🔥 הייבוא החדש

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

      {/* מדור משתמשים פעילים */}
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

      {/* מדור טבלת המשתמשים */}
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
                  <UserTableRow
                    key={user._id}
                    user={user}
                    isEditing={editingId === user._id}
                    editForm={editForm}
                    onEditFormChange={(fields) => setEditForm((prev) => ({ ...prev, ...fields }))}
                    onStartEdit={startEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onSave={() => updateMutation.mutate({ id: user._id, data: editForm })}
                    onDelete={handleDelete}
                  />
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