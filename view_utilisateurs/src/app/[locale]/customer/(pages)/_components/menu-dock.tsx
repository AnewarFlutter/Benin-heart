'use client';
import { MenuDock, MenuDockItem } from '@/components/ui/shadcn-io/menu-dock';
import { IconDashboard, IconListDetails, IconHelp } from "@tabler/icons-react";
import { ThumbsUp, LucideMessageCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/shared/constants/routes';

export function CustomerMenuDock() {
  const router = useRouter();

  const menuItems: MenuDockItem[] = [
    {
      label: 'Dashboard',
      icon: IconDashboard as any,
      onClick: () => router.push(APP_ROUTES.customer.root),
    },
    {
      label: 'Rencontres',
      icon: IconListDetails as any,
      onClick: () => router.push(APP_ROUTES.customer.tomeetsomeone),
    },
    {
      label: 'Likes',
      icon: ThumbsUp as any,
      onClick: () => router.push(APP_ROUTES.customer.likes),
    },
    {
      label: 'Messages',
      icon: LucideMessageCircle as any,
      onClick: () => router.push(APP_ROUTES.customer.coversations),
      hasNotification: true,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg">
        <div className="flex items-center justify-center px-2 py-3">
          <MenuDock items={menuItems} variant="compact" showLabels={true} />
        </div>
      </div>
    </div>
  );
}