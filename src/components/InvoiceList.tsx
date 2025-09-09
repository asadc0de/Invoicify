import React, { useEffect, useState } from "react";
import { Plus, FileText, Calendar, DollarSign, Copy, User } from "lucide-react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { MdDelete } from "react-icons/md";
import { FaCopy } from "react-icons/fa";

interface InvoiceListProps {
  userId: string;
  onCreateInvoice: () => void;
  onSelectInvoice: (invoiceId: string) => void;
}

// ✅ Reusable Confirm Dialog
const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  deleting,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 w-[90%] max-w-md shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 rounded-2xl bg-gray-800 border border-[#222] hover:bg-gray-700 text-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className={`px-4 py-2 rounded-2xl ${
              deleting
                ? "bg-red-800 text-gray-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const InvoiceList: React.FC<InvoiceListProps> = ({
  userId,
  onCreateInvoice,
  onSelectInvoice,
}) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCopied, setShowCopied] = useState(false);

  // 👇 State for dialog + deletion
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, "invoices"), where("createdBy", "==", userId));
    const unsub = onSnapshot(q, (snapshot) => {
      setInvoices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  const getTotalPayment = (invoice: any) => {
    return invoice.totalPayment ?? 0;
  };

  const handleInvoiceClick = (invoiceId: string) => {
    onSelectInvoice(invoiceId);
  };

  const requestDeleteInvoice = (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoiceId(invoiceId);
    setDialogOpen(true);
  };

  const confirmDeleteInvoice = async () => {
    if (!selectedInvoiceId) return;
    try {
      setDeleting(true); // start deleting
      await deleteDoc(doc(db, "invoices", selectedInvoiceId));
      setInvoices((prev) => prev.filter((inv) => inv.id !== selectedInvoiceId));
    } catch (err) {
      console.error("Error deleting invoice:", err);
    } finally {
      setDeleting(false); // reset
      setDialogOpen(false);
      setSelectedInvoiceId(null);
    }
  };

  if (loading) {
    return <p className="text-white p-6">Loading invoices...</p>;
  }

  const emptyState = (
    <div className="text-center py-16">
      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
      <h2 className="text-2xl font-semibold text-gray-400 mb-4">
        No invoices yet
      </h2>
      <p className="text-gray-500 mb-8 text-lg">
        Create your first invoice to get started
      </p>
      <button
        onClick={onCreateInvoice}
        className="bg-[#0A0A0A] hover:bg-[#131313] border border-[#222222] text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200 flex items-center gap-3 text-lg mx-auto"
      >
        <Plus className="w-5 h-5" />
        Create Invoice
      </button>
    </div>
  );

  const invoiceCards = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          onClick={() => invoice.id && handleInvoiceClick(invoice.id)}
          className="relative bg-[#0A0A0A] hover:bg-[#131313] rounded-xl p-6 shadow-xl cursor-pointer transition-colors duration-200 border border-[#222]"
        >
          {/* Delete button */}
          <button
            onClick={(e) => requestDeleteInvoice(invoice.id, e)}
            className="absolute bottom-4 left-4 flex items-center gap-1 text-gray-500 hover:text-red-400 text-sm px-4 py-2 rounded-2xl hover:bg-red-900/20 transition bg-[#212121]"
          >
            <MdDelete className="w-4 h-4" />
            
          </button>

          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold text-white truncate capitalize">
              {invoice.projectTitle || "Untitled Project"}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                invoice.paymentStatus === "paid"
                  ? "bg-green-900 text-green-300"
                  : "bg-yellow-900 text-yellow-300"
              }`}
            >
              {invoice.paymentStatus === "paid" ? "Paid" : "Pending"}
            </span>
          </div>

          <div className="space-y-3 text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Created: {invoice.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>
                Total Payment:{" "}
                {getTotalPayment(invoice) !== undefined &&
                getTotalPayment(invoice) !== null
                  ? `${
                      invoice.currency === "PKR"
                        ? "₨"
                        : invoice.currency === "USD"
                        ? "$"
                        : "$"
                    }${getTotalPayment(invoice).toLocaleString()}`
                  : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-blue-400 underline break-all cursor-pointer select-all">
                {`${window.location.origin}/invoice/${invoice.id}/text`}
              </span>
              <button
                title="Copy link"
                className="p-1 hover:bg-blue-900 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(
                    `${window.location.origin}/invoice/${invoice.id}/text`
                  );
                  setShowCopied(true);
                  setTimeout(() => setShowCopied(false), 2000);
                }}
              >
                <Copy className="w-4 h-4 text-blue-400" />
              </button>
            </div>
            <div className="flex items-center gap-2 capitalize">
              <User className="w-4 h-4" />
              <span>Client: {invoice.clientName || "Not specified"}</span>
            </div>
          </div>
          {invoice.updatedAt && (
            <div className="mt-4 text-right text-xs text-gray-400">
              Last updated:{" "}
              {invoice.updatedAt?.toDate?.()?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }) || "N/A"}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-dark p-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="md:text-4xl text-2xl font-bold text-white">
            Your Invoices
          </h1>
          <button
            onClick={onCreateInvoice}
            className="bg-[#0A0A0A] hover:bg-[#131313] border border-[#222222] text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200 flex items-center gap-3 md:text-lg text-base"
          >
            <Plus className="w-5 h-5" />
            New Invoice
          </button>
        </div>

        {invoices.length === 0 ? emptyState : invoiceCards}
      </div>

      {showCopied && (
        <div className="fixed flex items-center gap-3 bottom-6 right-6 bg-[#dadada] text-black px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
        <FaCopy />  Text Copied!
        </div>
      )}

      {/* ✅ Confirmation Dialog */}
      <ConfirmDialog
        open={dialogOpen}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        onConfirm={confirmDeleteInvoice}
        onCancel={() => setDialogOpen(false)}
        deleting={deleting}
      />
    </div>
  );
};
