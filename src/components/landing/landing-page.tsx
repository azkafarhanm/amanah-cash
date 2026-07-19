import { PageContainer } from "@/components/ui";

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
        <PageContainer />
      </main>
      <LandingFooter />
    </>
  );
}
