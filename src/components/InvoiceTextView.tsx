import React from "react";
import { useParams } from "react-router-dom";
import { useInvoice } from "../hooks/useInvoice";
import { SkeletonSection } from "./Skeleton";

const InvoiceTextView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { invoice, loading } = useInvoice(id);

  if (loading)
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <SkeletonSection />
          <SkeletonSection />
        </div>
      </div>
    );
  if (!invoice)
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center text-red-300 text-xl">
        Invoice not found.
      </div>
    );

  // Helper for currency symbol
  const currencySymbol = invoice.currency === "PKR" ? "₨" : "$";
  const statusColor =
    invoice.paymentStatus === "paid"
      ? "bg-green-900 text-green-300 border-green-700"
      : "bg-yellow-900 text-yellow-300 border-yellow-700";

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 text-center">
          <span className="inline-block bg-[#0A0A0A] text-white px-4 py-2 rounded-full text-base font-semibold shadow border border-[#333]">
            Viewing Mode
          </span>
        </div>
        {/* Top Section */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="block text-lg font-semibold text-white mb-2">Invoice Date</span>
              <div className="flex items-center gap-2 text-gray-300 text-lg">
                {invoice.startDate && (typeof invoice.startDate.toDate === 'function'
                  ? invoice.startDate.toDate()?.toLocaleDateString()
                  : (invoice.startDate instanceof Date
                      ? invoice.startDate.toLocaleDateString()
                      : (typeof invoice.startDate === 'string' || typeof invoice.startDate === 'number')
                        ? new Date(invoice.startDate).toLocaleDateString()
                        : null)) || 'N/A'}
              </div>
            </div>
            <div>
              {invoice.updatedAt && (
                <div className="text-lg text-gray-400">
                  Last updated: {" "}
                  {new Date(invoice.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Details Section */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Project Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="block text-lg font-semibold text-white mb-2">Project Title</span>
              <div className="text-white opacity-80 font-normal text-lg capitalize">
                {invoice.projectTitle}
              </div>
            </div>
            <div>
              <span className="block text-lg font-semibold text-white mb-2">Website Pages</span>
              <div className="text-white opacity-80 font-normal text-lg">
                {invoice.websitePages}
              </div>
            </div>
          </div>
        </div>

        {/* Freelancer & Client Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border">
            <h2 className="text-2xl font-bold text-white mb-6">Freelancer Info</h2>
            <div className="space-y-4">
              <div>
                <span className="block text-lg font-semibold text-white mb-2">Name</span>
                <div className="text-white opacity-80 font-normal text-lg capitalize">{invoice.freelancerName}</div>
              </div>
              <div>
                <span className="block text-lg font-semibold text-white mb-2">Email</span>
                <div className="text-white opacity-80 font-normal text-lg">{invoice.freelancerEmail}</div>
              </div>
              <div>
                <span className="block text-lg font-semibold text-white mb-2">Contact</span>
                <div className="text-white opacity-80 font-normal text-lg">{invoice.freelancerContact}</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border">
            <h2 className="text-2xl font-bold text-white mb-6">Client Info</h2>
            <div className="space-y-4">
              <div>
                <span className="block text-lg font-semibold text-white mb-2">Name</span>
                <div className="text-white opacity-80 font-normal text-lg capitalize">{invoice.clientName}</div>
              </div>
              <div>
                <span className="block text-lg font-semibold text-white mb-2">Email</span>
                <div className="text-white opacity-80 font-normal text-lg">{invoice.clientEmail}</div>
              </div>
              <div>
                <span className="block text-lg font-semibold text-white mb-2">Contact</span>
                <div className="text-white opacity-80 font-normal text-lg">{invoice.clientContact}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Features</h2>
          <div className="space-y-4">
            {(invoice.features || []).map((feature: { id: React.Key | null | undefined; description: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: number) => (
              <div key={feature.id} className="bg-[#111] rounded-lg p-4 border border-[#222]">
                <span className="block text-lg font-semibold text-white mb-2">Feature {index + 1}</span>
                <div className="text-white opacity-80 font-normal text-lg">{feature.description}</div>
              </div>
            ))}
            {(invoice.features || []).length === 0 && (
              <p className="text-gray-500 text-center py-8 text-lg">No features added yet.</p>
            )}
          </div>
        </div>

        {/* Revisions Section */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Revisions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">Total Revisions</p>
              <p className="text-3xl font-bold text-white">{invoice.totalRevisions || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">Used Revisions</p>
              <p className="text-3xl font-bold text-yellow-400">{invoice.usedRevisions || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">Remaining</p>
              <p className="text-3xl font-bold text-green-400">{Math.max(0, (invoice.totalRevisions || 0) - (invoice.usedRevisions || 0))}</p>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Payment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="block text-lg font-semibold text-white mb-2">Total Payment</span>
              <div className="text-green-400 font-bold text-3xl">{currencySymbol}{invoice.totalPayment ?? ""}</div>
              {(invoice.totalPayment || 0) > 0 && invoice.paymentStatus === "paid" && (
                <div className="mt-2 text-lg text-green-400">Full Payment: {currencySymbol}{(invoice.totalPayment || 0).toLocaleString()}</div>
              )}
            </div>
            <div>
              <span className="block text-lg font-semibold text-white mb-2">Paid Payment</span>
              <div className="text-white font-normal text-lg w-fit">{invoice.paidPayment !== undefined && invoice.paidPayment !== null ? currencySymbol + invoice.paidPayment : ""}</div>
            </div>
            <div>
              <span className="block text-lg font-semibold text-white mb-2">Payment Status</span>
              <div className={`p-1 text-sm rounded-lg w-fit ${statusColor}`}>{invoice.paymentStatus === "paid" ? "Paid" : "Pending"}</div>
            </div>
          </div>
          {invoice.paymentStatus === "paid" && (invoice.advancePayment || 0) > 0 && (
            <div className="mt-6 bg-green-900 border border-green-700 rounded-lg p-4">
              <p className="text-green-300 text-lg font-semibold">Advance shown: {currencySymbol}{(invoice.advancePayment || 0).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceTextView;
