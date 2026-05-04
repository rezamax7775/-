export type SubscriptionType = '3-month' | '6-month' | '1-year';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address?: string;
  postalCode?: string;
  email?: string;
  registrationDate: number; // timestamp
  subscriptionType: SubscriptionType;
  expirationDate: number; // timestamp
  notes?: string;
  createdAt: number;
}

export interface SubscriptionPlan {
  id: SubscriptionType;
  label: string;
  months: number;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: '3-month', label: '۳ ماهه', months: 3 },
  { id: '6-month', label: '۶ ماهه', months: 6 },
  { id: '1-year', label: 'یک ساله', months: 12 },
];
