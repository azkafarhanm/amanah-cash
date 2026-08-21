import { ContentWrapper, LoadingSkeleton } from "@/components/ui";
export default function Loading() { return <ContentWrapper aria-busy="true" className="routeTransitionSkeleton"><LoadingSkeleton variant="table" lines={7} /></ContentWrapper>; }
