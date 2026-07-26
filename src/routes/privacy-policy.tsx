import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Share2, RefreshCw, Mail, ChevronRight } from "lucide-react";
import { MobilePrivacyPolicyPage } from "@/components/mobile/MobilePublicPages";
import { ResponsivePage } from "@/components/responsive/ResponsivePage";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

const sections = [
  {
    icon: Shield,
    title: "Data Collection and Usage",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    content:
      "We collect personal information such as anonymous identifiers and voluntary submissions through forms. This information is used solely to facilitate peer support sessions, respond to session inquiries, and improve platform functionality. We never collect real names — all student identities on SoulSync are anonymous by design.",
  },
  {
    icon: Share2,
    title: "Data Sharing",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    content:
      "SoulSync does not sell, rent, or share your personal data with third parties without your explicit consent, except when required by law or for fulfilling the specific purposes of our mental wellness mission (e.g., aggregate anonymized reporting to our program sponsors). Volunteer summaries are only shared with student consent via the privacy toggle in the Schedule Enhancer.",
  },
  {
    icon: Eye,
    title: "Cookies and Analytics",
    color: "text-amber-500",
    bg: "bg-amber-50",
    content:
      "Our platform may use cookies and analytics tools to understand anonymous usage patterns, improve functionality, and enhance the user experience. By using SoulSync, you agree to the collection of anonymized behavioral data for these improvement purposes. No personally identifiable data is linked to analytics.",
  },
  {
    icon: Lock,
    title: "Data Security",
    color: "text-rose-500",
    bg: "bg-rose-50",
    content:
      "We implement industry-standard security measures including encrypted connections (HTTPS/TLS), row-level security policies in our database, and anonymous alias-based identity systems to protect your data against unauthorized access, disclosure, or misuse. However, no method of transmission over the internet or electronic storage is completely secure.",
  },
  {
    icon: Eye,
    title: "Transparency and Consent",
    color: "text-blue-500",
    bg: "bg-blue-50",
    content:
      "We are committed to full transparency regarding how we use your data. Students control what behavioral data is shared with their chosen volunteer through a dedicated privacy sync toggle. By interacting with our platform, you consent to our privacy practices. You can opt out of data sharing or request data deletion at any time by contacting us.",
  },
  {
    icon: RefreshCw,
    title: "Policy Updates",
    color: "text-purple-500",
    bg: "bg-purple-50",
    content:
      "This privacy policy may be updated periodically to reflect changes in regulations or our practices. The updated policy will be posted on this page with the revision date. We encourage you to review this page regularly to stay informed about how we protect your information.",
  },
];

function PrivacyPolicyPage() {
  return (
    <ResponsivePage
      DesktopComponent={DesktopPrivacyPolicyPage}
      MobileComponent={MobilePrivacyPolicyPage}
    />
  );
}

function DesktopPrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-emerald-50/40 pointer-events-none" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
              <Shield className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">Privacy First</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 leading-tight mb-6">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
              At SoulSync, your privacy and anonymity are foundational — not afterthoughts. Here is exactly what we collect, how we use it, and how you stay in control.
            </p>
            <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Last updated: June 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Policy Sections */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-4xl space-y-6">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-5">
                <div className={`h-12 w-12 shrink-0 rounded-2xl ${section.bg} flex items-center justify-center`}>
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 mb-3">{section.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Contact Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: sections.length * 0.08 }}
            className="p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg mb-1">Contact Us</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    For questions about our privacy policy or to exercise your rights — including data deletion — please reach out to us directly.
                  </p>
                  <a
                    href="mailto:Soulsyncsoul@gmail.com"
                    className="inline-flex items-center gap-2 mt-3 text-indigo-400 font-black text-sm hover:text-indigo-300 transition-colors"
                  >
                    Soulsyncsoul@gmail.com
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
