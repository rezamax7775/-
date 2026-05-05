/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CustomerTable } from './components/CustomerTable';
import { CustomerForm } from './components/CustomerForm';
import { Login } from './components/Login';
import { CustomerService } from './services/customerService';
import { Customer } from './types';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('crm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'add'>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (user) {
      CustomerService.getCustomers().then(setCustomers).catch(console.error);
    }
  }, [user]);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('crm_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  const handleAddCustomer = async (data: any) => {
    try {
      if (editingCustomer) {
        await CustomerService.updateCustomer({ ...editingCustomer, ...data });
        setEditingCustomer(null);
      } else {
        await CustomerService.addCustomer(data);
      }
      const updatedList = await CustomerService.getCustomers();
      setCustomers(updatedList);
      setActiveTab('customers');
    } catch (error) {
      alert('خطا در ذخیره اطلاعات');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('آیا از حذف این مشترک اطمینان دارید؟')) {
      try {
        await CustomerService.deleteCustomer(id);
        const updatedList = await CustomerService.getCustomers();
        setCustomers(updatedList);
      } catch (error) {
        alert('خطا در حذف مشترک');
        console.error(error);
      }
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setActiveTab('add');
  };

  const handleExport = () => {
    const csv = CustomerService.exportToCSV(customers);
    if (!csv) return alert('اطلاعاتی برای خروجی وجود ندارد.');
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${new Date().toLocaleDateString('fa-IR')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            try {
              const count = await CustomerService.importFromCSV(results.data);
              if (count > 0) {
                const updatedList = await CustomerService.getCustomers();
                setCustomers(updatedList);
                alert(`${count} مشترک با موفقیت وارد شدند.`);
                setActiveTab('customers');
              } else {
                alert('فایل نامعتبر است یا خالی می‌باشد.');
              }
            } catch (error) {
              alert('خطا در وارد کردن اطلاعات');
              console.error(error);
            }
          }
        });
      }
    };
    input.click();
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen text-gray-900 overflow-x-hidden" dir="rtl">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onExport={handleExport}
        onImport={handleImport}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard customers={customers} />
            </motion.div>
          )}

          {activeTab === 'customers' && (
            <motion.div
              key="customers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold font-sans italic">مدیریت مشترکین</h2>
                </div>
                <CustomerTable 
                  customers={customers} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'add' && (
            <motion.div
              key="add"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <CustomerForm 
                initialData={editingCustomer || {}}
                onSubmit={handleAddCustomer}
                onCancel={() => {
                  setEditingCustomer(null);
                  setActiveTab('dashboard');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
