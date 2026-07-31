import { FAQSection } from "./faq-section";
import { FinalCTASection } from "./final-cta-section";
import { FeaturesSection } from "./features-section";
import { HeroSection } from "./hero-section";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { ProblemsSection } from "./problems-section";
import { SecurityTrustSection } from "./security-trust-section";
import { SkipLink } from "./skip-link";
import { SolutionSection } from "./solution-section";
import { WorkflowSection } from "./workflow-section";

export function LandingPage() {
  return (
    <>
      <SkipLink />
      <LandingHeader />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <ProblemsSection />
        <SolutionSection />
        <WorkflowSection />
        <FeaturesSection />
        <SecurityTrustSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </>
  );
}
