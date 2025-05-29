import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRepeat } from 'react-bootstrap-icons';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.profilePic || '');
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  useEffect(() => {
    setUsername(user?.username || '');
    setEmail(user?.email || '');
    setBio(user?.bio || '');
    setPreview(user?.profilePic || '');
    setFile(null);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    const toastId = toast.info('Updating profile...', { autoClose: false });

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('bio', bio);
      if (file) formData.append('profilePic', file);
      await updateUser(formData);
      toast.update(toastId, {
        render: 'Profile updated successfully!',
        type: 'success',
        autoClose: 3000,
      });
      setFile(null);
    } catch (err) {
      console.error('Update profile error:', err);
      toast.update(toastId, {
        render: err.message || 'Failed to update profile',
        type: 'error',
        autoClose: 3000,
      });
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleLogout = async () => {
    setLoadingLogout(true);
    const toastId = toast.info('Logging out...', { autoClose: false });

    try {
      await logout();
      toast.update(toastId, {
        render: 'Logged out successfully!',
        type: 'success',
        autoClose: 2000,
      });
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      toast.update(toastId, {
        render: err.message || 'Failed to log out',
        type: 'error',
        autoClose: 3000,
      });
      setLoadingLogout(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-cyan-500 dark:border-cyan-400">
            {preview ? (
              <img src={preview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                No Image
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {username || 'User'}
            </h1>
            <label className="text-sm text-cyan-600 dark:text-cyan-400 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                disabled={loadingUpdate || loadingLogout}
              />
              Update Avatar
            </label>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                disabled={loadingUpdate || loadingLogout}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                disabled={loadingUpdate || loadingLogout}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                rows="3"
                placeholder="Tell us about yourself..."
                disabled={loadingUpdate || loadingLogout}
              />
            </div>
            <button
              type="submit"
              className="bg-cyan-500 dark:bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-600 dark:hover:bg-cyan-700 transition flex justify-center items-center"
              disabled={loadingUpdate || loadingLogout}
            >
              {loadingUpdate ? (
                <ArrowRepeat size={20} className="animate-spin" />
              ) : (
                'Update Profile'
              )}
            </button>
          </form>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Books Added</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.booksAddedCount || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.favorites?.length || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Joined</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-700 dark:hover:bg-red-800 transition flex justify-center items-center"
          disabled={loadingUpdate || loadingLogout}
        >
          {loadingLogout ? (
            <ArrowRepeat size={20} className="animate-spin" />
          ) : (
            'Logout'
          )}
        </button>
      </div>
    </div>
  );
};

export default Profile;