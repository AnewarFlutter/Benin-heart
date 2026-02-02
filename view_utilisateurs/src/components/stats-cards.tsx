"use client"

import { TrendingUp } from "lucide-react"
import { IconEye } from "@tabler/icons-react"
import { PolarGrid, RadialBar, RadialBarChart } from "recharts"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// === LIKES ===
const likesData = [
  { category: "matchs", value: 104, fill: "var(--color-matchs)" },
  { category: "sent", value: 310, fill: "var(--color-sent)" },
  { category: "received", value: 820, fill: "var(--color-received)" },
]

const likesConfig = {
  value: {
    label: "Total",
  },
  received: {
    label: "Reçus",
    color: "rgb(236, 72, 153)",
  },
  sent: {
    label: "Envoyés",
    color: "rgb(251, 191, 36)",
  },
  matchs: {
    label: "Matchs",
    color: "rgb(34, 197, 94)",
  },
} satisfies ChartConfig

// === COUP DE COEUR ===
const favoritesData = [
  { category: "matchs", value: 42, fill: "var(--color-matchs)" },
  { category: "sent", value: 145, fill: "var(--color-sent)" },
  { category: "received", value: 380, fill: "var(--color-received)" },
]

const favoritesConfig = {
  value: {
    label: "Total",
  },
  received: {
    label: "Reçus",
    color: "rgb(99, 102, 241)",
  },
  sent: {
    label: "Envoyés",
    color: "rgb(245, 158, 11)",
  },
  matchs: {
    label: "Matchs",
    color: "rgb(16, 185, 129)",
  },
} satisfies ChartConfig

export function StatsCards() {
  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 lg:px-6">
      {/* Likes */}
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div>
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <CardDescription>Répartition globale</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" asChild>
            <Link href="/customer/likes">
              <IconEye className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Voir</span>
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={likesConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadialBarChart data={likesData} innerRadius={30} outerRadius={100}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="category" />}
              />
              <PolarGrid gridType="circle" />
              <RadialBar dataKey="value" />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-3 text-sm">
          <div className="flex flex-wrap justify-center gap-4">
            {likesData.map((item) => (
              <div key={item.category} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: likesConfig[item.category as keyof typeof likesConfig]?.color }}
                />
                <span className="text-muted-foreground text-xs">
                  {likesConfig[item.category as keyof typeof likesConfig]?.label}
                </span>
                <span className="text-xs font-medium">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 leading-none font-medium">
            En hausse de 20% ce mois <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Total des likes sur les 6 derniers mois
          </div>
        </CardFooter>
      </Card>

      {/* Coup de Coeur */}
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div>
            <CardTitle className="text-sm font-medium">Coup de Coeur</CardTitle>
            <CardDescription>Répartition globale</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" asChild>
            <Link href="/customer/likes">
              <IconEye className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Voir</span>
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={favoritesConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadialBarChart data={favoritesData} innerRadius={30} outerRadius={100}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="category" />}
              />
              <PolarGrid gridType="circle" />
              <RadialBar dataKey="value" />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-3 text-sm">
          <div className="flex flex-wrap justify-center gap-4">
            {favoritesData.map((item) => (
              <div key={item.category} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: favoritesConfig[item.category as keyof typeof favoritesConfig]?.color }}
                />
                <span className="text-muted-foreground text-xs">
                  {favoritesConfig[item.category as keyof typeof favoritesConfig]?.label}
                </span>
                <span className="text-xs font-medium">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 leading-none font-medium">
            En hausse de 12% ce mois <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Total des coup de coeur sur les 6 derniers mois
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
