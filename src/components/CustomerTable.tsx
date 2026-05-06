import React, { useState, useEffect } from 'react';
import { Customer, SUBSCRIPTION_PLANS } from '../types';
import { Search, Edit, Trash2, Phone, Calendar, MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { CustomerService } from '../services/customerService';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({ customers, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showSmsModal, setShowSmsModal] = useState<Customer | null>(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSendSingleSms = async () => {
    if (!showSmsModal || !smsMessage.trim()) return;
    setLoading(true);
    try {
      const result = await CustomerService.sendSms([showSmsModal.phoneNumber], smsMessage);
      if (result.success) {
        setStatus({ type: 'success', text: result.message });
        setTimeout(() => {
          setShowSmsModal(null);
          setSmsMessage('');
          setStatus(null);
        }, 2000);
      } else {
        setStatus({ type: 'error', text: result.message });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'خطا در ارتباط با سرور' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(c => {
    const searchTerm = debouncedSearch.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm) || 
      c.phoneNumber.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm)) ||
      (c.postalCode && c.postalCode.includes(searchTerm))
    );
  });

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="جستجو (نام، تماس، ایمیل، کد پستی...)"
          className="flex-1 outline-none text-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 border-bottom border-gray-200">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase italic font-sans tracking-widest">نام و نام خانوادگی</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase italic font-sans tracking-widest">شماره تماس</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase italic font-sans tracking-widest">تاریخ انقضا</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase italic font-sans tracking-widest">نوع اشتراک</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase italic font-sans tracking-widest text-left">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length > 0 ? filtered.map((c) => {
              const now = Date.now();
              const isExpired = c.expirationDate < now;
              const isSoon = c.expirationDate - now < 7 * 24 * 60 * 60 * 1000 && !isExpired;

              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <div className="font-semibold">{c.firstName} {c.lastName}</div>
                    <div className="text-[10px] text-gray-400 font-mono">ID: {c.id}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-400" />
                      {c.phoneNumber}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={cn(
                      "text-sm font-mono flex items-center gap-2",
                      isExpired ? "text-red-500 font-bold" : isSoon ? "text-orange-500 font-bold" : "text-gray-600"
                    )}>
                      <Calendar size={14} />
                      {new Intl.DateTimeFormat('fa-IR').format(new Date(c.expirationDate))}
                      {isExpired && <span className="text-[9px] bg-red-100 px-1 rounded">پایان یافته</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                      {SUBSCRIPTION_PLANS.find(p => p.id === c.subscriptionType)?.label}
                    </span>
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setShowSmsModal(c)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="ارسال پیامک"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button 
                        onClick={() => onEdit(c)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-all"
                        title="ویرایش"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(c.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400 italic">موردی یافت نشد</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SMS Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} />
                <h3 className="font-bold">ارسال پیامک به {showSmsModal.firstName} {showSmsModal.lastName}</h3>
              </div>
              <button 
                onClick={() => { setShowSmsModal(null); setStatus(null); }}
                className="hover:bg-white/10 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-xs text-gray-400 mb-1">شماره مقصد:</div>
                <div className="font-mono text-gray-700">{showSmsModal.phoneNumber}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">متن پیام:</label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm h-32"
                  placeholder="متن پیامک را بنویسید..."
                />
              </div>
              
              {status && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {status.text}
                </div>
              )}

              <button
                onClick={handleSendSingleSms}
                disabled={loading || !smsMessage.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
                ارسال پیامک
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
