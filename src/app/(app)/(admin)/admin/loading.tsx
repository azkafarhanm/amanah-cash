import { ContentWrapper } from "@/components/ui";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-cards";

export default function Loading() {
  return <ContentWrapper><DashboardSkeleton /></ContentWrapper>;
}
