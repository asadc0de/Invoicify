import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Invoice, Feature, RevisionSnapshot } from '../types';
import { performanceMonitor, debounce } from '../utils/performance';

// Optimized data transformation function
const transformInvoiceData = (doc: any): Invoice => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    startDate: data.startDate?.toDate() || new Date(),
    revisionSnapshots: data.revisionSnapshots?.map((snapshot: any) => ({
      ...snapshot,
      timestamp: snapshot.timestamp?.toDate() || new Date(),
    })) || [],
  } as Invoice;
};

export const useInvoice = (invoiceId?: string) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const invoiceRef = doc(db, 'invoices', invoiceId);
    
    // Use getDoc for initial load instead of onSnapshot for better performance
    const loadInvoice = async () => {
      try {
        const docSnap = await performanceMonitor.measure('Load Invoice', () => getDoc(invoiceRef));
        if (docSnap.exists()) {
          setInvoice(transformInvoiceData(docSnap));
        } else {
          setInvoice(null);
        }
      } catch (error) {
        console.error('Error loading invoice:', error);
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();

    // Only set up real-time listener after initial load
    const unsubscribe = onSnapshot(invoiceRef, (doc) => {
      if (doc.exists()) {
        setInvoice(transformInvoiceData(doc));
      } else {
        setInvoice(null);
      }
    }, (error) => {
      console.error('Error in invoice listener:', error);
    });

    return () => unsubscribe();
  }, [invoiceId]);

  const createInvoice = useCallback(async (createdBy: string): Promise<string> => {
    return performanceMonitor.measure('Create Invoice', async () => {
      const now = new Date();
      const newInvoice: Omit<Invoice, 'id'> = {
        createdBy,
        createdAt: now,
        updatedAt: now,
        status: 'pending',
        startDate: now,
        projectTitle: '',
        websitePages: 1,
        freelancerName: '',
        freelancerEmail: '',
        freelancerContact: '',
        clientName: '',
        clientEmail: '',
        clientContact: '',
        features: [],
        totalRevisions: 3,
        usedRevisions: 0,
        revisionSnapshots: [],
        advancePayment: 0,
        paymentStatus: 'pending',
        totalPayment: 0,
        paidPayment: 0,
        currency: 'USD',
      };

      try {
        const docRef = await addDoc(collection(db, 'invoices'), {
          ...newInvoice,
          createdAt: Timestamp.fromDate(newInvoice.createdAt),
          updatedAt: Timestamp.fromDate(newInvoice.updatedAt),
          startDate: Timestamp.fromDate(newInvoice.startDate),
        });
        return docRef.id;
      } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }
    });
  }, []);

  // Debounced save function to prevent excessive API calls
  const debouncedSave = useMemo(
    () => debounce(async (invoiceData: Partial<Invoice>) => {
      if (!invoiceId) return;

      setSaving(true);
      try {
        const invoiceRef = doc(db, 'invoices', invoiceId);
        await performanceMonitor.measure('Save Invoice', () => updateDoc(invoiceRef, {
          ...invoiceData,
          updatedAt: Timestamp.fromDate(new Date()),
          ...(invoiceData.startDate && { startDate: Timestamp.fromDate(invoiceData.startDate) }),
          ...(invoiceData.revisionSnapshots && {
            revisionSnapshots: invoiceData.revisionSnapshots.map(snapshot => ({
              ...snapshot,
              timestamp: Timestamp.fromDate(snapshot.timestamp),
            }))
          }),
        }));
      } catch (error) {
        console.error('Error saving invoice:', error);
        throw error;
      } finally {
        setSaving(false);
      }
    }, 500),
    [invoiceId]
  );

  const saveInvoice = useCallback(async (invoiceData: Partial<Invoice>) => {
    return debouncedSave(invoiceData);
  }, [debouncedSave]);

  return {
    invoice,
    loading,
    saving,
    createInvoice,
    saveInvoice,
  };
};

export const useUserInvoices = (userId: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Add limit to prevent loading too many documents
    const q = query(
      collection(db, 'invoices'),
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(50) // Limit to 50 most recent invoices
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      performanceMonitor.measure('Process Invoices', () => {
        const invoiceList = snapshot.docs.map(transformInvoiceData);
        setInvoices(invoiceList);
        setLoading(false);
      });
    }, (error) => {
      console.error('Error in invoices listener:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { invoices, loading };
};