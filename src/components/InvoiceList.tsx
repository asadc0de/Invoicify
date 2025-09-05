import React, { useEffect, useState } from "react";
// Simple modal for confirmation
const ConfirmModal: React.FC<{
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}> = ({ open, onConfirm, onCancel, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A] bg-opacity-60">
      <div className="bg-[#0A0A0A] rounded-2xl shadow-xl px-8 py-16 md:max-w-[50%] w-[90%] border border-[#222222] text-center">
        <div className="text-white text-lg mb-6">{message}</div>
        <div className="flex justify-center gap-4">
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors duration-200"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-800 border border-[#222222] text-white font-semibold py-2 px-6 rounded-xl transition-colors duration-200"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
import { SkeletonSection } from "./Skeleton";
import {
  Plus,
  FileText,
  Calendar,
  DollarSign,
  Copy,
  User,
  LogInIcon,
} from "lucide-react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { MdDelete } from "react-icons/md";
import { FaRegCopy } from "react-icons/fa";

interface InvoiceListProps {
  userId: string;
  onCreateInvoice: () => void;
  onSelectInvoice: (invoiceId: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  userId,
  onCreateInvoice,
  onSelectInvoice,
}) => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCopied, setShowCopied] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const [isMobile, setIsMobile] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const [showSignedIn, setShowSignedIn] = useState(false);
  const prevUserId = React.useRef<string | undefined>();
  const firstLoad = React.useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      // skip showing toast on first page load (refresh)
      firstLoad.current = false;
      prevUserId.current = userId;
      return;
    }

    if (userId && userId !== prevUserId.current) {
      // real sign in event
      setShowSignedIn(true);
      setTimeout(() => setShowSignedIn(false), 2000);
    }

    prevUserId.current = userId;
  }, [userId]);

  // Wrap the create invoice handler to show 'Creating Invoice'
  const handleCreateInvoice = async () => {
    setCreatingInvoice(true);
    try {
      await onCreateInvoice();
    } finally {
      setCreatingInvoice(false);
    }
  };
  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "invoices"),
      where("createdBy", "==", userId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setInvoices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  // Responsive: set isMobile and visibleCount
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setVisibleCount(mobile ? 10 : 15);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getTotalPayment = (invoice: any) => {
    return invoice.totalPayment ?? 0;
  };

  const handleInvoiceClick = (invoiceId: string) => {
    onSelectInvoice(invoiceId);
  };

  if (loading) {
    // Show skeletons only if loading and we expect invoices
    return (
      <div className="min-h-screen bg-dark p-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="md:text-4xl text-2xl font-bold text-white">
              Your Invoices
            </h1>
            <button
              className={[
                "bg-gradient-to-r from-black via-[#494949] to-[#868686]",
                "hover:from-[#868686] hover:via-[#494949] hover:to-black",
                "transition-all duration-700 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-3 text-lg  select-none",
                creatingInvoice
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer",
              ].join(" ")}
              onClick={creatingInvoice ? undefined : handleCreateInvoice}
              disabled={creatingInvoice}
            >
              <Plus className="w-5 h-5" />
              {creatingInvoice ? "Creating Invoice" : "New Invoice"}
            </button>
          </div>
          {/* Only show skeletons if we don't know if user has invoices yet */}
          {invoices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonSection />
              <SkeletonSection />
              <SkeletonSection />
            </div>
          )}
        </div>
      </div>
    );
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.slice(0, visibleCount).map((invoice) => (
          <div
            key={invoice.id}
            onClick={() => invoice.id && handleInvoiceClick(invoice.id)}
            className="bg-[#0A0A0A] hover:bg-[#131313] rounded-xl p-6 shadow-xl cursor-pointer transition-colors duration-200 border border-[#222]"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white truncate">
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
                  Created:{" "}
                  {invoice.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
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
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Client: {invoice.clientName || "Not specified"}</span>
              </div>
            </div>
            {invoice.updatedAt && (
              <div className="mt-4 flex justify-between items-center text-xs text-gray-400 ">
                <button
                  title="Delete Invoice"
                  className="hover:text-red-500 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDeleteId(invoice.id);
                    setModalOpen(true);
                  }}
                  disabled={pendingDeleteId === invoice.id && modalOpen}
                >
                  <div className="bg-[#1c1c1c] py-1 px-3 rounded-2xl hover:bg-red-500/20 transition-colors flex items-center">
                    <MdDelete className="inline-block mr-1 text-lg align-middle" />
                    {pendingDeleteId === invoice.id && modalOpen ? 'Deleting...' : ''}
                  </div>
                </button>
                <span>
                  Last updated: {(() => {
                    if (!invoice.updatedAt) return 'N/A';
                    let date;
                    if (typeof invoice.updatedAt.toDate === 'function') {
                      date = invoice.updatedAt.toDate();
                    } else if (invoice.updatedAt instanceof Date) {
                      date = invoice.updatedAt;
                    } else if (typeof invoice.updatedAt === 'string' || typeof invoice.updatedAt === 'number') {
                      const d = new Date(invoice.updatedAt);
                      if (!isNaN(d.getTime())) date = d;
                    }
                    return date ? date.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    }) : 'N/A';
                  })()}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      {invoices.length > visibleCount && (
        <div className="flex justify-center mt-8">
          <button
            className="bg-[#0A0A0A] hover:bg-[#131313] border border-[#222222] w-full md:w-1/2 text-white font-semibold py-2 px-6 rounded-xl transition-colors duration-200 shadow"
            onClick={() =>
              setVisibleCount((prev) => prev + (isMobile ? 10 : 15))
            }
          >
            Load More Invoices
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-dark p-6 relative">
      <ConfirmModal
        open={modalOpen}
        message="Are you sure you want to delete this invoice?"
        onCancel={() => {
          setModalOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={async () => {
          if (pendingDeleteId) {
            const { doc, deleteDoc } = await import("firebase/firestore");
            await deleteDoc(doc(db, "invoices", pendingDeleteId));
            setInvoices((prev) =>
              prev.filter((inv) => inv.id !== pendingDeleteId)
            );
          }
          setModalOpen(false);
          setPendingDeleteId(null);
        }}
      />
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="md:text-4xl text-2xl font-bold text-white">
            Your Invoices
          </h1>
          <button
            onClick={handleCreateInvoice}
            className="bg-gradient-to-r from-black via-[#494949] to-[#868686]
                hover:from-[#868686] hover:via-[#494949] hover:to-black text-white font-semibold py-3 gap-3 md:text-lg transition-all duration-700 px-6 rounded-xl flex items-center justify-center text-lg select-none"
            disabled={creatingInvoice}
          >
            <Plus className="w-5 h-5" />
            {creatingInvoice ? "Creating Invoice" : "New Invoice"}
          </button>
        </div>

        {invoices.length === 0 ? emptyState : invoiceCards}
      </div>
      {showSignedIn && (
        <div className="fixed bottom-6 right-6 bg-green-800 text-white px-4 flex items-center gap-2 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
          <LogInIcon className="inline-block mr-1" />
          Signed in successfully!
        </div>
      )}
      {showCopied && (
        <div className="fixed flex items-center gap-2 bottom-6 right-6 bg-[#dadada] text-[#000] px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
          <FaRegCopy />
          Text Copied!
        </div>
      )}
      {showDeleted && (
        <div className="fixed bottom-6 right-6 bg-[#131313] text-white px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
          Invoice Deleted!
        </div>
      )}
    </div>
  );
};
