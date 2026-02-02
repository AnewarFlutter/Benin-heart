"use client"

import {
  IconLogout,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { APP_ROUTES } from "@/shared/constants/routes"

export function HeaderUserMenu({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    initials: string
  }
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-2 px-2">
          {user.initials}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex flex-col gap-0.5 px-3 py-2 text-left">
            <span className="font-semibold">{user.name}</span>
            <span className="text-muted-foreground text-xs">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={APP_ROUTES.customer.settings + "?section=profile"}>
              <IconUserCircle className="mr-2 size-4" />
              Profil
              <span className="text-muted-foreground ml-auto text-xs">⌘⇧P</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={APP_ROUTES.customer.settings}>
              <IconSettings className="mr-2 size-4" />
              Paramètres
              <span className="text-muted-foreground ml-auto text-xs">⌘S</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600">
          <IconLogout className="mr-2 size-4" />
          Se déconnecter
          <span className="text-muted-foreground ml-auto text-xs">⌘⇧Q</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
