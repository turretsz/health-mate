// src/components/Profile.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    gender: user?.gender || 'other',
    birthDate: user?.birthDate || '',
  });
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await updateProfile({
        name: form.name.trim(),
        gender: form.gender,
        birthDate: form.birthDate,
        email: form.email,
      });
      setMessage('Đã lưu thông tin cá nhân.');
      setEditing(false);
    } catch (e) {
      setError(e.message || 'Không thể lưu thông tin.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!security.currentPassword || !security.newPassword) {
      setError('Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await changePassword(security);
      setMessage('Đã đổi mật khẩu.');
      setSecurity({ currentPassword: '', newPassword: '' });
    } catch (e) {
      setError(e.message || 'Không thể đổi mật khẩu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-width profile-page">
      <div className="profile-card">
        <div className="profile-head">
          <div>
            <p className="label">Thông tin cá nhân</p>
            <h1>{user.name}</h1>
            <p className="sub">Email: {user.email}</p>
            <p className="sub">User ID: {user.id}</p>
            <p className="sub">Gói: {user.plan} {user.role === 'admin' ? '• Admin' : ''}</p>
          </div>
          <div className="profile-actions">
            <button className="profile-back" onClick={() => navigate('/')}>← Quay lại</button>
            <button className="profile-edit" onClick={() => setEditing((prev) => !prev)}>
              {editing ? 'Hủy' : 'Chỉnh sửa'}
            </button>
          </div>
        </div>

        <div className="profile-grid">
          <div className="pane">
            {editing ? (
              <>
                <label>
                  Họ và tên
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Tên hiển thị"
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@email.com"
                  />
                </label>
                <label>
                  Giới tính
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="female">Nữ</option>
                    <option value="male">Nam</option>
                    <option value="other">Khác</option>
                  </select>
                </label>
                <label>
                  Ngày sinh
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  />
                </label>
                <button onClick={handleSave} disabled={saving}>Lưu thông tin</button>
              </>
            ) : (
              <div className="profile-view">
                <p><strong>Họ và tên:</strong> {form.name}</p>
                <p><strong>Email:</strong> {form.email}</p>
                <p><strong>Giới tính:</strong> {form.gender === 'female' ? 'Nữ' : form.gender === 'male' ? 'Nam' : 'Khác'}</p>
                <p><strong>Ngày sinh:</strong> {form.birthDate || '--'}</p>
              </div>
            )}
          </div>

          <div className="pane">
            <h3>Bảo mật</h3>
            <label>
              Mật khẩu hiện tại
              <input
                type="password"
                value={security.currentPassword}
                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                placeholder="•••••••"
              />
            </label>
            <label>
              Mật khẩu mới
              <input
                type="password"
                value={security.newPassword}
                onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
              />
            </label>
            <button onClick={handleChangePassword} disabled={saving}>Đổi mật khẩu</button>
          </div>
        </div>

        {message && <div className="banner success">{message}</div>}
        {error && <div className="banner error">{error}</div>}
      </div>
    </div>
  );
};

export default Profile;
