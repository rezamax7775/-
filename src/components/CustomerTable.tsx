import React, { useState, useEffect } from 'react';
import { Customer, SUBSCRIPTION_PLANS } from '../types';
import { Search, Edit, Trash2, Phone, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

interface CustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({ customers, onEdit, onDelete }) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

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
                        onClick={() => onEdit(c)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(c.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
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
    </div>
  );
};
