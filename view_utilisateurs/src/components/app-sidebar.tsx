"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { LucideMessageCircle, ThumbsUp } from "lucide-react"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { APP_TEXTE } from "@/shared/constants/texte"
import { APP_ROUTES } from "@/shared/constants/routes"

const data = {
  user: {
    name: "satnaing",
    email: "satnaingdev@gmail.com",
    avatar: "/avatars/satnaing.jpg",
  },
  navMain: [
    {
      title: "Tableau de bord",
      url: APP_ROUTES.customer.root,
      icon: IconDashboard,
      isActive: true,
    },
    {
      title: "Faire des rencontres",
      url: APP_ROUTES.customer.tomeetsomeone,
      icon: IconListDetails,
      isActive: false,
    },

    {
      title: "Likes reçus",
      url: APP_ROUTES.customer.likes,
      icon: ThumbsUp,
      isActive: false,
    },
    {
      title: "Messages",
      url: APP_ROUTES.customer.coversations,
      icon: LucideMessageCircle,
      isActive: false,
    },

  ],


  documents: [
    {
      name: "Abonnement ",
      url: APP_ROUTES.home.abonnements,
      icon: IconReport,
    },
    {
      name: "Aide",
      url: APP_ROUTES.home.faq,
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 text-gray-900 dark:text-white"
            >
              <a href={APP_ROUTES.customer.root}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{APP_TEXTE.logoText}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
