'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { APP_ROUTES } from '@/shared/constants/routes';
import { APP_IMAGES } from '@/shared/constants/images';
import { APP_TEXTE } from '@/shared/constants/texte';
import { updateMonProfilAction } from '@/actions/beninheart/profil/actions';
import { featuresDi } from '@/di/features_di';
import { useAuthStore } from '@/stores/auth_store';
import { Heart, Loader2, Camera, Video, X, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type Step = 'profil' | 'photos' | 'video';

export default function OnboardingPage() {
  const router = useRouter();
  const pendingProfile = useAuthStore((s) => s.pendingRegisterProfile);
  const clearPending = useAuthStore((s) => s.setPendingRegisterProfile);

  const [step, setStep] = useState<Step>('profil');
  const [saving, setSaving] = useState(false);

  console.log('[OnboardingPage] rendu — step:', step, '| pendingProfile:', pendingProfile);

  // Step 1 — Profile
  const [prenom, setPrenom] = useState(pendingProfile?.prenom ?? '');
  const [dateNaissance, setDateNaissance] = useState(pendingProfile?.dateNaissance ?? '');
  const [genre, setGenre] = useState(pendingProfile?.genre ?? '');
  const [pays, setPays] = useState(pendingProfile?.pays ?? '');
  const [ville, setVille] = useState('');
  const [bio, setBio] = useState('');

  // Step 2 — Photos
  const [photos, setPhotos] = useState<File[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Step 3 — Video
  const [video, setVideo] = useState<File | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── Step 1 submit ──────────────────────────────────────────────────────────
  const handleProfilSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom.trim()) {
      toast.error('Le prénom est obligatoire');
      return;
    }
    const payload = {
      prenom: prenom.trim(),
      dateNaissance: dateNaissance || undefined,
      genre: genre || undefined,
      bio: bio.trim() || undefined,
      ville: ville.trim() || undefined,
      pays: pays || undefined,
    };
    console.log('[OnboardingPage] handleProfilSubmit() → payload:', payload);
    setSaving(true);
    const res = await updateMonProfilAction(payload);
    console.log('[OnboardingPage] updateMonProfilAction() ←', res);
    setSaving(false);
    if (res.success) {
      console.log('[OnboardingPage] profil créé → step photos');
      setStep('photos');
    } else {
      console.warn('[OnboardingPage] updateMonProfilAction() — erreur:', res.error);
      toast.error(res.error ?? 'Erreur lors de la création du profil');
    }
  };

  // ── Step 2 — photos ────────────────────────────────────────────────────────
  const addPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files].slice(0, 4));
    e.target.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePhotosNext = async () => {
    console.log('[OnboardingPage] handlePhotosNext() — photos:', photos.length);
    if (photos.length === 0) {
      console.log('[OnboardingPage] aucune photo → passer à video');
      setStep('video');
      return;
    }
    setSaving(true);
    let allOk = true;
    for (let i = 0; i < photos.length; i++) {
      const fd = new FormData();
      fd.append('image', photos[i]);
      fd.append('ordre', String(i + 1));
      if (i === 0) fd.append('est_principale', 'true');
      console.log(`[OnboardingPage] upload photo ${i + 1}/${photos.length} — nom:`, photos[i].name, '| taille:', photos[i].size);
      const ok = await featuresDi.profilController.uploadPhoto(fd);
      console.log(`[OnboardingPage] uploadPhoto(${i + 1}) ← ok:`, ok);
      if (!ok) { allOk = false; break; }
    }
    setSaving(false);
    if (!allOk) {
      console.warn('[OnboardingPage] uploadPhoto — au moins une photo a échoué');
      toast.error("Erreur lors de l'upload d'une photo");
      return;
    }
    console.log('[OnboardingPage] toutes les photos uploadées → step video');
    toast.success('Photos ajoutées !');
    setStep('video');
  };

  // ── Step 3 — video ─────────────────────────────────────────────────────────
  const handleVideoFinish = async () => {
    console.log('[OnboardingPage] handleVideoFinish() — vidéo:', video?.name ?? 'aucune');
    if (video) {
      setSaving(true);
      const fd = new FormData();
      fd.append('video_presentation', video);
      console.log('[OnboardingPage] upload vidéo — nom:', video.name, '| taille:', video.size);
      const ok = await featuresDi.profilController.uploadVideo(fd);
      console.log('[OnboardingPage] uploadVideo() ← ok:', ok);
      setSaving(false);
      if (!ok) {
        console.warn('[OnboardingPage] uploadVideo — échec');
        toast.error("Erreur lors de l'upload de la vidéo");
        return;
      }
      toast.success('Vidéo ajoutée !');
    }
    console.log('[OnboardingPage] onboarding terminé → redirection home');
    clearPending(null);
    router.push(APP_ROUTES.customer.root);
  };

  const handleSkipVideo = () => {
    clearPending(null);
    router.push(APP_ROUTES.customer.root);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href={APP_ROUTES.home.root} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src={APP_IMAGES.logo.main} alt="Logo" width={80} height={80} className="object-contain" />
            <span className="font-bold text-xl text-foreground">{APP_TEXTE.logoText}</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md px-4">

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {(['profil', 'photos', 'video'] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`h-2 rounded-full flex-1 transition-colors ${
                    step === s ? 'bg-pink-500' :
                    (['profil', 'photos', 'video'].indexOf(step) > i) ? 'bg-pink-300' : 'bg-muted'
                  }`} />
                </div>
              ))}
            </div>

            {/* Step 1 — Profil */}
            {step === 'profil' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30">
                    <Heart className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Complétez votre profil</h1>
                    <p className="text-sm text-muted-foreground">Étape 1 sur 3 — Informations de base</p>
                  </div>
                </div>

                <form onSubmit={handleProfilSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom <span className="text-destructive">*</span></Label>
                    <Input id="prenom" placeholder="Votre prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob">Date de naissance</Label>
                    <Input id="dob" type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger id="genre"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOMME">Homme</SelectItem>
                        <SelectItem value="FEMME">Femme</SelectItem>
                        <SelectItem value="AUTRE">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pays">Pays</Label>
                    <Input id="pays" placeholder="Ex : Bénin" value={pays} onChange={(e) => setPays(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ville">Ville</Label>
                    <Input id="ville" placeholder="Ex : Cotonou" value={ville} onChange={(e) => setVille(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea id="bio" placeholder="Parlez-nous un peu de vous..." value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[80px]" />
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Button type="submit" disabled={saving} className="w-full">
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Continuer <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => { clearPending(null); router.push(APP_ROUTES.customer.root); }} disabled={saving} className="w-full text-muted-foreground">
                      Passer pour l'instant
                    </Button>
                  </div>
                </form>
              </>
            )}

            {/* Step 2 — Photos */}
            {step === 'photos' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30">
                    <Camera className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Vos photos</h1>
                    <p className="text-sm text-muted-foreground">Étape 2 sur 3 — Jusqu'à 4 photos</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {photos.map((file, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted border">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-xs bg-pink-500 text-white px-1.5 py-0.5 rounded">
                          Principale
                        </span>
                      )}
                    </div>
                  ))}
                  {photos.length < 4 && (
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/40 flex flex-col items-center justify-center gap-1 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-colors"
                    >
                      <Camera className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Ajouter</span>
                    </button>
                  )}
                </div>

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={addPhoto}
                />

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => setStep('profil')} className="flex-1">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Retour
                  </Button>
                  <Button onClick={handlePhotosNext} disabled={saving} className="flex-1">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {photos.length === 0 ? 'Passer' : 'Continuer'} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {/* Step 3 — Video */}
            {step === 'video' && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30">
                    <Video className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Vidéo de présentation</h1>
                    <p className="text-sm text-muted-foreground">Étape 3 sur 3 — Optionnelle</p>
                  </div>
                </div>

                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-muted-foreground/40 rounded-lg p-8 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/20 transition-colors mb-4"
                >
                  {video ? (
                    <div className="flex flex-col items-center gap-2">
                      <Video className="h-8 w-8 text-pink-500" />
                      <p className="font-medium text-sm">{video.name}</p>
                      <p className="text-xs text-muted-foreground">{(video.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Video className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Cliquez pour choisir une vidéo</p>
                      <p className="text-xs text-muted-foreground">MP4, MOV — max 50 MB</p>
                    </div>
                  )}
                </div>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
                />

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('photos')} className="flex-1">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Retour
                  </Button>
                  <Button onClick={handleVideoFinish} disabled={saving} className="flex-1">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {video ? 'Terminer' : 'Ignorer'}
                  </Button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      <div className="bg-muted relative hidden lg:block">
        <img
          src={APP_IMAGES.auth.registerBackground}
          alt="Onboarding background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-12">
          <div className="text-white text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-pink-400 fill-pink-400" />
            <h2 className="text-3xl font-bold mb-3">Bienvenue sur Benin Heart</h2>
            <p className="text-lg text-white/80">
              Un profil complet augmente vos chances de trouver la bonne personne.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
