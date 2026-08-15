import { FAQSection } from "./faq-section";
import { FinalCTASection } from "./final-cta-section";
import { FeaturesSection, FeaturesContinuationSection } from "./features-section";
import { HeroSection } from "./hero-section";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { ProblemsSection, ProblemsContinuationSection } from "./problems-section";
import { SecurityTrustSection, SecurityContinuationSection } from "./security-trust-section";
import { SkipLink } from "./skip-link";
import { SolutionSection, SolutionContinuationSection } from "./solution-section";
import { WorkflowSection, WorkflowContinuationSection } from "./workflow-section";

export function LandingPage() {
  return (
    <>
      <SkipLink />
      <LandingHeader />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <ProblemsSection />
        <ProblemsContinuationSection />
        <SolutionSection />
        <SolutionContinuationSection />
        <WorkflowSection />
        <WorkflowContinuationSection />
        <FeaturesSection />
        <FeaturesContinuationSection />
        <SecurityTrustSection />
        <SecurityContinuationSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </>
  );
}

