"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/Badge";
import { GlowButton } from "@/components/ui/GlowButton";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";

const PLANS = [
  {
    tier: "pro",
    label: "Pro",
    price: 499,
    currency: "MAD",
    period: "year",
    features: [
      "Video uploads & multimedia posts",
      "Pro badge on profile",
      "Advanced analytics dashboard",
      "Priority support",
      "Extended milestone tracking",
    ],
    color: "#8B5CF6",
  },
  {
    tier: "elite",
    label: "Elite",
    price: 2499,
    currency: "MAD",
    period: "year",
    features: [
      "Everything in Pro",
      "Invite code generation (x5)",
      "Early access to new features",
      "Dedicated account manager",
      "API access for portfolio sync",
      "Custom deal room branding",
    ],
    color: "#14b8a6",
    popular: true,
  },
];

const BANK_DETAILS = {
  bank: "Banque Centrale Populaire (BCP)",
  accountName: "ScaleTrek SARL",
  iban: "MA64 0100 0000 0000 0000 0000 00",
  rib: "000 000 000 000 0000 0000 00",
  swift: "BCPOMAMC",
};

export default function ConciergePage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "invoice" | "receipt" | "confirm">("select");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoice, setInvoice] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const generateInvoice = async () => {
    if (!user || !selectedPlan) return;
    setSubmitting(true);
    setError("");

    try {
      const num = `STK-INV-${Date.now().toString(36).toUpperCase()}`;
      setInvoiceNumber(num);

      const plan = PLANS.find((p) => p.tier === selectedPlan);
      const inv = {
        user_id: user.id,
        invoice_number: num,
        tier: selectedPlan,
        amount: plan?.price || 0,
        currency: plan?.currency || "MAD",
        status: "pending",
        due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
        bank_details: BANK_DETAILS,
      };

      const { error: dbError } = await supabase.from("invoices").insert(inv);
      if (dbError) throw dbError;
      setInvoice(inv);
      setStep("invoice");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile || !invoiceNumber || !user) return;
    setUploading(true);
    setError("");

    try {
      const fileExt = receiptFile.name.split(".").pop();
      const filePath = `receipts/${user.id}/${invoiceNumber}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, receiptFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("receipts").getPublicUrl(filePath);

      await supabase
        .from("invoices")
        .update({
          receipt_url: publicUrl,
          receipt_uploaded_at: new Date().toISOString(),
          status: "paid",
        })
        .eq("invoice_number", invoiceNumber);

      await supabase
        .from("subscriptions")
        .update({ payment_status: "paid", tier: selectedPlan })
        .eq("user_id", user.id);

      setStep("confirm");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-graphite">
      <Navbar lang={lang} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet/10 border border-violet/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125V9M7.5 9.75h3m-6 0h3m-3 2.25h3m-3 2.25h3m-3 2.25h3" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Premium Concierge</h1>
              <p className="text-xs text-muted">Select a plan and complete payment via bank transfer</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
          )}

          <AnimatePresence mode="wait">
            {step === "select" && (
              <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {PLANS.map((plan) => {
                    const selected = selectedPlan === plan.tier;
                    return (
                      <button
                        key={plan.tier}
                        onClick={() => setSelectedPlan(plan.tier)}
                        className={`panel p-6 text-left transition-all duration-300 ${
                          selected ? "ring-2 ring-violet/60 border-violet/40" : "hover:border-violet/20"
                        }`}
                      >
                        {plan.popular && (
                          <div className="inline-flex px-2 py-0.5 rounded-full bg-cyan/10 border border-cyan/20 text-[10px] font-semibold text-cyan uppercase tracking-wider mb-3">
                            Most Popular
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-white">{plan.label}</span>
                          <div className="text-right">
                            <span className="text-2xl font-light text-white">{plan.price}</span>
                            <span className="text-xs text-muted ml-1">{plan.currency}</span>
                            <p className="text-[10px] text-muted">per {plan.period}</p>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted">
                              <svg className="w-3.5 h-3.5 text-cyan shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>

                <div className="panel p-4 text-center">
                  <p className="text-xs text-muted mb-3">
                    Payments processed via secure bank transfer. Your subscription activates once payment is confirmed by our team.
                  </p>
                  <GlowButton
                    variant="primary"
                    size="lg"
                    disabled={!selectedPlan || submitting}
                    loading={submitting}
                    onClick={generateInvoice}
                    className="w-full py-3 rounded-xl"
                  >
                    {submitting ? "Generating Invoice..." : "Generate Invoice & Proceed"}
                  </GlowButton>
                </div>
              </motion.div>
            )}

            {step === "invoice" && invoice && (
              <motion.div key="invoice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="panel p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-sm font-semibold text-white">Invoice</h2>
                      <p className="text-[10px] text-muted font-mono">{invoiceNumber}</p>
                    </div>
                    <Badge label="Pending" color="#F59E0B" variant="outline" size="md" />
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="panel p-4">
                      <h3 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Bank Transfer Details</h3>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted">Bank</span>
                          <span className="text-white font-medium">{BANK_DETAILS.bank}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Account Name</span>
                          <span className="text-white font-medium">{BANK_DETAILS.accountName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">IBAN</span>
                          <span className="text-white font-mono text-[10px]">{BANK_DETAILS.iban}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">RIB</span>
                          <span className="text-white font-mono text-[10px]">{BANK_DETAILS.rib}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">SWIFT</span>
                          <span className="text-white font-mono text-[10px]">{BANK_DETAILS.swift}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between py-2 border-t border-graphite-800/60">
                      <span className="text-xs text-white font-semibold">Total</span>
                      <span className="text-sm font-bold text-white">{invoice.amount} {invoice.currency}</span>
                    </div>

                    <p className="text-[10px] text-muted">
                      Reference: <span className="text-white font-mono">{invoiceNumber}</span>
                      <br />
                      Due: {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="panel p-6">
                  <h3 className="text-xs font-semibold text-white mb-4">Upload Payment Receipt</h3>
                  <div className="border-2 border-dashed border-graphite-800/60 rounded-xl p-6 text-center mb-4">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label htmlFor="receipt-upload" className="cursor-pointer">
                      {receiptFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-cyan font-medium">{receiptFile.name}</span>
                        </div>
                      ) : (
                        <div>
                          <svg className="w-8 h-8 text-muted mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <p className="text-xs text-muted mb-1">Click to upload payment receipt</p>
                          <p className="text-[10px] text-muted/60">PDF, PNG, JPG accepted</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <GlowButton
                    variant="primary"
                    size="lg"
                    disabled={!receiptFile || uploading}
                    loading={uploading}
                    onClick={handleReceiptUpload}
                    className="w-full py-3 rounded-xl"
                  >
                    {uploading ? "Uploading..." : "Submit Receipt for Verification"}
                  </GlowButton>
                </div>
              </motion.div>
            )}

            {step === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center panel p-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Receipt Submitted</h2>
                <p className="text-xs text-muted max-w-sm mx-auto mb-6">
                  Your payment receipt has been uploaded. Our team will verify it within 24 hours.
                  You will receive a notification once your subscription is activated.
                </p>
                <GlowButton variant="primary" onClick={() => router.push(`/${lang}/feed`)} className="px-6 py-2.5 rounded-xl">
                  Return to Feed
                </GlowButton>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
