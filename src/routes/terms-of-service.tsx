import { createFileRoute } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  FileText,
  Shield,
  UserCheck,
  AlertTriangle,
  Lock,
  RefreshCw,
  Scale,
  Ban,
  Mail,
  ChevronRight,
  Heart,
  Globe,
} from "lucide-react";

export const Route = createFileRoute("/terms-of-service")({
  component: TermsOfServicePage,
});

const EFFECTIVE_DATE = "August 6, 2026";
const CONTACT_EMAIL = "Soulsyncsoul@gmail.com";

const sections = [
  {
    id: "acceptance",
    icon: FileText,
    title: "1. Acceptance of Terms",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-100 dark:border-indigo-900/50",
    content: [
      `By accessing or using SoulSync ("the Platform", "we", "us", or "our"), you ("User", "you") agree to be bound by these Terms of Service ("Terms") and our Privacy Policy, which is incorporated herein by reference. If you do not agree to these Terms, you must not access or use the Platform.`,
      `SoulSync is operated by Code Catalysts, a student-led mental wellness initiative. These Terms govern your access to and use of the Platform, including any content, functionality, and services offered on or through soulsyncc.codecatalyst.workers.dev and any related mobile applications.`,
    ],
  },
  {
    id: "description",
    icon: Heart,
    title: "2. Description of Services",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-100 dark:border-rose-900/50",
    content: [
      `SoulSync provides a peer-support and AI-assisted emotional wellness platform designed exclusively for students. Our services include: anonymous AI-guided emotional support conversations, mood tracking and journaling tools, Focus Session management with productivity features, peer-to-volunteer support matching, resilience and breathing tools, and access to verified crisis helplines.`,
      `SoulSync is NOT a licensed medical provider, therapist, or clinical mental health service. The Platform is intended to serve as a first-point emotional support resource only. If you are experiencing a mental health emergency, please contact a qualified medical professional or a crisis helpline immediately.`,
    ],
  },
  {
    id: "eligibility",
    icon: UserCheck,
    title: "3. Eligibility and User Responsibilities",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-100 dark:border-emerald-900/50",
    content: [
      `You must be at least 13 years of age to use SoulSync. By using the Platform, you represent and warrant that you meet this minimum age requirement. Users under the age of 18 are encouraged to use the Platform with the awareness and, where appropriate, guidance of a parent or guardian.`,
      `You agree to: (a) provide accurate information when required; (b) use the Platform only for lawful, personal, non-commercial purposes; (c) not attempt to harm, harass, or abuse other users or volunteers; (d) not attempt to reverse-engineer, scrape, or extract Platform data; (e) not use the Platform in a manner that disrupts its operation or security. Violation of any of these responsibilities may result in immediate suspension or termination of your access.`,
    ],
  },
  {
    id: "ai",
    icon: Shield,
    title: "4. AI Services and Limitations",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-100 dark:border-purple-900/50",
    content: [
      `SoulSync uses third-party large language model (LLM) APIs to power our AI Companion and Schedule Architect features. The AI operates strictly in a supportive, non-clinical capacity and is programmed to avoid diagnosing, prescribing, or providing clinical therapeutic advice.`,
      `AI outputs are generated responses and may occasionally be inaccurate, incomplete, or not applicable to your specific situation ("hallucination"). You must not make critical health or safety decisions based solely on AI-generated content. SoulSync implements safeguards including temperature calibration, content filtering, and crisis-detection regex to minimize risks, but cannot guarantee the accuracy of every AI response. You use AI features at your own discretion.`,
    ],
  },
  {
    id: "camera",
    icon: Lock,
    title: "5. Camera and Biometric Data",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-100 dark:border-cyan-900/50",
    content: [
      `The "Body Doubling" feature within Focus Sessions requests access to your device camera to display a local, real-time video feed. This camera feed is processed entirely on your device. No video data, images, or biometric identifiers are transmitted to, stored by, or processed on any SoulSync server or third-party service.`,
      `You grant this camera permission voluntarily through your browser's native permission prompt. You may revoke camera permissions at any time through your browser settings. Doing so will disable the Body Doubling feature but will not affect any other Platform functionality. By enabling this feature, you acknowledge and accept that the camera operates solely as a local accountability tool.`,
    ],
  },
  {
    id: "volunteer",
    icon: UserCheck,
    title: "6. Volunteer Services",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-100 dark:border-amber-900/50",
    content: [
      `SoulSync's peer-volunteer network consists of trained student volunteers who provide non-clinical emotional support. Volunteers are not licensed mental health professionals. Sessions with volunteers are supplementary support interactions, not therapy or clinical consultations.`,
      `Volunteers are bound by a separate Code of Conduct and confidentiality agreement. You acknowledge that all volunteer sessions are conducted on a best-effort basis. SoulSync reserves the right to suspend, re-assign, or remove any volunteer at any time. Users can opt out of volunteer data sharing at any time via the privacy sync toggle in the Schedule Architect module.`,
    ],
  },
  {
    id: "prohibited",
    icon: Ban,
    title: "7. Prohibited Conduct",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-100 dark:border-rose-900/50",
    content: [
      `The following conduct is strictly prohibited on SoulSync: (a) attempting to manipulate the AI Companion through adversarial prompt injection or jailbreaking; (b) sharing false, misleading, or harmful information to other users or volunteers; (c) using the Platform to harass, stalk, or threaten any individual; (d) attempting unauthorized access to admin dashboards, volunteer interfaces, or other users' data; (e) using the Platform for any commercial, political, or non-personal purpose; (f) uploading or transmitting malware, viruses, or harmful code of any kind.`,
      `SoulSync employs automated and manual moderation systems, including crisis detection and admin governance dashboards, to identify and respond to violations. Users who engage in prohibited conduct will face immediate access suspension and, where applicable, will be reported to the relevant authorities.`,
    ],
  },
  {
    id: "ip",
    icon: Globe,
    title: "8. Intellectual Property",
    color: "text-slate-600",
    bg: "bg-slate-50 dark:bg-slate-900/50",
    border: "border-slate-100 dark:border-slate-800",
    content: [
      `The Platform, including its source code, design system, branding, copy, and all associated intellectual property, is owned by Code Catalysts and is protected under applicable copyright, trademark, and intellectual property laws. You may not reproduce, distribute, modify, or create derivative works of any Platform content without prior written permission.`,
      `User-generated content (e.g., journal reflections, chat messages) remains your property. By submitting content to the Platform, you grant SoulSync a limited, non-exclusive, royalty-free license to use anonymized, aggregated versions of that content solely to improve Platform features. All personally identifiable user content is handled in accordance with our Privacy Policy.`,
    ],
  },
  {
    id: "disclaimer",
    icon: AlertTriangle,
    title: "9. Disclaimers and Limitation of Liability",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-100 dark:border-orange-900/50",
    content: [
      `THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. SOULSYNC DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.`,
      `TO THE MAXIMUM EXTENT PERMITTED BY LAW, SOULSYNC AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, MENTAL DISTRESS, OR RELIANCE ON AI-GENERATED CONTENT. YOUR SOLE REMEDY FOR DISSATISFACTION WITH THE PLATFORM IS TO STOP USING IT.`,
    ],
  },
  {
    id: "governing",
    icon: Scale,
    title: "10. Governing Law and Dispute Resolution",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-100 dark:border-blue-900/50",
    content: [
      `These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any disputes arising from or relating to these Terms or your use of the Platform shall first be attempted to be resolved through informal negotiation by contacting us at ${CONTACT_EMAIL}.`,
      `If informal resolution fails within 30 days, disputes shall be resolved through binding arbitration under the Arbitration and Conciliation Act, 1996 of India. The seat of arbitration shall be Lucknow, Uttar Pradesh, India. Judgment on the arbitral award may be entered in any court having competent jurisdiction.`,
    ],
  },
  {
    id: "updates",
    icon: RefreshCw,
    title: "11. Amendments to These Terms",
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    border: "border-teal-100 dark:border-teal-900/50",
    content: [
      `SoulSync reserves the right to update, modify, or replace these Terms at any time. We will provide reasonable notice of material changes by posting the updated Terms on this page with a revised effective date. Your continued use of the Platform after the effective date of the revised Terms constitutes your acceptance of the changes.`,
      `We encourage you to review these Terms periodically. If you do not agree to the updated Terms, you must discontinue use of the Platform immediately.`,
    ],
  },
];

function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 pointer-events-none" />
        {/* Decorative orb */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-indigo-100/40 via-transparent to-transparent dark:from-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-8">
              <Scale className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Legal</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-slate-50 leading-tight mb-6">
              Terms of{" "}
              <span className="text-primary">Service</span>
            </h1>

            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Please read these terms carefully before using SoulSync. They define your rights, our responsibilities, and the boundaries of our supportive relationship.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Effective: {EFFECTIVE_DATE}
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Governing Law: India
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Version 1.0
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 col-span-full">Table of Contents</p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary font-semibold transition-colors group py-1"
              >
                <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-primary transition-colors" />
                {s.title}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sections */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-4xl space-y-6">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className={`p-8 rounded-3xl bg-white dark:bg-slate-950 border ${section.border} shadow-sm dark:shadow-none hover:shadow-md transition-shadow scroll-mt-24`}
            >
              <div className="flex items-start gap-5">
                <div className={`h-12 w-12 shrink-0 rounded-2xl ${section.bg} flex items-center justify-center border ${section.border}`}>
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-50 mb-4">{section.title}</h2>
                  <div className="space-y-3">
                    {section.content.map((para, i) => (
                      <p key={i} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Critical Warning Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: sections.length * 0.05 }}
            className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-amber-900 dark:text-amber-300 text-lg mb-2">Not a Substitute for Professional Help</h3>
                <p className="text-sm text-amber-800 dark:text-amber-400 leading-relaxed">
                  SoulSync is a peer-support and wellness tool, not a medical service. If you or someone you know is in immediate danger or experiencing a mental health crisis, please call iCall (9152987821) or Vandrevala Foundation (1860-2662-345) immediately. These are available 24/7 across India.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: (sections.length + 1) * 0.05 }}
            className="p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                  <Mail className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg mb-1">Questions About These Terms?</h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                    If you have any questions, concerns, or requests related to these Terms of Service, reach out to the SoulSync team directly. We respond within 3 business days.
                  </p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="inline-flex items-center gap-2 mt-4 text-indigo-400 font-black text-sm hover:text-indigo-300 transition-colors"
                  >
                    {CONTACT_EMAIL}
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
