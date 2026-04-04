'use client';

import { useState } from 'react';
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
import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OnboardingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [genre, setGenre] = useState('');
  const [bio, setBio] = useState('');
  const [ville, setVille] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom.trim()) {
      toast.error('Le prénom est obligatoire');
      return;
    }
    setSaving(true);
    const res = await updateMonProfilAction({
      prenom: prenom.trim(),
      dateNaissance: dateNaissance || undefined,
      genre: genre || undefined,
      bio: bio.trim() || undefined,
      ville: ville.trim() || undefined,
    });
    if (res.success) {
      toast.success('Profil créé !');
      router.push(APP_ROUTES.customer.root);
    } else {
      toast.error(res.error ?? 'Erreur lors de la création du profil');
      setSaving(false);
    }
  };

  const handleSkip = () => {
    router.push(APP_ROUTES.customer.root);
  };

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
          <div className="w-full max-w-md px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30">
                <Heart className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Complétez votre profil</h1>
                <p className="text-sm text-muted-foreground">Pour de meilleures rencontres</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom <span className="text-destructive">*</span></Label>
                <Input
                  id="prenom"
                  placeholder="Votre prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date de naissance</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger id="genre">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="H">Homme</SelectItem>
                    <SelectItem value="F">Femme</SelectItem>
                    <SelectItem value="A">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  placeholder="Ex : Cotonou"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  placeholder="Parlez-nous un peu de vous..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-[90px]"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" disabled={saving} className="w-full">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer mon profil
                </Button>
                <Button type="button" variant="ghost" onClick={handleSkip} disabled={saving} className="w-full text-muted-foreground">
                  Passer pour l'instant
                </Button>
              </div>
            </form>
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
