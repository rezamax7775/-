import { Customer, SubscriptionType, SUBSCRIPTION_PLANS } from '../types';

export class CustomerService {
  static async login(username: string, password: string): Promise<{ success: boolean; user?: any; message?: string }> {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  }

  static async getCustomers(): Promise<Customer[]> {
    const res = await fetch('/api/customers');
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  }

  static async addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'expirationDate'>): Promise<Customer> {
    // Calculate expiration date
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === customer.subscriptionType);
    const months = plan?.months || 3;
    const regDate = new Date(customer.registrationDate);
    const expDate = new Date(regDate);
    expDate.setMonth(expDate.getMonth() + months);

    const newCustomer: Customer = {
      ...customer,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
      expirationDate: expDate.getTime()
    };

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    });
    
    if (!res.ok) throw new Error('Failed to add customer');
    return res.json();
  }

  static async updateCustomer(updatedCustomer: Customer): Promise<Customer> {
    // Recalculate expiration if subscription or reg date changed
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === updatedCustomer.subscriptionType);
    const months = plan?.months || 3;
    const regDate = new Date(updatedCustomer.registrationDate);
    const expDate = new Date(regDate);
    expDate.setMonth(expDate.getMonth() + months);
    
    const finalCustomer = { ...updatedCustomer, expirationDate: expDate.getTime() };
    
    const res = await fetch(`/api/customers/${finalCustomer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalCustomer)
    });

    if (!res.ok) throw new Error('Failed to update customer');
    return res.json();
  }

  static async deleteCustomer(id: string): Promise<void> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete customer');
  }

  static exportToCSV(customers: Customer[]): string {
    if (customers.length === 0) return '';

    const headers = ['نام', 'نام خانوادگی', 'شماره تماس', 'کد پستی', 'ایمیل', 'نوع اشتراک', 'تاریخ ثبت', 'تاریخ انقضا', 'یادداشت'];
    const rows = customers.map(c => [
      c.firstName,
      c.lastName,
      c.phoneNumber,
      c.postalCode || '',
      c.email || '',
      SUBSCRIPTION_PLANS.find(p => p.id === c.subscriptionType)?.label || '',
      new Intl.DateTimeFormat('fa-IR').format(new Date(c.registrationDate)),
      new Intl.DateTimeFormat('fa-IR').format(new Date(c.expirationDate)),
      c.notes || ''
    ]);

    return [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
  }

  static async importFromCSV(data: any[]): Promise<number> {
    const newCustomers: Customer[] = data
      .filter(row => row['نام'] && row['شماره تماس'])
      .map(row => {
        const registrationDate = Date.now();
        const subType = row['نوع اشتراک'] === '۳ ماهه' ? '3-month' : 
                        row['نوع اشتراک'] === '۶ ماهه' ? '6-month' : '1-year';
        
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === subType);
        const months = plan?.months || 3;
        const expDate = new Date();
        expDate.setMonth(expDate.getMonth() + months);

        return {
          id: Math.random().toString(36).substring(2, 9),
          firstName: row['نام'],
          lastName: row['نام خانوادگی'],
          phoneNumber: row['شماره تماس'],
          postalCode: row['کد پستی'] || '',
          email: row['ایمیل'],
          subscriptionType: subType as SubscriptionType,
          registrationDate,
          expirationDate: expDate.getTime(),
          notes: row['یادداشت'],
          createdAt: Date.now()
        };
      });
    
    if (newCustomers.length === 0) return 0;

    const res = await fetch('/api/customers/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomers)
    });

    if (!res.ok) throw new Error('Failed to import customers');
    const result = await res.json();
    return result.count;
  }
}
