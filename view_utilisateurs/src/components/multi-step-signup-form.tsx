"use client"

import { useState, useRef, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/loading-button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"
import { FormError } from "@/components/ui/form-error"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { FileText, ArrowLeft, ArrowRight, Check, UserPlus, User, MapPin, GraduationCap, ShieldCheck, Camera, Video, Upload, Trash2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { APP_ROUTES } from "@/shared/constants/routes"
import { ProfilePhotosUpload } from "@/components/profile-photos-upload"

const GoogleIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

// Schéma de validation pour toutes les étapes
const signupSchema = z.object({
  // Étape 1
  lastname: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  firstname: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Numéro de téléphone invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  // Étape 2
  nationality: z.string().min(1, "Veuillez sélectionner votre nationalité"),
  current_country: z.string().min(1, "Veuillez sélectionner votre pays actuel"),
  date_of_birth: z.string().min(1, "Date de naissance requise"),
  gender: z.enum(["male", "female", "other"], {
    message: "Veuillez sélectionner votre genre",
  }),
  // Étape 3
  education_level: z.string().min(1, "Niveau d'études requis"),
  education_certificate: z.any().optional(),
  profession: z.string().optional(),
  profession_certificate: z.any().optional(),
  // Étape 4 - Photos de profil
  profile_photo: z.any().refine((file) => file !== undefined && file !== null, {
    message: "La photo de profil est obligatoire",
  }),
  photo_2: z.any().optional(),
  photo_3: z.any().optional(),
  photo_4: z.any().optional(),
  // Étape 5 - Vidéo de présentation
  presentation_video: z.any().refine((file) => file !== undefined && file !== null, {
    message: "La vidéo de présentation est obligatoire",
  }),
  // Étape 6
  id_type: z.enum(["passport", "national_id", "driver_license"], {
    message: "Type de pièce d'identité requis",
  }),
  id_document: z.any().optional(),
  acceptPrivacyPolicy: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter la politique de confidentialité",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

const steps = [
  {
    id: 1,
    title: "Informations",
    description: "Vos informations de base",
    icon: User,
  },
  {
    id: 2,
    title: "Localisation",
    description: "Détails sur vous",
    icon: MapPin,
  },
  {
    id: 3,
    title: "Études",
    description: "Votre parcours",
    icon: GraduationCap,
  },
  {
    id: 4,
    title: "Photos",
    description: "Ajoutez vos photos",
    icon: Camera,
  },
  {
    id: 5,
    title: "Vidéo",
    description: "Présentez-vous",
    icon: Video,
  },
  {
    id: 6,
    title: "Identité",
    description: "Vérification d'identité",
    icon: ShieldCheck,
  },
]

const MAX_VIDEO_SIZE_MB = 50
const MAX_VIDEO_DURATION_SEC = 180 // 3 minutes

function VideoUploadStep({
  value,
  onChange,
  error,
}: {
  value: File | null | undefined
  onChange: (file: File | null) => void
  error?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const validateAndSetVideo = useCallback((file: File) => {
    setVideoError(null)

    // Vérifier le type
    if (!file.type.startsWith("video/")) {
      setVideoError("Le fichier doit être une vidéo (MP4, WebM, MOV)")
      return
    }

    // Vérifier la taille (50 MB max)
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_VIDEO_SIZE_MB) {
      setVideoError(`La vidéo est trop lourde (${sizeMB.toFixed(1)} MB). Maximum : ${MAX_VIDEO_SIZE_MB} MB`)
      return
    }

    // Vérifier la durée
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      if (video.duration > MAX_VIDEO_DURATION_SEC) {
        const mins = Math.floor(video.duration / 60)
        const secs = Math.floor(video.duration % 60)
        setVideoError(`La vidéo dure ${mins}m${secs}s. Maximum : 3 minutes`)
        return
      }
      // Tout est bon
      setPreviewUrl(URL.createObjectURL(file))
      onChange(file)
    }
    video.onerror = () => {
      URL.revokeObjectURL(video.src)
      setVideoError("Impossible de lire cette vidéo. Essayez un autre format.")
    }
    video.src = url
  }, [onChange])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSetVideo(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSetVideo(file)
  }

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setVideoError(null)
    onChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold mb-2">Vidéo de présentation</h3>
        <p className="text-sm text-muted-foreground">
          Enregistrez ou uploadez une courte vidéo où vous vous présentez.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Durée max : 3 minutes &bull; Taille max : {MAX_VIDEO_SIZE_MB} MB &bull; Formats : MP4, WebM, MOV
        </p>
      </div>

      {!previewUrl && !value ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
        >
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium">Cliquez ou glissez votre vidéo ici</p>
            <p className="text-xs text-muted-foreground mt-1">MP4, WebM ou MOV</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-black">
          <video
            ref={videoPreviewRef}
            src={previewUrl || undefined}
            controls
            className="w-full max-h-[300px] object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {videoError && (
        <p className="text-sm text-destructive text-center">{videoError}</p>
      )}
      {error && !videoError && (
        <FormError message={error} />
      )}

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Cette vidéo sera utilisée uniquement pour vérifier votre identité auprès de nos administrateurs et ne sera pas rendue publique. Présentez-vous brièvement en montrant clairement votre visage.
        </p>
      </div>
    </div>
  )
}

interface MultiStepSignupFormProps extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  onSubmit?: (data: SignupFormData) => void | Promise<void>
}

export function MultiStepSignupForm({
  className,
  onSubmit: onSubmitProp,
  ...props
}: MultiStepSignupFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      lastname: "",
      firstname: "",
      email: "",
      telephone: "",
      password: "",
      confirmPassword: "",
      nationality: "",
      current_country: "",
      date_of_birth: "",
      education_level: "",
      profession: "",
      acceptPrivacyPolicy: false,
    },
  })

  const handleNext = async () => {
    const fields = getFieldsForStep(currentStep)
    const isValid = await form.trigger(fields as any)

    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (data: SignupFormData) => {
    if (!onSubmitProp) return

    setIsSubmitting(true)
    try {
      await onSubmitProp(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldsForStep = (step: number): (keyof SignupFormData)[] => {
    switch (step) {
      case 1:
        return ["lastname", "firstname", "email", "telephone", "password", "confirmPassword"]
      case 2:
        return ["nationality", "current_country", "date_of_birth", "gender"]
      case 3:
        return ["education_level", "education_certificate", "profession", "profession_certificate"]
      case 4:
        return ["profile_photo", "photo_2", "photo_3", "photo_4"]
      case 5:
        return ["presentation_video"]
      case 6:
        return ["id_type", "id_document", "acceptPrivacyPolicy"]
      default:
        return []
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        {/* Header Section */}
        <div className="flex flex-col items-center gap-1 text-center mb-4">
          <h1 className="text-2xl font-bold">Créez votre compte</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Étape {currentStep} sur {steps.length}
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isClickable = step.id < currentStep
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    onClick={() => isClickable && setCurrentStep(step.id)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      currentStep > step.id
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground",
                      isClickable && "cursor-pointer hover:opacity-80"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center hidden md:block whitespace-nowrap">
                    <p className={cn(
                      "text-xs font-medium",
                      currentStep === step.id ? "text-primary" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2",
                      currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {/* Étape 1: Informations personnelles */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="lastname">Nom *</FieldLabel>
                <Input
                  {...form.register("lastname")}
                  id="lastname"
                  type="text"
                  placeholder="Dupont"
                />
                <FormError message={form.formState.errors.lastname?.message} />
              </Field>

              <Field>
                <FieldLabel htmlFor="firstname">Prénom *</FieldLabel>
                <Input
                  {...form.register("firstname")}
                  id="firstname"
                  type="text"
                  placeholder="Jean"
                />
                <FormError message={form.formState.errors.firstname?.message} />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email *</FieldLabel>
                <Input
                  {...form.register("email")}
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                />
                <FormError message={form.formState.errors.email?.message} />
              </Field>

              <Field>
                <FieldLabel htmlFor="telephone">Téléphone *</FieldLabel>
                <Controller
                  name="telephone"
                  control={form.control}
                  render={({ field }) => (
                    <PhoneInput
                      id="telephone"
                      placeholder="77 000 00 00"
                      defaultCountry="SN"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FormError message={form.formState.errors.telephone?.message} />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Mot de passe *</FieldLabel>
                <Input
                  {...form.register("password")}
                  id="password"
                  type="password"
                  placeholder="*******************"
                />
                <FormError message={form.formState.errors.password?.message} />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirmer le mot de passe *</FieldLabel>
                <Input
                  {...form.register("confirmPassword")}
                  id="confirmPassword"
                  type="password"
                  placeholder="*******************"
                />
                <FormError message={form.formState.errors.confirmPassword?.message} />
              </Field>
            </div>
          )}

          {/* Étape 2: Informations complémentaires */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="nationality">Nationalité *</FieldLabel>
                <Controller
                  name="nationality"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre nationalité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="senegalese">Sénégalaise</SelectItem>
                        <SelectItem value="french">Française</SelectItem>
                        <SelectItem value="ivorian">Ivoirienne</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormError message={form.formState.errors.nationality?.message} />
              </Field>

              <Field>
                <FieldLabel htmlFor="current_country">Pays actuel *</FieldLabel>
                <Controller
                  name="current_country"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre pays" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="senegal">Sénégal</SelectItem>
                        <SelectItem value="france">France</SelectItem>
                        <SelectItem value="ivory_coast">Côte d'Ivoire</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormError message={form.formState.errors.current_country?.message} />
              </Field>

              <Field>
                <FieldLabel htmlFor="date_of_birth">Date de naissance *</FieldLabel>
                <Controller
                  name="date_of_birth"
                  control={form.control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-9",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "dd MMMM yyyy", { locale: fr })
                            : "Sélectionnez une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              field.onChange(format(date, "yyyy-MM-dd"))
                            }
                          }}
                          fromYear={1940}
                          toYear={new Date().getFullYear() - 18}
                          defaultMonth={new Date(2000, 0)}
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <FormError message={form.formState.errors.date_of_birth?.message} />
              </Field>

              <Field>
                <FieldLabel htmlFor="gender">Genre *</FieldLabel>
                <Controller
                  name="gender"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Homme</SelectItem>
                        <SelectItem value="female">Femme</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormError message={form.formState.errors.gender?.message} />
              </Field>
            </div>
          )}

          {/* Étape 3: Études et Profession */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 gap-4">
              <Field>
                <FieldLabel htmlFor="education_level">Niveau d'études *</FieldLabel>
                <Controller
                  name="education_level"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high_school">Lycée</SelectItem>
                        <SelectItem value="bachelor">Licence</SelectItem>
                        <SelectItem value="master">Master</SelectItem>
                        <SelectItem value="phd">Doctorat</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormError message={form.formState.errors.education_level?.message} />
              </Field>

              <Field>
                <FieldLabel htmlFor="education_certificate">Justificatif de niveau d'études (PDF)</FieldLabel>
                <Input
                  id="education_certificate"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => form.setValue("education_certificate", e.target.files?.[0])}
                />
                <FieldDescription>Format accepté: PDF (max 5MB)</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="profession">Profession (optionnel)</FieldLabel>
                <Input
                  {...form.register("profession")}
                  id="profession"
                  type="text"
                  placeholder="Ex: Ingénieur, Médecin..."
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="profession_certificate">Justificatif de profession (optionnel)</FieldLabel>
                <Input
                  id="profession_certificate"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => form.setValue("profession_certificate", e.target.files?.[0])}
                />
                <FieldDescription>Format accepté: PDF (max 5MB)</FieldDescription>
              </Field>
            </div>
          )}

          {/* Étape 4: Photos de profil */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 gap-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold mb-2">Ajoutez vos photos</h3>
                <p className="text-sm text-muted-foreground">
                  La première photo sera votre photo de profil (obligatoire).
                  Vous pouvez ajouter jusqu'à 3 autres photos.
                </p>
              </div>

              <ProfilePhotosUpload
                onPhotosChange={(photos) => {
                  form.setValue("profile_photo", photos[0] || null)
                  form.setValue("photo_2", photos[1] || null)
                  form.setValue("photo_3", photos[2] || null)
                  form.setValue("photo_4", photos[3] || null)
                }}
              />

              <FormError message={form.formState.errors.profile_photo?.message as string | undefined} />
            </div>
          )}

          {/* Étape 5: Vidéo de présentation */}
          {currentStep === 5 && (
            <VideoUploadStep
              value={form.watch("presentation_video")}
              onChange={(file) => form.setValue("presentation_video", file, { shouldValidate: true })}
              error={form.formState.errors.presentation_video?.message as string | undefined}
            />
          )}

          {/* Étape 6: Pièce d'identité */}
          {currentStep === 6 && (
            <div className="grid grid-cols-1 gap-4">
              <Field>
                <FieldLabel htmlFor="id_type">Type de pièce d'identité *</FieldLabel>
                <Controller
                  name="id_type"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passeport</SelectItem>
                        <SelectItem value="national_id">Carte d'identité nationale</SelectItem>
                        <SelectItem value="driver_license">Permis de conduire</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormError message={form.formState.errors.id_type?.message} />
              </Field>

              <Field>
                <FieldLabel htmlFor="id_document">Justificatif d'identité *</FieldLabel>
                <Input
                  id="id_document"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => form.setValue("id_document", e.target.files?.[0])}
                />
                <FieldDescription>Formats acceptés: PDF, JPG, PNG (max 5MB)</FieldDescription>
              </Field>

              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <p className="text-sm text-muted-foreground">
                  ℹ️ Votre pièce d'identité sera vérifiée pour assurer la sécurité de notre communauté.
                  Vos informations restent confidentielles.
                </p>
              </div>

              <Field>
                <div className="flex items-start gap-3">
                  <Controller
                    name="acceptPrivacyPolicy"
                    control={form.control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="acceptPrivacyPolicy"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    )}
                  />
                  <label htmlFor="acceptPrivacyPolicy" className="text-sm leading-relaxed">
                    J'accepte les{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      politiques de confidentialité
                    </a>{" "}
                    et les{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      conditions d'utilisation
                    </a>{" "}
                    *
                  </label>
                </div>
                <FormError message={form.formState.errors.acceptPrivacyPolicy?.message} />
              </Field>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </Button>
          )}

          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={handleNext}
              className={`gap-2 ${currentStep === 1 ? 'md:col-start-2' : ''}`}
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <LoadingButton
              type="submit"
              icon={<UserPlus className="h-4 w-4" />}
              loading={isSubmitting}
            >
              Créer mon compte
            </LoadingButton>
          )}
        </div>

        {/* Footer Link - Only on first step */}
        {currentStep === 1 && (
          <Field>
            <FieldDescription className="px-6 text-center">
              Vous avez déjà un compte ?{" "}
              <a href={APP_ROUTES.auth.login} className="underline underline-offset-4">
                Se connecter
              </a>
            </FieldDescription>
          </Field>
        )}
      </FieldGroup>
    </form>
  )
}
