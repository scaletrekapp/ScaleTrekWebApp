"use client";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function TermsPage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white dark:bg-midnight">
      <Navbar lang={lang} />
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        <h1 className="text-3xl font-bold text-midnight dark:text-white mb-2">{t("legal.terms")}</h1>
        <p className="text-sm text-slate-muted mb-10">Last updated: May 2026</p>

        <div className="prose dark:prose-invert prose-sm max-w-none space-y-8 text-slate-muted">
          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">1. Acceptance of Terms</h2>
            <p>By accessing or using ScaleTrek (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. ScaleTrek is operated by ScaleTrek Ltd, registered in Morocco.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">2. Platform Description</h2>
            <p>ScaleTrek is a sovereign discovery, verification, and investment-intelligence network. The Platform connects investors, angel networks, institutional capital, and verified entrepreneurs. ScaleTrek does NOT hold funds, process investments, or act as a financial intermediary. It is a matching and verification infrastructure only.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">3. User Accounts & Responsibilities</h2>
            <p>3.1 You must provide accurate information during registration.</p>
            <p>3.2 You are solely responsible for the accuracy of all content you publish.</p>
            <p>3.3 You must maintain the confidentiality of your account credentials.</p>
            <p>3.4 You are responsible for all activity under your account.</p>
            <p>3.5 You must comply with all applicable Moroccan laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">4. Dual-Stream Marketplace</h2>
            <p>4.1 Dreamer Stream: For early-stage concepts, roadmaps, and milestones. Dreamers must complete structured onboarding including roadmap wizard, milestone planning, market validation, and risk analysis.</p>
            <p>4.2 Reality Stream: For operational businesses with revenue. Businesses must provide timestamped updates, video proof, and operational metrics.</p>
            <p>4.3 ScaleTrek reserves the right to verify any information submitted and to remove content that does not meet verification standards.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">5. No Financial Intermediation</h2>
            <p>ScaleTrek is a matching and discovery platform only. We do not: (a) handle or escrow funds, (b) execute trades or investments, (c) provide financial advice, (d) broker deals, or (e) take commissions. All investment decisions, due diligence, legal contracts, and capital transfers occur entirely off-platform between the parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">6. User Content & IP</h2>
            <p>6.1 You retain all rights to content you submit.</p>
            <p>6.2 You grant ScaleTrek a license to display and distribute your content on the Platform.</p>
            <p>6.3 You represent that your content does not infringe any third-party rights.</p>
            <p>6.4 ScaleTrek may remove content that violates these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">7. Verification & Scoring</h2>
            <p>7.1 The Momentum Score and Reality Score are algorithmic trust indicators based on platform activity. They do not constitute financial ratings or guarantees.</p>
            <p>7.2 Scores may decay with inactivity.</p>
            <p>7.3 Verification badges indicate document review only, not endorsement.</p>
            <p>7.4 ScaleTrek may adjust scores or verification status at its discretion.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">8. Prohibited Conduct</h2>
            <p>You may not: (a) submit false or misleading information, (b) impersonate any person or entity, (c) manipulate scores or metrics, (d) harvest data without authorization, (e) engage in fraudulent activity, (f) violate any applicable law, (g) interfere with Platform operations, (h) attempt to bypass security measures.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">9. Dispute Resolution</h2>
            <p>9.1 Platform-level disputes are reviewed by ScaleTrek administration.</p>
            <p>9.2 Commercial disputes between users must be resolved offline.</p>
            <p>9.3 ScaleTrek may freeze or remove content under dispute.</p>
            <p>9.4 Fraudulent activity reports trigger automatic review and potential account suspension.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">10. Limitation of Liability</h2>
            <p>ScaleTrek provides the Platform &ldquo;as is&rdquo; without warranties. In no event shall ScaleTrek be liable for any indirect, incidental, or consequential damages arising from Platform use, including but not limited to investment losses, lost opportunities, or data loss. Total liability is limited to the amount paid by you in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">11. Termination</h2>
            <p>11.1 ScaleTrek may suspend or terminate accounts for violations of these terms.</p>
            <p>11.2 Shadow bans may be applied for covert moderation.</p>
            <p>11.3 Users may delete their accounts at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">12. Governing Law</h2>
            <p>These terms are governed by Moroccan law. Disputes shall be resolved in the courts of Casablanca, Morocco.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">13. Changes to Terms</h2>
            <p>ScaleTrek may update these terms with 30 days notice. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-midnight dark:text-white">14. Contact</h2>
            <p>For questions: support@scaletrek.app — ScaleTrek Ltd, Casablanca, Morocco.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-border flex gap-4">
          <Link href={`/${lang}/privacy`} className="text-sm text-violet hover:text-violet-light transition-colors">{t("legal.privacy")}</Link>
          <Link href={`/${lang}`} className="text-sm text-slate-muted hover:text-midnight dark:hover:text-white transition-colors">{t("nav.home")}</Link>
        </div>
      </main>
    </div>
  );
}
