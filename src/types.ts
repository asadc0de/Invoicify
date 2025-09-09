export interface Feature {
  id: string;
  description: string;
  price: number;
}

export interface RevisionSnapshot {
  id: string;
  timestamp: Date;
  usedRevisions: number;
}

export interface Invoice {
  id?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'paid';
  startDate: Date;

  // Project Details
  projectTitle: string;
  websitePages: number;

  // Freelancer Info
  freelancerName: string;
  freelancerEmail: string;
  freelancerContact: string;

  // Client Info
  clientName: string;
  clientEmail: string;
  clientContact: string;

  // Features
  features: Feature[];

  // Revisions
  totalRevisions: number;
  usedRevisions: number;
  revisionSnapshots: RevisionSnapshot[];

  // Payment
  totalPayment: number;
  advancePayment: number;
  paidPayment: number;
  paymentStatus: 'pending' | 'paid';

  // Currency
  currency?: 'USD' | 'PKR';
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}