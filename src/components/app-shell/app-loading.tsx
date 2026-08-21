import { ContentWrapper, LoadingSkeleton } from "@/components/ui";

export function AppLoading() {
  return (
    <ContentWrapper aria-busy="true" className="routeTransitionSkeleton">
      <LoadingSkeleton lines={2} />
      <LoadingSkeleton lines={5} />
    </ContentWrapper>
  );
}
