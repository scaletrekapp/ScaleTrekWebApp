"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { GlowButton } from "@/components/ui/GlowButton";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";

export default function InvestorApplyPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [credentialFile, setCredentialFile] = useState<File | null>(null);
  const [companyProofFile, setCompanyProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError("");

    try {
      let credentialUrl = "";
      let companyProofUrl = "";

      if (credentialFile) {
        const ext = credentialFile.name.split(".").pop();
        const path = `investor-kyc/${user.id}/credential.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("kyc-documents")
          .upload(path, credentialFile);
        if (uploadErr) throw uploadErr;
        const { data: { publicUrl } } = supabase.storage.from("kyc-documents").getPublicUrl(path);
        credentialUrl = publicUrl;
      }

      if (companyProofFile) {
        const ext = companyProofFile.name.split(".").pop();
        const path = `investor-kyc/${user.id}/company-proof.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("kyc-documents")
          .upload(path, companyProofFile);
        if (uploadErr) throw uploadErr;
        const { data: { publicUrl } } = supabase.storage.from("kyc-documents").getPublicUrl(path);
        companyProofUrl = publicUrl;
      }

      const { error: upsertErr } = await supabase.from("investor_profiles").upsert({
        user_id: user.id,
        linkedin_url: linkedinUrl,
        credential_url: credentialUrl,
        company_proof_url: companyProofUrl,
        investor_status: "pending",
        risk_tolerance: 50,
        portfolio_size: 0,
      }, { onConflict: "user_id" });

      if (upsertErr) throw upsertErr;

      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "verify",
        title: "Investor Application Submitted",
        body: "Your application is under review. We will notify you once approved.",
      });

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Application failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-graphite">
        <Navbar lang={lang} />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Application Submitted</h1>
            <p className="text-sm text-muted mb-6">
              Your investor application is under review. Our team will verify your credentials within 48 hours.
              You will receive a notification once your investor access is approved.
            </p>
            <p className="text-xs text-muted/60 mb-6">
              Meanwhile, you can browse the feed with your current account type.
            </p>
            <GlowButton variant="primary" onClick={() => router.push(`/${lang}/feed`)} className="px-6 py-2.5 rounded-xl">
              Go to Feed
            </GlowButton>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-graphite">
      <Navbar lang={lang} />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Investor Application</h1>
              <p className="text-xs text-muted">Submit your credentials for investor vetting</p>
            </div>
          </div>

          <div className="panel p-4 mb-4">
            <div className="flex items-start gap-2.5">
              <svg className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-xs text-muted">
                Investor accounts require manual review to protect founder data. Please submit your professional credentials — your application will be reviewed within 48 hours.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">LinkedIn Profile *</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-graphite-800/60 text-white text-sm placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-violet/40 transition-all"
                placeholder="https://linkedin.com/in/yourprofile"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Company / Organization</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-graphite-800/60 text-white text-sm placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-violet/40 transition-all"
                placeholder="Acme Ventures"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Professional Credential *</label>
              <div className="border-2 border-dashed border-graphite-800/60 rounded-xl p-4 text-center">
                <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setCredentialFile(e.target.files?.[0] || null)} className="hidden" id="credential-upload" />
                <label htmlFor="credential-upload" className="cursor-pointer">
                  {credentialFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-cyan font-medium">{credentialFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-6 h-6 text-muted mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <p className="text-xs text-muted">Upload business card, certificate, or license</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Company Proof (optional)</label>
              <div className="border-2 border-dashed border-graphite-800/60 rounded-xl p-4 text-center">
                <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setCompanyProofFile(e.target.files?.[0] || null)} className="hidden" id="company-proof-upload" />
                <label htmlFor="company-proof-upload" className="cursor-pointer">
                  {companyProofFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-cyan font-medium">{companyProofFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-6 h-6 text-muted mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <p className="text-xs text-muted">Upload company registration or proof of funds</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <GlowButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={!linkedinUrl || !credentialFile || submitting}
              loading={submitting}
              className="w-full py-3 rounded-xl"
            >
              {submitting ? "Submitting Application..." : "Submit for Review"}
            </GlowButton>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
