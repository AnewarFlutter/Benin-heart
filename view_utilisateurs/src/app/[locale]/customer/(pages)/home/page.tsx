import { StatsCards } from "@/components/stats-cards"
import { ChartVisitors } from "@/components/chart-visitors"
import { BreadcrumbDemo } from "../_components/breadcrumb"
import { getMesStatsAction } from "@/actions/beninheart/like/actions"

export default async function Page() {
  const statsRes = await getMesStatsAction();
  const stats = statsRes.success ? statsRes.data : null;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <BreadcrumbDemo />
      </div>
      <StatsCards stats={stats} />
      <div className="px-4 lg:px-6">
        <ChartVisitors />
      </div>
    </div>
  )
}
