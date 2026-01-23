import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { StatsCards } from "@/components/stats-cards"
import { BreadcrumbDemo } from "../_components/breadcrumb"

export default function Page() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <BreadcrumbDemo />
      </div>
      <StatsCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </div>
  )
}
