import React, { useState } from 'react';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Customer, SUBSCRIPTION_PLANS, SubscriptionType } from '../types';
import { X, Save } from 'lucide-react';

interface CustomerFormProps {
  initialData?: Partial<Customer>;
  onSubmit: (data: Omit<Customer, 'id' | 'createdAt' | 'expirationDate'>) => void;
  onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phoneNumber: initialData?.phoneNumber || '',
    email: initialData?.email || '',
    postalCode: initialData?.postalCode || '',
    registrationDate: initialData?.registrationDate || Date.now(),
    subscriptionType: initialData?.subscriptionType || '3-month' as SubscriptionType,
    notes: initialData?.notes || '',
    address: initialData?.address || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 max-w-2xl mx-auto shadow-lg" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {initialData?.id ? 'ویرایش اطلاعات' : 'ثبت نام مشترک جدید'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">نام</label>
          <input
            required
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-black outline-none"
            value={formData.firstName}
            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">نام خانوادگی</label>
          <input
            required
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-black outline-none"
            value={formData.lastName}
            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">شماره موبایل</label>
          <input
            required
            type="tel"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-black outline-none"
            value={formData.phoneNumber}
            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">کد پستی (۱۰ رقم)</label>
          <input
            type="text"
            maxLength={10}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-black outline-none font-mono"
            value={formData.postalCode}
            onChange={e => setFormData({ ...formData, postalCode: e.target.value.replace(/\D/g, '') })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">ایمیل (اختیاری)</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-black outline-none"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">تاریخ شروع اشتراک (شمسی)</label>
          <div className="relative">
            <DatePicker
              value={new Date(formData.registrationDate)}
              onChange={(date: any) => setFormData({ ...formData, registrationDate: date?.toDate().getTime() || Date.now() })}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              inputClass="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-black outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">نوع اشتراک</label>
          <select
            className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-black outline-none bg-white"
            value={formData.subscriptionType}
            onChange={e => setFormData({ ...formData, subscriptionType: e.target.value as SubscriptionType })}
          >
            {SUBSCRIPTION_PLANS.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-gray-700">آدرس</label>
          <textarea
            rows={2}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-black outline-none"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-gray-700">توضیحات</label>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-black outline-none"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="md:col-span-2 flex gap-4 mt-4">
          <button
            type="submit"
            className="flex-1 bg-black text-white font-bold py-3 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            ذخیره اطلاعات
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 border border-gray-300 font-semibold rounded hover:bg-gray-50 transition-colors"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
};
