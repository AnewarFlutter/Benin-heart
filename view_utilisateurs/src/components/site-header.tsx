import { IconSearch } from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { HeaderUserMenu } from "@/components/header-user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsDrawer } from "@/components/notifications-drawer"
import { Input } from "@/components/ui/input"

export function SiteHeader() {
  const user = {
    name: "satnaing",
    email: "satnaingdev@gmail.com",
    avatar: "/avatars/satnaing.jpg",
    initials: "SN",
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="relative flex-1 max-w-xs">
          <IconSearch className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search"
            className="h-9 pl-8 pr-12"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <NotificationsDrawer />
          <ThemeToggle />
          <div className="rounded-md bg-accent">
            <HeaderUserMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
