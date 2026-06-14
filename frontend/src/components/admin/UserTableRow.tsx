import React from 'react';
import UserAvatar from '../UserAvatar';
import { AdminUser } from '../../api/usersApi';

interface UserTableRowProps {
  user: AdminUser;
  isEditing: boolean;
  editForm: { name: string; email: string; role: string };
  onEditFormChange: (fields: Partial<{ name: string; email: string; role: string }>) => void;
  onStartEdit: (user: AdminUser) => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: (id: string, name: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  isEditing,
  editForm,
  onEditFormChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}) => {
  return (
    <tr>
      {isEditing ? (
        <>
          <td>
            <input
              value={editForm.name}
              onChange={(e) => onEditFormChange({ name: e.target.value })}
              className="admin-edit-input"
            />
          </td>
          <td>
            <input
              value={editForm.email}
              onChange={(e) => onEditFormChange({ email: e.target.value })}
              className="admin-edit-input"
            />
          </td>
          <td>{user.commentsCount ?? 0}</td>
          <td>
            <select
              value={editForm.role}
              onChange={(e) => onEditFormChange({ role: e.target.value })}
              className="admin-edit-input"
            >
              <option value="User">משתמש</option>
              <option value="Admin">מנהל</option>
            </select>
          </td>
          <td className="admin-actions">
            <button className="button" onClick={onSave}>
              שמור
            </button>
            <button className="navbar-button" onClick={onCancelEdit}>
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
            <button className="navbar-button" onClick={() => onStartEdit(user)}>
              ערוך
            </button>
            <button className="admin-delete-btn" onClick={() => onDelete(user._id, user.name)}>
              מחק
            </button>
          </td>
        </>
      )}
    </tr>
  );
};

export default UserTableRow;