import { useState, useEffect, useCallback } from "react";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export function useInvoice(invoiceId?: string) {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch single invoice if invoiceId is provided
  useEffect(() => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }
    
    const fetchInvoice = async () => {
      try {
        const ref = doc(db, "invoices", invoiceId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setInvoice({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [invoiceId]);

  // Create a new invoice
  const createInvoice = useCallback(async (userId: string) => {
    const docRef = await addDoc(collection(db, "invoices"), {
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      projectTitle: "",
      websitePages: 0,
      features: [],
      paymentStatus: "pending",
    });
    return docRef.id;
  }, []);

  // Save/update invoice
  const saveInvoice = useCallback(
    async (data: any) => {
      if (!invoiceId) return;
      
      try {
        setSaving(true);
        await setDoc(
          doc(db, "invoices", invoiceId),
          {
            ...data,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Error saving invoice:", err);
      } finally {
        setSaving(false);
      }
    },
    [invoiceId]
  );

  return { invoice, loading, saving, createInvoice, saveInvoice };
}

// Keep this simple hook for the InvoiceList component
export const useUserInvoices = (userId: string) => {
  // This is now handled directly in InvoiceList component
  return { invoices: [], loading: false };
};