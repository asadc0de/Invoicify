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
    <div className="min-h-screen bg-dark flex flex-col items-center justify-start py-8 sm:py-10 md:py-12 px-2 sm:px-4 md:px-8 font-[matter]">
      <div className="w-full max-w-3xl">
        <div className="mb-4 sm:mb-6 text-center">
          <span className="inline-block bg-[#0A0A0A] text-white px-3 sm:px-4 py-2 rounded-full text-base font-semibold shadow border border-[#333]">
            Viewing Mode
          </span>
        </div>

        <div className="bg-gray-900 text-white opacity-80 rounded-xl shadow-xl w-full border border-[#333] p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 font-[matter]">
          <div className="flex justify-between items-center">
            <div className="mb-2 text-sm sm:text-base">
              <span className="font-bold text-white ">Start Date:</span>{" "}
              <span className="text-white opacity-80">
                {invoice.startDate.toLocaleDateString()}
              </span>
            </div>
            {invoice.updatedAt && (
              <div className="text-lg text-gray-400 ml-auto">
                Last updated:{" "}
                {new Date(invoice.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            )}
          </div>
          {/* Project Title Big and Centered */}
          <div className="mb-6 sm:mb-8 bg-[#131313] py-2 px-4 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              {/* Project Title */}
              <div className="text-center sm:text-left">
                <div className="text-white text-base sm:text-2xl font-semibold mb-1">
                  Project Title
                </div>
                <div className="text-white opacity-80 font-normal text-lg sm:text-xl">
                  {invoice.projectTitle}
                </div>
              </div>

              {/* Website Pages */}
              <div className="text-center sm:text-right">
                <div className="text-white text-base sm:text-2xl font-semibold mb-1">
                  Website Pages
                </div>
                <div className="text-white text-center opacity-80 font-normal text-lg sm:text-xl">
                  {invoice.websitePages}
                </div>
              </div>
            </div>
          </div>

          {/* Freelancer and Client Info Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-between sm:gap-8 mb-6 sm:mb-8">
            <div>
              <div className="font-bold text-base sm:text-xl text-white  mb-2 text-center md:text-left">
                Freelancer Info
              </div>
              <div className="ml-2 sm:ml-4">
                <div>
                  <span className="font-semibold">Name:</span>{" "}
                  {invoice.freelancerName}
                </div>
                <div>
                  <span className="font-semibold">Email:</span>{" "}
                  {invoice.freelancerEmail}
                </div>
                <div>
                  <span className="font-semibold">Contact:</span>{" "}
                  {invoice.freelancerContact}
                </div>
              </div>
            </div>
            <div>
              <div className="font-bold text-base sm:text-xl text-white mb-2 text-center md:text-left">
                Client Info
              </div>
              <div className="ml-2 sm:ml-4">
                <div>
                  <span className="font-semibold">Name:</span>{" "}
                  {invoice.clientName}
                </div>
                <div>
                  <span className="font-semibold">Email:</span>{" "}
                  {invoice.clientEmail}
                </div>
                <div>
                  <span className="font-semibold">Contact:</span>{" "}
                  {invoice.clientContact}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold text-base sm:text-xl text-white  mb-2">
              Features
            </div>
            <ul className="ml-2 sm:ml-4 list-disc">
              {invoice.features.map((f) => (
                <li key={f.id} className="mb-1 bg-[#0F0F0F] px-2 py-1 rounded-lg">
                  {f.description}
                </li>
              ))}
            </ul>
          </div>

          {/* Revisions and Payment Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
            <div>
              <div className="font-bold text-base sm:text-xl text-white  mb-2">
                Revisions
              </div>
              <div className="ml-2 sm:ml-4">
                <div>
                  <span className="font-semibold">Total:</span>{" "}
                  {invoice.totalRevisions}
                </div>
                <div>
                  <span className="font-semibold">Used:</span>{" "}
                  {invoice.usedRevisions}
                </div>
                <div>
                  <span className="font-semibold">Remaining:</span>{" "}
                  {Math.max(
                    0,
                    (invoice.totalRevisions || 0) - (invoice.usedRevisions || 0)
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="font-bold text-base sm:text-xl text-white  mb-2">
                Payment
              </div>
              <div className="ml-2 sm:ml-4">
                <div>
                  <span className="font-semibold">Total Payment:</span>{" "}
                  {currencySymbol}
                  {invoice.totalPayment ?? ""}
                </div>
                <div>
                  <span className="font-semibold">Paid Payment:</span>{" "}
                  {invoice.paidPayment !== undefined &&
                  invoice.paidPayment !== null
                    ? currencySymbol + invoice.paidPayment
                    : ""}
                </div>
                <div>
                  <span className="font-thin">Status:</span>{" "}
                  <span className={`p-1 text-sm rounded-lg ${statusColor}`}>
                    {invoice.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTextView;
