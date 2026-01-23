"use client"

import * as React from "react"
import { IconBell, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const notifications = [
  {
    id: 1,
    title: "Nouveau message",
    description: "Vous avez reçu un nouveau message de Marie",
    time: "Il y a 5 minutes",
    read: false,
  },
  {
    id: 2,
    title: "Match confirmé",
    description: "Vous avez un nouveau match avec Sophie",
    time: "Il y a 1 heure",
    read: false,
  },
  {
    id: 3,
    title: "Profil visité",
    description: "Quelqu'un a visité votre profil",
    time: "Il y a 2 heures",
    read: false,
  },
  {
    id: 4,
    title: "Nouveau like",
    description: "Quelqu'un a aimé votre photo",
    time: "Il y a 3 heures",
    read: false,
  },
  {
    id: 5,
    title: "Message envoyé",
    description: "Votre message a été envoyé avec succès",
    time: "Il y a 5 heures",
    read: true,
  },
]

export function NotificationsDrawer() {
  const [open, setOpen] = React.useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <IconBell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <IconBell className="size-5" />
            Notifications
          </SheetTitle>
          <SheetDescription>
            Vous avez {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue{unreadCount > 1 ? "s" : ""}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="mt-6 h-[calc(100vh-120px)]">
          <div className="flex flex-col gap-2">
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <div
                  className={`rounded-lg p-4 transition-colors hover:bg-accent ${
                    !notification.read ? "bg-accent/50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">
                        {notification.title}
                      </h4>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {notification.description}
                      </p>
                      <p className="text-muted-foreground mt-2 text-xs">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>
                {index < notifications.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
        <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
          <Button variant="outline" className="w-full">
            Marquer toutes comme lues
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
