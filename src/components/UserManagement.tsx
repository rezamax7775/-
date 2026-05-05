import React, { useState, useEffect } from 'react';
import { CustomerService } from '../services/customerService';
import { AppUser } from '../types';
import { UserPlus, Trash2, User, Shield, Key, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [newUserData, setNewUserData] = useState<AppUser>({ username: '', name: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await CustomerService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('خطا در دریافت لیست کاربران');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.username || !newUserData.password || !newUserData.name) {
      setError('لطفاً تمامی فیلدها را پر کنید');
      return;
    }

    try {
      const result = await CustomerService.createUser(newUserData);
      if (result.success) {
        setSuccess('کاربر با موفقیت اضافه شد');
        setNewUserData({ username: '', name: '', password: '' });
        setAddingUser(false);
        loadUsers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'خطا در افزودن کاربر');
      }
    } catch (err) {
      setError('خطا در برقراری ارتباط');
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (username === 'admin') return;
    if (!confirm(`آیا از حذف کاربر ${username} مطمئن هستید؟`)) return;

    try {
      const result = await CustomerService.deleteUser(username);
      if (result.success) {
        loadUsers();
      } else {
        setError(result.message || 'خطا در حذف کاربر');
      }
    } catch (err) {
      setError('خطا در برقراری ارتباط');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مدیریت کاربران</h1>
          <p className="text-gray-500 text-sm mt-1">مدیریت دسترسی افراد به سیستم</p>
        </div>
        <button
          onClick={() => setAddingUser(!addingUser)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <UserPlus size={18} />
          کاربر جدید
        </button>
      </div>

      <AnimatePresence>
        {addingUser && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <UserPlus size={18} className="text-blue-500" />
                تعریف کاربر جدید
              </h3>
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 mr-2">نام نمایشی (مانند: علی محمدی)</label>
                  <input
                    type="text"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="نام کامل"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 mr-2">نام کاربری (برای ورود)</label>
                  <input
                    type="text"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left"
                    placeholder="Username"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 mr-2">رمز عبور</label>
                  <input
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left"
                    placeholder="Password"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-black transition-all"
                  >
                    ثبت کاربر
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(error || success) && (
        <div className={`p-4 rounded-xl text-sm border flex items-center gap-3 ${error ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
          {error ? <AlertCircle size={18} /> : <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
          {error || success}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F8F9FA] border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">کاربر</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">نام کاربری</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">نقش</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                  در حال دریافت اطلاعات...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">کش کاربر یافت نشد</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.username} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <User size={20} />
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                    @{user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${user.username === 'admin' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                      {user.username === 'admin' ? <Shield size={12} /> : <User size={12} />}
                      {user.username === 'admin' ? 'مدیر ارشد' : 'اپراتور'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left">
                    {user.username !== 'admin' && (
                      <button 
                        onClick={() => handleDeleteUser(user.username)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="حذف کاربر"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
