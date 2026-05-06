import React, { useState, useEffect } from 'react';
import { CustomerService } from '../services/customerService';
import { Customer } from '../types';
import { MessageSquare, Settings, Send, Users, AlertCircle, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SmsMarketing({ customers }: { customers: Customer[] }) {
  const [activeSubTab, setActiveSubTab] = useState<'send' | 'settings'>('send');
  const [smsSettings, setSmsSettings] = useState({
    provider: 'ippanel',
    apiKey: '',
    sender: '',
    enabled: false
  });
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'filtered'>('all');
  const [status, setStatus] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    CustomerService.getSmsSettings().then(setSmsSettings);
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await CustomerService.saveSmsSettings(smsSettings);
      setStatus({ type: 'success', text: 'تنظیمات با موفقیت ذخیره شد' });
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: 'error', text: 'خطا در ذخیره تنظیمات' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setLoading(true);
    const phoneNumbers = customers.map(c => c.phoneNumber).filter(p => !!p);
    
    try {
      const result = await CustomerService.sendSms(phoneNumbers, message);
      if (result.success) {
        setStatus({ type: 'success', text: result.message });
        setMessage('');
      } else {
        setStatus({ type: 'error', text: result.message });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'خطا در ارسال پیامک' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مرکز پیامک</h1>
          <p className="text-gray-500 text-sm mt-1">مدیریت اطلاع‌رسانی و بازاریابی پیامکی</p>
        </div>
      </div>

      <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm w-fit">
        <button
          onClick={() => setActiveSubTab('send')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSubTab === 'send' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Send size={16} />
          ارسال انبوه
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeSubTab === 'settings' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Settings size={16} />
          تنظیمات پنل
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'send' ? (
          <motion.div
            key="send"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">متن پیامک</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-right"
                    placeholder="متن خود را اینجا وارد کنید..."
                  />
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>تعداد کاراکتر: {message.length}</span>
                    <span>تعداد بخش: {Math.ceil(message.length / 70) || 1}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={targetType === 'all'} 
                        onChange={() => setTargetType('all')}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-gray-600">همه مشترکین ({customers.length})</span>
                    </label>
                  </div>
                  <button
                    onClick={handleSendBulk}
                    disabled={loading || !smsSettings.enabled}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
                    ارسال برای همه
                  </button>
                </div>
              </div>

              {status && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {status.text}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <h3 className="font-bold flex items-center gap-2">
                  <Smartphone className="text-blue-400" />
                  پیش‌نمایش در موبایل
                </h3>
                <div className="bg-white/5 rounded-2xl p-4 min-h-[150px] text-sm text-gray-300 leading-relaxed text-right relative">
                  {message || 'متنی وارد نشده است...'}
                  <div className="absolute bottom-2 left-2 text-[10px] text-gray-500">12:30 PM</div>
                </div>
                <p className="text-xs text-gray-400 text-center italic">
                  این فقط یک تخمین از ظاهر پیام در موبایل است
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="max-w-2xl"
          >
            <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${smsSettings.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  <h3 className="font-bold text-gray-800">وضعیت اتصال به پنل</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={smsSettings.enabled}
                    onChange={(e) => setSmsSettings({ ...smsSettings, enabled: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full pr-rtl peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">سرویس‌دهنده</label>
                  <select 
                    value={smsSettings.provider}
                    onChange={(e) => setSmsSettings({ ...smsSettings, provider: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="ippanel">FarazSMS (ippanel)</option>
                    <option value="kavenegar">Kavenegar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">خط ارسال‌کننده</label>
                  <input
                    type="text"
                    value={smsSettings.sender}
                    onChange={(e) => setSmsSettings({ ...smsSettings, sender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left"
                    placeholder="e.g. 50001234"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">کلید API (API Key)</label>
                  <input
                    type="password"
                    value={smsSettings.apiKey}
                    onChange={(e) => setSmsSettings({ ...smsSettings, apiKey: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left font-mono"
                    placeholder="Enter your API key"
                  />
                </div>
              </div>

              {status && status.type === 'success' && (
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {status.text}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-black transition-all flex items-center justify-center gap-2 font-bold"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings size={18} />}
                  ذخیره تنظیمات پنل
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
