import { ContentWrapper, LoadingSkeleton } from "@/components/ui";

export default function FinancialAssuranceLoading() {
  return (
    <ContentWrapper aria-busy="true">
      <LoadingSkeleton variant="table" lines={7} />
    </ContentWrapper>
  );
}
