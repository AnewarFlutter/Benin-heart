"use client"

import { IconHeart, IconSparkles, IconEye } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

const likesData = [
  { value: 890 },
  { value: 920 },
  { value: 950 },
  { value: 980 },
  { value: 1020 },
  { value: 1100 },
  { value: 1234 },
]

const favoritesData = [
  { value: 450 },
  { value: 470 },
  { value: 490 },
  { value: 510 },
  { value: 530 },
  { value: 550 },
  { value: 567 },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 lg:px-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" asChild>
            <Link href="/customer/likes">
              <IconEye className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Voir</span>
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">1,234</div>
            <IconHeart className="h-12 w-12 text-pink-500 opacity-20" />
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            +20% par rapport au mois dernier
          </p>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={likesData}>
              <defs>
                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(236, 72, 153)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(236, 72, 153)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="rgb(236, 72, 153)"
                strokeWidth={2}
                fill="url(#colorLikes)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Coup de Coeur</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" asChild>
            <Link href="/customer/favorites">
              <IconEye className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Voir</span>
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">567</div>
            <IconSparkles className="h-12 w-12 text-yellow-500 opacity-20" />
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            +12% par rapport au mois dernier
          </p>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={favoritesData}>
              <defs>
                <linearGradient id="colorFavorites" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(234, 179, 8)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(234, 179, 8)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="rgb(234, 179, 8)"
                strokeWidth={2}
                fill="url(#colorFavorites)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
