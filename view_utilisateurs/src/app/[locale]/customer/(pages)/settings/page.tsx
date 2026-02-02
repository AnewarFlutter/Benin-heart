'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Palette, User, Key, Bell, Settings, Camera, Video, GraduationCap, Upload, Trash2, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

type SettingsSection = 'profile' | 'account' | 'photos' | 'video' | 'education' | 'appearance' | 'notifications';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const section = searchParams.get('section') as SettingsSection | null;

  const [activeSection, setActiveSection] = useState<SettingsSection>(section || 'profile');
  const [date, setDate] = useState<Date>();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [photos, setPhotos] = useState<(string | null)[]>([
    'https://i.pravatar.cc/400?img=5', null, null, null
  ]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (section && ['profile', 'account', 'photos', 'video', 'education', 'appearance', 'notifications'].includes(section)) {
      setActiveSection(section as SettingsSection);
    }
  }, [section]);

  const menuItems = [
    { id: 'profile' as SettingsSection, label: 'Profil', icon: User },
    { id: 'account' as SettingsSection, label: 'Compte', icon: Key },
    { id: 'photos' as SettingsSection, label: 'Photos', icon: Camera },
    { id: 'video' as SettingsSection, label: 'Vidéo', icon: Video },
    { id: 'education' as SettingsSection, label: 'Études & Profession', icon: GraduationCap },
    { id: 'appearance' as SettingsSection, label: 'Apparence', icon: Palette },
    { id: 'notifications' as SettingsSection, label: 'Notifications', icon: Bell },
  ];

  return (
    <> 
      <div className="container mx-auto p-6 flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
          {/* En-tête */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold">{"Paramètres"}</h1>
            </div>
            <p className="text-muted-foreground">
              {"Gérez les paramètres de votre compte et définissez vos préférences."}
            </p>
          </div>

          <Separator />

          {/* Layout principal avec sidebar et contenu */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            {/* Sidebar de navigation */}
            <aside className="lg:w-64 flex-shrink-0">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                        activeSection === item.id
                          ? 'bg-muted font-medium'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Contenu principal */}
            <div className="flex-1 max-w-3xl">
              {/* Section Profile */}
              {activeSection === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Profil</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {"C'est ainsi que les autres vous verront sur le site."}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="username">{"Nom d'utilisateur"}</Label>
                      <Input id="username" placeholder="utilisateur" defaultValue="utilisateur" />
                      <p className="text-sm text-muted-foreground">
                        {"C'est votre nom d'affichage public. Il peut s'agir de votre vrai nom ou d'un pseudonyme. Vous ne pouvez le modifier qu'une fois tous les 30 jours."}
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="exemple@mail.com"
                        defaultValue="exemple@mail.com"
                      />
                      <p className="text-sm text-muted-foreground">
                        Vous pouvez gérer vos adresses email vérifiées dans les paramètres email.
                      </p>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biographie</Label>
                      <Textarea
                        id="bio"
                        placeholder="Parlez-nous un peu de vous"
                        defaultValue="Passionné par la restauration."
                        className="min-h-[100px]"
                      />
                      <p className="text-sm text-muted-foreground">
                        Vous pouvez <span className="text-primary">@mentionner</span> {"d'autres utilisateurs et organisations pour créer des liens."}
                      </p>
                    </div>

                    <Button onClick={() => toast.success("Profil mis à jour", { description: "Vos informations de profil ont été enregistrées" })}>Mettre à jour le profil</Button>
                  </div>
                </div>
              )}

              {/* Section Account */}
              {activeSection === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Compte</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Mettez à jour les paramètres de votre compte. Définissez votre langue préférée.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom</Label>
                      <Input id="name" placeholder="Votre nom" />
                      <p className="text-sm text-muted-foreground">
                        {"C'est le nom qui sera affiché sur votre profil et dans les emails."}
                      </p>
                    </div>

                    {/* First Name */}
                    <div className="space-y-2">
                      <Label htmlFor="firstname">Prénom</Label>
                      <Input id="firstname" placeholder="Votre prénom" />
                    </div>

                    {/* Date of birth */}
                    <div className="space-y-2">
                      <Label>Date de naissance</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !date && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, 'PPP') : <span>Choisir une date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <p className="text-sm text-muted-foreground">
                        Votre date de naissance est utilisée pour calculer votre âge.
                      </p>
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                      <Label htmlFor="language">Langue</Label>
                      <Select defaultValue="fr">
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Sélectionner une langue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {"C'est la langue qui sera utilisée dans le tableau de bord."}
                      </p>
                    </div>

                    <Separator />

                    {/* Change Password Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Changer le mot de passe</h3>

                      {/* Current Password */}
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Ancien mot de passe</Label>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="Entrez votre ancien mot de passe"
                        />
                      </div>

                      {/* New Password */}
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nouveau mot de passe</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Entrez votre nouveau mot de passe"
                        />
                        <p className="text-sm text-muted-foreground">
                          Le mot de passe doit contenir au moins 8 caractères.
                        </p>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmation du mot de passe</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirmez votre nouveau mot de passe"
                        />
                      </div>
                    </div>

                    <Button onClick={() => toast.success("Compte mis à jour", { description: "Vos paramètres de compte ont été enregistrés" })}>Mettre à jour le compte</Button>
                  </div>
                </div>
              )}

              {/* Section Photos */}
              {activeSection === 'photos' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Photos</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gérez vos photos de profil. La première photo est votre photo principale.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 overflow-hidden group">
                          {photo ? (
                            <>
                              <img src={photo} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                              <button
                                onClick={() => {
                                  const newPhotos = [...photos];
                                  newPhotos[index] = null;
                                  setPhotos(newPhotos);
                                }}
                                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              {index === 0 && (
                                <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">
                                  Principale
                                </span>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                photoInputRef.current?.setAttribute('data-index', String(index));
                                photoInputRef.current?.click();
                              }}
                              className="h-full w-full flex flex-col items-center justify-center gap-2 hover:bg-muted/30 transition-colors"
                            >
                              <Camera className="h-6 w-6 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Ajouter</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        const index = Number(photoInputRef.current?.getAttribute('data-index') || 0);
                        if (file) {
                          const url = URL.createObjectURL(file);
                          const newPhotos = [...photos];
                          newPhotos[index] = url;
                          setPhotos(newPhotos);
                        }
                        e.target.value = '';
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Formats acceptés : JPG, PNG, WebP. Taille max : 5 MB par photo.
                    </p>

                    <Button onClick={() => toast.success("Photos mises à jour", { description: "Vos photos de profil ont été enregistrées" })}>Enregistrer les photos</Button>
                  </div>
                </div>
              )}

              {/* Section Vidéo */}
              {activeSection === 'video' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Vidéo de vérification</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Votre vidéo de présentation pour la vérification d'identité.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    {!videoUrl ? (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            if (!file.type.startsWith('video/')) {
                              setVideoError('Le fichier doit être une vidéo (MP4, WebM, MOV)');
                              return;
                            }
                            const sizeMB = file.size / (1024 * 1024);
                            if (sizeMB > 50) {
                              setVideoError(`Vidéo trop lourde (${sizeMB.toFixed(1)} MB). Maximum : 50 MB`);
                              return;
                            }
                            setVideoError(null);
                            setVideoFile(file);
                            setVideoUrl(URL.createObjectURL(file));
                          }
                        }}
                        onClick={() => videoInputRef.current?.click()}
                        className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                      >
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Cliquez ou glissez votre vidéo ici</p>
                          <p className="text-xs text-muted-foreground mt-1">MP4, WebM ou MOV - Max 3 min, 50 MB</p>
                        </div>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (!file.type.startsWith('video/')) {
                                setVideoError('Le fichier doit être une vidéo (MP4, WebM, MOV)');
                                return;
                              }
                              const sizeMB = file.size / (1024 * 1024);
                              if (sizeMB > 50) {
                                setVideoError(`Vidéo trop lourde (${sizeMB.toFixed(1)} MB). Maximum : 50 MB`);
                                return;
                              }
                              setVideoError(null);
                              setVideoFile(file);
                              setVideoUrl(URL.createObjectURL(file));
                            }
                            e.target.value = '';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden bg-black">
                        <video src={videoUrl} controls className="w-full max-h-[350px] object-contain" />
                        <button
                          onClick={() => {
                            if (videoUrl) URL.revokeObjectURL(videoUrl);
                            setVideoUrl(null);
                            setVideoFile(null);
                            setVideoError(null);
                          }}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {videoError && (
                      <p className="text-sm text-destructive">{videoError}</p>
                    )}

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Cette vidéo sera utilisée uniquement pour vérifier votre identité auprès de nos administrateurs et ne sera pas rendue publique. Présentez-vous brièvement en montrant clairement votre visage.
                      </p>
                    </div>

                    <Button onClick={() => toast.success("Vidéo mise à jour", { description: "Votre vidéo de vérification a été enregistrée" })}>Enregistrer la vidéo</Button>
                  </div>
                </div>
              )}

              {/* Section Études & Profession */}
              {activeSection === 'education' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Études & Profession</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Mettez à jour votre parcours scolaire et professionnel.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    {/* Education Level */}
                    <div className="space-y-2">
                      <Label htmlFor="education_level">Niveau d'études</Label>
                      <Select defaultValue="bachelor">
                        <SelectTrigger id="education_level">
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
                    </div>

                    {/* Education Certificate */}
                    <div className="space-y-2">
                      <Label htmlFor="education_certificate">Justificatif de niveau d'études</Label>
                      <Input
                        id="education_certificate"
                        type="file"
                        accept="application/pdf"
                      />
                      <p className="text-sm text-muted-foreground">Format accepté : PDF (max 5 MB)</p>
                    </div>

                    <Separator />

                    {/* Profession */}
                    <div className="space-y-2">
                      <Label htmlFor="profession">Profession</Label>
                      <Input id="profession" placeholder="Ex: Ingénieur, Médecin..." />
                    </div>

                    {/* Profession Certificate */}
                    <div className="space-y-2">
                      <Label htmlFor="profession_certificate">Justificatif de profession</Label>
                      <Input
                        id="profession_certificate"
                        type="file"
                        accept="application/pdf"
                      />
                      <p className="text-sm text-muted-foreground">Format accepté : PDF (max 5 MB)</p>
                    </div>

                    <Button onClick={() => toast.success("Études & Profession mis à jour", { description: "Vos informations ont été enregistrées" })}>Mettre à jour</Button>
                  </div>
                </div>
              )}

              {/* Section Appearance */}
              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Apparence</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {"Personnalisez l'apparence de l'application. Basculez automatiquement entre les thèmes jour et nuit."}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    {/* Theme */}
                    <div className="space-y-2">
                      <Label>Thème</Label>
                      <p className="text-sm text-muted-foreground">
                        Sélectionnez le thème pour le tableau de bord.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <Card
                          className={cn(
                            "cursor-pointer border-2 transition-colors",
                            selectedTheme === 'light'
                              ? "border-primary"
                              : "border-border hover:border-primary"
                          )}
                          onClick={() => setSelectedTheme('light')}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-3 w-3 rounded-full bg-gray-300 shrink-0" />
                                  <div className="h-2 bg-gray-200 rounded flex-1" />
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="h-3 w-3 rounded-full bg-gray-300 shrink-0" />
                                  <div className="h-2 bg-gray-200 rounded flex-1" />
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="h-3 w-3 rounded-full bg-gray-300 shrink-0" />
                                  <div className="h-2 bg-gray-200 rounded flex-1" />
                                </div>
                              </div>
                              <p className="text-sm font-medium text-center">Clair</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card
                          className={cn(
                            "cursor-pointer border-2 transition-colors",
                            selectedTheme === 'dark'
                              ? "border-primary"
                              : "border-border hover:border-primary"
                          )}
                          onClick={() => setSelectedTheme('dark')}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="bg-[#020817] border border-gray-800 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-3 w-3 rounded-full bg-gray-600 shrink-0" />
                                  <div className="h-2 bg-gray-700 rounded flex-1" />
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="h-3 w-3 rounded-full bg-gray-600 shrink-0" />
                                  <div className="h-2 bg-gray-700 rounded flex-1" />
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="h-3 w-3 rounded-full bg-gray-600 shrink-0" />
                                  <div className="h-2 bg-gray-700 rounded flex-1" />
                                </div>
                              </div>
                              <p className="text-sm font-medium text-center">Sombre</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Button onClick={() => toast.success("Préférences mises à jour", { description: "Vos préférences d'apparence ont été enregistrées" })}>Mettre à jour les préférences</Button>
                  </div>
                </div>
              )}

              {/* Section Notifications */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Notifications</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure how you receive notifications.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Notifications</h3>
                      <div className="space-y-4">
                        {/* Commande */}
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium">Commande</p>
                                <p className="text-sm text-muted-foreground">
                                  Recevoir des notifications pour les nouvelles commandes.
                                </p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Email */}
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">
                                  Recevoir des notifications par email pour les activités importantes.
                                </p>
                              </div>
                              <Switch />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Button onClick={() => toast.success("Notifications mises à jour", { description: "Vos préférences de notification ont été enregistrées" })}>Mettre à jour les notifications</Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
