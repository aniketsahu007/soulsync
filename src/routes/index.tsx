import { createFileRoute } from "@tanstack/react-router";

import { MobileHomePage } from "@/components/mobile/MobilePublicPages";
import { ResponsivePage } from "@/components/responsive/ResponsivePage";
import { ComparisonSection } from "@/components/ComparisonSection";
import { CTASection } from "@/components/CTASection";
import { EmotionalBackdrop } from "@/components/EmotionalBackdrop";
import { FeaturesSection } from "@/components/FeaturesSection";
import { NGOImpactSection } from "@/components/NGOImpactSection";
import { SafetyGovernance } from "@/components/SafetyGovernance";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ImpactDashboard } from "@/components/ImpactDashboard";
import { Navbar } from "@/components/Navbar";
import { WorkflowSection } from "@/components/WorkflowSection";
import { EngagementHub } from "@/components/EngagementHub";
import { PWAShowcaseSection } from "@/components/PWAShowcaseSection";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <ResponsivePage
      DesktopComponent={DesktopLandingPage}
      MobileComponent={MobileHomePage}
    />
  );
}

function DesktopLandingPage() {
  return (
    <div className="relative isolate min-h-screen bg-background overflow-x-hidden">
      <EmotionalBackdrop />
      <div className="relative z-10 bg-background/20 backdrop-blur-[2px]">
        <Navbar />
        <HeroSection />
        <div className="relative z-20">
          <WorkflowSection />
          <EngagementHub />
          <FeaturesSection />
          <SafetyGovernance />
          <PWAShowcaseSection />
        </div>
        <div className="relative z-10">
          <ImpactDashboard />
          <ComparisonSection />
          <NGOImpactSection />
          <CTASection />
          <Footer />
        </div>
      </div>
    </div>
  );
}
