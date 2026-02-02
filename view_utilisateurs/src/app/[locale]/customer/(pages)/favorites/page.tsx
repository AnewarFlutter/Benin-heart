'use client';

import { useState } from 'react';
import { ScanHeart, Heart, X, Star } from 'lucide-react';
import { toast } from 'sonner';
import { BreadcrumbDemo } from '../_components/breadcrumb';

const initialProfiles = [
  {
    id: 1,
    images: ['https://i.pravatar.cc/400?img=1'],
    name: 'Marie, 25 ans',
    job: 'Designer graphique',
    location: 'Paris, France',
  },
  {
    id: 2,
    images: ['https://i.pravatar.cc/400?img=16'],
    name: 'Léa, 24 ans',
    job: 'Artiste peintre',
    location: 'Bordeaux, France',
  },
  {
    id: 3,
    images: ['https://i.pravatar.cc/400?img=28'],
    name: 'Laura, 30 ans',
    job: 'Avocate',
    location: 'Paris, France',
  },
  {
    id: 4,
    images: ['https://i.pravatar.cc/400?img=33'],
    name: 'Océane, 27 ans',
    job: 'Photographe',
    location: 'Montpellier, France',
  },
  {
    id: 5,
    images: ['https://i.pravatar.cc/400?img=41'],
    name: 'Pauline, 28 ans',
    job: 'Journaliste',
    location: 'Lille, France',
  },
  {
    id: 6,
    images: ['https://i.pravatar.cc/400?img=48'],
    name: 'Alice, 27 ans',
    job: 'Ingénieure',
    location: 'Grenoble, France',
  },
];

export default function FavoritesPage() {
  const [profiles, setProfiles] = useState(initialProfiles);

  const handleLike = (id: number, name: string) => {
    toast.success(`C'est un match avec ${name} !`, {
      position: 'top-right',
      duration: 2000,
    });
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePass = (id: number) => {
    toast.error('Profil ignoré', {
      position: 'top-right',
      duration: 2000,
    });
    setProfiles((prev) => prev.filter((p) => p.id !== id));
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
            <p className="text-sm text-muted-foreground">
              {profiles.length} personne{profiles.length > 1 ? 's' : ''} vous ont super-liké
            </p>
          </div>
        </div>

        {profiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={profile.images[0]}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                  {/* Badge Super Like */}
                  <div className="absolute top-2 right-2 z-10 flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 shadow-lg">
                    <Star className="h-4 w-4 text-white fill-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                      {profile.name}
                    </h3>
                    {profile.job && (
                      <p className="text-xs text-white/80 truncate">{profile.job}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2">
                  <button
                    onClick={() => handlePass(profile.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-xs sm:text-sm"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Passer</span>
                  </button>
                  <button
                    onClick={() => handleLike(profile.id, profile.name)}
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
