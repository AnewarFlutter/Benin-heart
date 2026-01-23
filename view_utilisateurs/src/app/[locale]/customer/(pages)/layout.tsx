import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Toaster } from "sonner"
import { CustomerMenuDock } from "./_components/menu-dock"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="overflow-x-hidden"
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="overflow-x-hidden overflow-y-auto pb-20 md:pb-0">
        <SiteHeader />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="@container/main flex flex-1 flex-col gap-2 overflow-hidden relative">
            {children}
          </div>
        </div>
      </SidebarInset>
      <CustomerMenuDock />
      <Toaster />
    </SidebarProvider>
  )
}
