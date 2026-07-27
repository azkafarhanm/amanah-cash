import { ContentWrapper, LoadingSkeleton } from "@/components/ui";

export default function StudentReconciliationLoading() {
  return (
    <ContentWrapper aria-busy="true">
      <LoadingSkeleton variant="cards" lines={6} />
    </ContentWrapper>
  );
}
