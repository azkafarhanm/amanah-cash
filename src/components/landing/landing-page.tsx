import { PageContainer } from "@/components/ui";

import { HeroSection } from "./hero-section";
import { LandingFooter } from "./landing-footer";
import { SkipLink } from "./skip-link";

export function LandingPage() {
  return (
    <>
      <SkipLink />
      <header>
        <PageContainer />
      </header>
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
      </main>
      <LandingFooter />
    </>
  );
}
