"use client"

import { LoginForm } from "@/components/login-form"
import { loginConfig } from "./_components/login.config"
import { APP_IMAGES } from "@/shared/constants/images"
import { APP_ROUTES } from "@/shared/constants/routes"
import { APP_TEXTE } from "@/shared/constants/texte"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async (data: any) => {
    // Simuler une connexion réussie
    // TODO: Ajouter la vraie logique d'authentification ici
    console.log("Données de connexion:", data)

    // Afficher un message de succès
    toast.success("Connexion réussie !", {
      position: "top-right",
      duration: 2000,
    })

    // Rediriger vers la page "Faire des rencontres"
    setTimeout(() => {
      router.push(APP_ROUTES.customer.tomeetsomeone)
    }, 500)
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href={APP_ROUTES.home.root} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src={APP_IMAGES.logo.main}
              alt="Logo"
              width={60}
              height={60}
              className="object-contain md:w-20 md:h-20"
            />
            <span className="font-bold text-lg md:text-xl text-foreground">{APP_TEXTE.logoText}</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-4">
          <div className="w-full max-w-md">
            <LoginForm config={loginConfig} onSubmit={handleLogin} />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={APP_IMAGES.auth.loginBackground}
          alt="Login background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
