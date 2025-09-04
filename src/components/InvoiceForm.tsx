import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  Download,
  Plus,
  Trash2,
  ArrowLeft,
  Camera,
  Minus,
  Calendar,
} from "lucide-react";
import { useInvoice } from "../hooks/useInvoice";
import { useAuth } from "../hooks/useAuth";
import { Invoice, Feature, RevisionSnapshot } from "../types";
import { exportSimplePDF } from "../utils/simplePdfExport";
import { SkeletonSection } from "./Skeleton";

interface InvoiceFormProps {
  invoiceId?: string;
  onBack: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceId,
  onBack,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { invoice, loading, saving, saveInvoice } = useInvoice(invoiceId);
  const [formData, setFormData] = useState<Partial<Invoice>>({});
  const [currency, setCurrency] = useState<"USD" | "PKR">("USD");
  // Removed share link state

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
    }
  }, [invoice]);

  const isCreator = useMemo(
    () => user?.uid === invoice?.createdBy,
    [user?.uid, invoice?.createdBy]
  );
  const canEdit = isCreator;

  const handleSave = useCallback(async () => {
    if (!canEdit) return;
    try {
      await saveInvoice({ ...formData, currency });
      navigate("/");
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  }, [canEdit, saveInvoice, formData, currency, navigate]);

  const handleExportSimplePDF = useCallback(() => {
    exportSimplePDF(formData, currency);
  }, [formData, currency]);

  const addFeature = useCallback(() => {
    if (!canEdit) return;
    const newFeature: Feature = {
      id: Date.now().toString(),
      description: "",
      price: 0,
    };
    setFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), newFeature],
    }));
  }, [canEdit]);

  const updateFeature = useCallback(
    (featureId: string, updates: Partial<Feature>) => {
      if (!canEdit) return;
      setFormData((prev) => ({
        ...prev,
        features:
          prev.features?.map((feature) =>
            feature.id === featureId ? { ...feature, ...updates } : feature
          ) || [],
      }));
    },
    [canEdit]
  );

  const deleteFeature = useCallback(
    (featureId: string) => {
      if (!canEdit) return;
      setFormData((prev) => ({
        ...prev,
        features:
          prev.features?.filter((feature) => feature.id !== featureId) || [],
      }));
    },
    [canEdit]
  );

  const useRevision = useCallback(() => {
    if (!canEdit || formData.totalRevisions == null) return;
    if ((formData.usedRevisions || 0) >= formData.totalRevisions) return;
    setFormData((prev) => ({
      ...prev,
      usedRevisions: (prev.usedRevisions || 0) + 1,
    }));
  }, [canEdit, formData.usedRevisions, formData.totalRevisions]);

  const addRevisionSlot = useCallback(() => {
    if (!canEdit) return;
    setFormData((prev) => ({
      ...prev,
      totalRevisions: (prev.totalRevisions || 0) + 1,
    }));
  }, [canEdit]);

  const deleteRevisionSlot = useCallback(() => {
    if (!canEdit || !formData.totalRevisions || formData.totalRevisions <= 1)
      return;
    setFormData((prev) => ({
      ...prev,
      totalRevisions: Math.max(1, (prev.totalRevisions || 1) - 1),
      usedRevisions: Math.min(
        prev.usedRevisions || 0,
        (prev.totalRevisions || 1) - 1
      ),
    }));
  }, [canEdit, formData.totalRevisions, formData.usedRevisions]);

  const saveRevisionSnapshot = useCallback(() => {
    if (!canEdit) return;
    const newSnapshot: RevisionSnapshot = {
      id: Date.now().toString(),
      timestamp: new Date(),
      usedRevisions: formData.usedRevisions || 0,
    };

    setFormData((prev) => {
      const snapshots = prev.revisionSnapshots || [];
      const updatedSnapshots = [newSnapshot, ...snapshots].slice(0, 5);
      return {
        ...prev,
        revisionSnapshots: updatedSnapshots,
      };
    });
  }, [canEdit, formData.usedRevisions]);

  // Remove getTotalPayment calculation, use user input instead

  const getRemainingRevisions = useMemo(() => {
    return Math.max(
      0,
      (formData.totalRevisions || 0) - (formData.usedRevisions || 0)
    );
  }, [formData.totalRevisions, formData.usedRevisions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <SkeletonSection />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonSection />
            <SkeletonSection />
          </div>
          <SkeletonSection />
          <SkeletonSection />
          <SkeletonSection />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between md:mb-8 mb-14">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="bg-[#222] hover:bg-gray-600 border border-[#333] text-white p-3 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4" data-hide-in-pdf>
            
            <button
              onClick={handleExportSimplePDF}
              className="bg-[#0A0A0A] hover:bg-[#131313] border border-[#222222] text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 md:text-lg text-base"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#083118] hover:bg-[#0a371b] border border-[#222222] disabled:bg-green-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 md:text-lg text-base"
              >
                <Save className="w-5 h-5" />
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>
        </div>

        <div id="invoice-content" className="space-y-6">
          {/* Top Section */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border">
            <div className="flex justify-between items-center">
              {/* Invoice Date */}
              <div>
                <label className="block text-lg font-semibold text-white mb-2">
                  Invoice Date
                </label>
                <div className="flex items-center gap-2 text-gray-300 text-lg">
                  <Calendar className="w-5 h-5" />
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Last updated time */}
              <div>
                {formData.updatedAt && (
                  <div className="text-lg text-gray-400">
                    Last updated:{" "}
                    {new Date(formData.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border">
            <h2 className="text-2xl font-bold text-white mb-6">
              Project Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-white mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={formData.projectTitle || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectTitle: e.target.value,
                      
                    }))
                  }
                  disabled={!canEdit}
            placeholder="Enter project title"
            className="outline-none w-full bg-gray-800 text-white border border-[#222] rounded-2xl px-4 py-3 text-lg focus:ring-2 focus:ring-[#333] disabled:opacity-50 capitalize"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-white mb-2">
                  Website Pages
                </label>
                <input
                  type="text"
                  value={
                    formData.websitePages === undefined
                      ? ""
                      : formData.websitePages
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      websitePages: val === "" ? undefined : parseInt(val),
                    }));
                  }}
                  disabled={!canEdit}
            className="outline-none w-full bg-gray-800 text-white border border-[#222] rounded-2xl px-4 py-3 text-lg focus:ring-2 focus:ring-[#333] disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Freelancer & Client Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Freelancer Info */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border">
              <h2 className="text-2xl font-bold text-white mb-6">
                Freelancer Info
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-semibold text-white mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.freelancerName || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        freelancerName: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                    placeholder="Your name"
              className="outline-none w-full bg-gray-800 text-white border border-[#222] rounded-2xl px-4 py-3 text-lg focus:ring-2 focus:ring-[#333] disabled:opacity-50 capitalize"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.freelancerEmail || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        freelancerEmail: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                    placeholder="your@email.com"
              className="outline-none w-full bg-gray-800 text-white border border-[#222] rounded-2xl px-4 py-3 text-lg focus:ring-2 focus:ring-[#333] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-white mb-2">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={formData.freelancerContact || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        freelancerContact: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                    placeholder="Phone or other contact"
              className="outline-none w-full bg-gray-800 text-white border border-[#222] rounded-2xl px-4 py-3 text-lg focus:ring-2 focus:ring-[#333] disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border">
              <h2 className="text-2xl font-bold text-white mb-6">
                Client Info
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-semibold text-white mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.clientName || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clientName: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                    placeholder="Client name"
              className="outline-none w-full bg-gray-800 text-white border border-[#222] rounded-2xl px-4 py-3 text-lg focus:ring-2 focus:ring-[#333] disabled:opacity-50 capitalize"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clientEmail: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                    placeholder="client@email.com"
              className="outline-none w-full bg-gray-800 text-white border border-[#222] rounded-2xl px-4 py-3 text-lg focus:ring-2 focus:ring-[#333] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-white mb-2">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={formData.clientContact || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        clientContact: e.target.value,
                      }))
                    }
                    disabled={!canEdit}
                    placeholder="Phone or other contact"
              className="outline-none w-full bg-gray-800 text-white border border-[#222] rounded-2xl px-4 py-3 text-lg focus:ring-2 focus:ring-[#333] disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
<div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-white">Features</h2>
    {canEdit && (
      <button
        onClick={addFeature}
        className="bg-[#0A0A0A] hover:bg-[#131313] border border-[#222222] text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200 flex items-center gap-3 text-lg"
        data-hide-in-pdf
      >
        <Plus className="w-4 h-4" />
        Add Feature
      </button>
    )}
  </div>

  <div className="space-y-4">
    {(formData.features || []).map((feature, index) => (
      <div
        key={feature.id}
        className="bg-gray-800 rounded-lg p-4 border border-[#222]"
      >
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <label className="block text-lg font-semibold text-white mb-2">
              Feature {index + 1}
            </label>
            <textarea
              value={feature.description}
              onChange={(e) =>
                updateFeature(feature.id, {
                  // Capitalize only the very first letter
                  description:
                    e.target.value.charAt(0).toUpperCase() +
                    e.target.value.slice(1),
                })
              }
              disabled={!canEdit}
              placeholder="Describe the feature or service"
              rows={3}
              className="outline-none w-full bg-[#222] text-white border border-gray-600 rounded-2xl px-4 py-3 text-lg focus:ring-2 focus:ring-[#333] disabled:opacity-50 resize-none"
            />
          </div>
          {canEdit && (
            <button
              onClick={() => deleteFeature(feature.id)}
              className="mt-8 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors duration-200"
              data-hide-in-pdf
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    ))}

    {(formData.features || []).length === 0 && (
      <p className="text-gray-500 text-center py-8 text-lg">
        No features added yet. Click "Add Feature" to get started.
      </p>
    )}
  </div>
</div>

          {/* Revisions Section */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border">
            <h2 className="text-2xl font-bold text-white mb-6">Revisions</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-gray-400 text-lg mb-2">Total Revisions</p>
                <p className="text-3xl font-bold text-white">
                  {formData.totalRevisions || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-lg mb-2">Used Revisions</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {formData.usedRevisions || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-lg mb-2">Remaining</p>
                <p className="text-3xl font-bold text-green-400">
                  {getRemainingRevisions}
                </p>
              </div>
            </div>

            {canEdit && (
              <div
                className="flex flex-wrap justify-between items-center gap-3 mb-6"
                data-hide-in-pdf
              >
                <button
                  onClick={useRevision}
                  disabled={getRemainingRevisions === 0}
                  className="bg-[#0A0A0A] hover:bg-[#131313] border border-[#222222] text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200 flex items-center gap-3 text-lg md:w-fit w-full justify-center"
                >
                  <Minus className="w-4 h-4" />
                  Used Revisions
                </button>
                <button
                  onClick={addRevisionSlot}
                  className="bg-[#0A0A0A] hover:bg-[#131313] border border-[#222222] text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200 flex items-center gap-3 text-lg md:w-fit w-full justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
                <button
                  onClick={deleteRevisionSlot}
                  disabled={(formData.totalRevisions || 0) <= 1}
                  className="bg-[#0A0A0A] hover:bg-[#131313] border border-[#222222] text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200 flex items-center gap-3 text-lg md:w-fit w-full justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={saveRevisionSnapshot}
                  className="bg-[#0A0A0A] hover:bg-[#131313] border border-[#222222] text-white font-semibold py-3 px-6 rounded-2xl transition-colors duration-200 flex items-center gap-3 text-lg md:w-fit w-full justify-center"
                >
                  <Camera className="w-4 h-4" />
                  Take Snapshot
                </button>
              </div>
            )}

            {/* Revision History */}
            {(formData.revisionSnapshots || []).length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Revision History
                </h3>
                <div className="space-y-2">
                  {(formData.revisionSnapshots || []).map((snapshot) => (
                    <div
                      key={snapshot.id}
                      className="bg-gray-800 rounded-lg p-3 flex justify-between items-center"
                    >
                      <span className="text-gray-300 text-lg">
                        {snapshot.timestamp.toLocaleString()}
                      </span>
                      <span className="text-yellow-400 font-semibold">
                        Used: {snapshot.usedRevisions}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border-[#333] border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Payment</h2>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">Currency:</span>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-l-lg ${
                    currency === "USD"
                      ? "bg-[#3f2914] text-white"
                      : "bg-[#222] text-gray-300"
                  }`}
                  onClick={() => setCurrency("USD")}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-r-lg ${
                    currency === "PKR"
                      ? "bg-blue-600 text-white"
                      : "bg-[#083118] text-gray-300"
                  }`}
                  onClick={() => setCurrency("PKR")}
                >
                  PKR (₨)
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-lg font-semibold text-white mb-2">
                  Total Payment
                </label>
                <input
                  type="text"
                  min="0"
                  step="0.01"
                  value={
                    formData.totalPayment === undefined
                      ? ""
                      : formData.totalPayment
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalPayment:
                        e.target.value === ""
                          ? undefined
                          : parseFloat(e.target.value),
                    }))
                  }
                  disabled={!canEdit}
                  className="outline-none w-full bg-gray-800 text-green-400 border border-[#222] rounded-lg px-4 py-3 text-3xl font-bold focus:ring-2 focus:ring-[#333] disabled:opacity-50"
                />
                {/* Show payment info based on status */}
                {(formData.totalPayment || 0) > 0 &&
                  (formData.paymentStatus === "paid" ? (
                    <div className="mt-2 text-lg text-green-400">
                      Full Payment: {currency === "USD" ? "$" : "₨"}
                      {(formData.totalPayment || 0).toLocaleString()}
                    </div>
                  ) : null)}
              </div>
              <div>
                <label className="block text-lg font-semibold text-white mb-2">
                  Paid Payment
                </label>
                <input
                  type="text"
                  min="0"
                  step="0.01"
                  value={formData.paidPayment || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paidPayment:
                        e.target.value === ""
                          ? undefined
                          : parseFloat(e.target.value),
                    }))
                  }
                  disabled={!canEdit}
                  className="outline-none w-full bg-gray-800 text-white border border-[#222] rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-[#333] disabled:opacity-50"
                  placeholder={currency === "USD" ? "$" : "₨"}
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-white mb-2">
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus || "pending"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      paymentStatus: e.target.value as "pending" | "paid",
                    }))
                  }
                  disabled={!canEdit}
                  className="w-full bg-gray-800 text-white border border-[#222] rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-[#333] disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {formData.paymentStatus === "paid" &&
              (formData.advancePayment || 0) > 0 && (
                <div className="mt-6 bg-green-900 border border-green-700 rounded-lg p-4">
                  <p className="text-green-300 text-lg font-semibold">
                    Advance shown: $
                    {(formData.advancePayment || 0).toLocaleString()}
                  </p>
                </div>
              )}
          </div>
        </div>

        {!canEdit && (
          <div className="mt-8 bg-yellow-900 border border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-300 text-lg">
              You are viewing this invoice in read-only mode. Only the creator
              can make edits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
