import React from 'react';
import { Customer, SUBSCRIPTION_PLANS } from '../types';
import { Users, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  customers: Customer[];
}

export const Dashboard: React.FC<DashboardProps> = ({ customers }) => {
  const now = Date.now();
  const expiringSoon = customers.filter(c => {
    const diff = c.expirationDate - now;
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  });

  const expired = customers.filter(c => c.expirationDate < now);

  const stats = [
    { label: 'کل مشترکین', value: customers.length, icon: Users, color: 'text-blue-600' },
    { label: 'در حال اتمام (۷ روز)', value: expiringSoon.length, icon: Clock, color: 'text-orange-500' },
    { label: 'منقضی شده', value: expired.length, icon: AlertCircle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2 font-sans italic">خلاصه وضعیت</h2>
        <p className="text-gray-500">امروز: {new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full' }).format(new Date())}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={cn("p-4 rounded-lg bg-gray-50", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold font-mono">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Clock size={20} className="text-orange-500" />
            مشترکین در حال اتمام
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {expiringSoon.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {expiringSoon.map(c => (
                  <div key={c.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-semibold">{c.firstName} {c.lastName}</p>
                      <p className="text-sm text-gray-500">{c.phoneNumber}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-orange-600 font-mono text-sm">
                        {Math.ceil((c.expirationDate - now) / (1000 * 60 * 60 * 24))} روز باقی‌مانده
                      </p>
                      <p className="text-xs text-gray-400">انقضا: {new Intl.DateTimeFormat('fa-IR').format(new Date(c.expirationDate))}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 italic">موردی یافت نشد</div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            آخرین مشترکین منقضی شده
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {expired.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {expired.slice(0, 5).map(c => (
                  <div key={c.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-semibold">{c.firstName} {c.lastName}</p>
                      <p className="text-sm text-gray-500">{c.phoneNumber}</p>
                    </div>
                    <div className="text-left">
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] rounded uppercase font-bold">منقضی شده</span>
                      <p className="text-xs text-gray-400 mt-1">{new Intl.DateTimeFormat('fa-IR').format(new Date(c.expirationDate))}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 italic">موردی یافت نشد</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

import { cn } from '../lib/utils';
