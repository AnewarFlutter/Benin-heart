import { OTPForm } from "@/components/otp-form"
import { otpConfig } from "./_components/otp.config"
import { APP_IMAGES } from "@/shared/constants/images"
import { APP_ROUTES } from "@/shared/constants/routes"
import { APP_TEXTE } from "@/shared/constants/texte"
import Link from "next/link"
import Image from "next/image"

export default function OTPPage() {
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
          <div className="w-full max-w-sm">
            <OTPForm config={otpConfig} />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={APP_IMAGES.auth.otpBackground}
          alt="OTP background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
