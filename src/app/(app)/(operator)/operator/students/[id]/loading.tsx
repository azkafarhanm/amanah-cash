import { ContentWrapper, LoadingSkeleton } from "@/components/ui";

export default function Loading() {
  return <ContentWrapper aria-busy="true"><LoadingSkeleton variant="cards" lines={6} /><LoadingSkeleton variant="table" lines={5} /></ContentWrapper>;
}
