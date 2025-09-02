import React, { useCallback, useMemo, useState } from "react";
import { Plus, FileText, Calendar, DollarSign, Copy } from "lucide-react";
import { useUserInvoices } from "../hooks/useInvoice";
import { Invoice } from "../types";
import { SkeletonBox, SkeletonText, SkeletonSection } from "./Skeleton";

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
  const { invoices, loading } = useUserInvoices(userId);
  const [showCopied, setShowCopied] = useState(false);

  // Use the totalPayment field directly from the invoice
  const getTotalPayment = useCallback((invoice: Invoice) => {
    return invoice.totalPayment ?? 0;
  }, []);

  const handleInvoiceClick = useCallback(
    (invoiceId: string) => {
      onSelectInvoice(invoiceId);
    },
    [onSelectInvoice]
  );

  const emptyState = useMemo(
    () => (
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
    ),
    [onCreateInvoice]
  );

  const invoiceCards = useMemo(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.map((invoice) => (
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
                <span>Created: {invoice.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>
                  Total Payment: {" "}
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
              {/* Shareable invoice link */}
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
                <FileText className="w-4 h-4" />
                <span>Client: {invoice.clientName || "Not specified"}</span>
              </div>
            </div>
            {/* Last updated time at end of card */}
            {invoice.updatedAt && (
              <div className="mt-4 text-right text-xs text-gray-400">
                Last updated: {" "}
                {new Date(invoice.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    ),
    [invoices, handleInvoiceClick, getTotalPayment]
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
        <div className="fixed bottom-6 right-6 bg-[#131313] text-white px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
          Text Copied!
        </div>
      )}
    </div>
  );
};
