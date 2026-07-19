import { HeroSection } from "./hero-section";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { SkipLink } from "./skip-link";

export function LandingPage() {
  return (
    <>
      <SkipLink />
      <LandingHeader />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
      </main>
      <LandingFooter />
    </>
  );
}
