'use client';

import { useState, useEffect } from 'react';
import { ScanHeart, Heart, X, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BreadcrumbDemo } from '../_components/breadcrumb';
import { getMesLikesAction, swipeAction } from '@/actions/beninheart/like/actions';
import { EntityMatch } from '@/modules/beninheart/like/like/domain/entities/entity_like';

interface SuperlikeProfile {
  uuid: string;
  prenom: string;
  photo: string | null;
}

function toProfile(match: EntityMatch): SuperlikeProfile {
  return {
    uuid: match.uuid ?? '',
    prenom: match.autreUtilisateur?.prenom ?? 'Anonyme',
    photo: match.autreUtilisateur?.photoPrincipale ?? null,
  };
}

export default function FavoritesPage() {
  const [profiles, setProfiles] = useState<SuperlikeProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getMesLikesAction();
      if (res.success && res.data) {
        const superlikes = res.data.filter((m) => m.typeAction === 'SUPERLIKE');
        setProfiles(superlikes.map(toProfile));
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleLike = async (uuid: string, prenom: string) => {
    const res = await swipeAction(uuid, 'LIKE');
    if (res.success && res.data?.estMatch) {
      toast.success(`C'est un match avec ${prenom} !`);
    } else {
      toast.success(`Like envoyé à ${prenom}`);
    }
    setProfiles((prev) => prev.filter((p) => p.uuid !== uuid));
  };

  const handlePass = async (uuid: string) => {
    await swipeAction(uuid, 'DISLIKE');
    toast.error('Profil ignoré');
    setProfiles((prev) => prev.filter((p) => p.uuid !== uuid));
  };

  return (
    <div className="flex flex-1 flex-col w-full">
      <div className="px-4 lg:px-6 py-4">
        <BreadcrumbDemo />
      </div>
      <div className="px-4 lg:px-6 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <ScanHeart className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Coup de cœur</h1>
            {!loading && (
              <p className="text-sm text-muted-foreground">
                {profiles.length} personne{profiles.length > 1 ? 's' : ''} vous ont super-liké
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : profiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {profiles.map((profile) => (
              <div
                key={profile.uuid}
                className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
              >
                <div className="aspect-[3/4] relative">
                  {profile.photo ? (
                    <img src={profile.photo} alt={profile.prenom} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted text-4xl">⭐</div>
                  )}
                  <div className="absolute top-2 right-2 z-10 flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 shadow-lg">
                    <Star className="h-4 w-4 text-white fill-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate">{profile.prenom}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2">
                  <button
                    onClick={() => handlePass(profile.uuid)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-xs sm:text-sm"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Passer</span>
                  </button>
                  <button
                    onClick={() => handleLike(profile.uuid, profile.prenom)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors text-xs sm:text-sm"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="hidden sm:inline">Liker</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⭐</div>
            <h2 className="text-xl font-bold mb-2">Aucun coup de cœur pour le moment</h2>
            <p className="text-muted-foreground">
              Les super likes apparaîtront ici quand quelqu'un craquera pour vous !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
