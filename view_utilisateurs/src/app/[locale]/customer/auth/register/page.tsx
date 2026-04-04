"use client"

import { MultiStepSignupForm } from "@/components/multi-step-signup-form"
import { APP_IMAGES } from "@/shared/constants/images"
import { APP_ROUTES } from "@/shared/constants/routes"
import { APP_TEXTE } from "@/shared/constants/texte"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/shared/hooks/useAuth"
import { useAuthStore } from "@/stores/auth_store"

const GENDER_MAP: Record<string, 'HOMME' | 'FEMME' | 'AUTRE'> = {
  male: 'HOMME',
  female: 'FEMME',
  other: 'AUTRE',
}

export default function SignupPage() {
  const router = useRouter()
  const { register } = useAuth()
  const setPendingRegisterProfile = useAuthStore((s) => s.setPendingRegisterProfile)

  const handleSubmit = async (data: any) => {
    console.log('[RegisterPage] handleSubmit() — données step 1:', {
      email: data.email,
      first_name: data.firstname,
      last_name: data.lastname,
      phone: data.telephone,
    })
    console.log('[RegisterPage] handleSubmit() — données profil (steps 2+):', {
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      nationality: data.nationality,
      current_country: data.current_country,
    })

    const success = await register({
      email: data.email,
      password: data.password,
      password_confirm: data.confirmPassword,
      first_name: data.firstname,
      last_name: data.lastname,
      phone: data.telephone,
    })
    console.log('[RegisterPage] register() ← success:', success)

    if (success) {
      const pendingData = {
        prenom: data.firstname,
        dateNaissance: data.date_of_birth || undefined,
        genre: data.gender ? GENDER_MAP[data.gender] : undefined,
        pays: data.current_country || undefined,
      }
      console.log('[RegisterPage] pendingRegisterProfile stocké:', pendingData)
      setPendingRegisterProfile(pendingData)
      router.push(APP_ROUTES.auth.otp)
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href={APP_ROUTES.home.root} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src={APP_IMAGES.logo.main}
              alt="Logo"
              width={80}
              height={80}
              className="object-contain"
            />
            <span className="font-bold text-xl text-foreground">{APP_TEXTE.logoText}</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-2xl px-4">
            <MultiStepSignupForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={APP_IMAGES.auth.registerBackground}
          alt="Register background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
