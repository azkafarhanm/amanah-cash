import { ContentWrapper } from "@/components/ui";
import { ReportSkeleton } from "@/components/reports/report-components";

export default function ReportsLoading() {
  return <ContentWrapper className="routeTransitionSkeleton"><ReportSkeleton /></ContentWrapper>;
}
