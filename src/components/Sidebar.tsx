import React from 'react';
import { LayoutDashboard, Users, UserPlus, Download, Upload, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: 'dashboard' | 'customers' | 'add';
  setActiveTab: (tab: 'dashboard' | 'customers' | 'add') => void;
  onExport: () => void;
  onImport: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onExport, onImport, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
    { id: 'customers', label: 'لیست مشترکین', icon: Users },
    { id: 'add', label: 'ثبت مشترک جدید', icon: UserPlus },
  ] as const;

  return (
    <div className="w-64 h-screen bg-[#141414] text-white flex flex-col p-6 sticky top-0" dir="rtl">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded">CRM</div>
          پنل مدیریت
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded transition-all",
              activeTab === item.id 
                ? "bg-white text-black font-semibold" 
                : "hover:bg-white/10 text-white/70"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/10 space-y-2">
        <button 
          onClick={onExport}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <Download size={16} />
          خروجی اکسل (CSV)
        </button>
        <button 
          onClick={onImport}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <Upload size={16} />
          وارد کردن اطلاعات
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors mt-4"
        >
          <LogOut size={16} />
          خروج از سیستم
        </button>
      </div>
    </div>
  );
};
