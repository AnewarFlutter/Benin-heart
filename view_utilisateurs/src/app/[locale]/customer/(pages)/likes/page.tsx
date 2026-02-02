'use client';

import { useState, useMemo } from 'react';
import { ThumbsUp, Heart, X, Star, MessageCircle, SlidersHorizontal, Filter, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { BreadcrumbDemo } from '../_components/breadcrumb';
import { APP_ROUTES } from '@/shared/constants/routes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProfileType = 'match' | 'like_received' | 'like_sent' | 'superlike_received' | 'superlike_sent';

interface Profile {
  id: number;
  images: string[];
  name: string;
  job: string;
  type: ProfileType;
}

const allProfiles: Profile[] = [
  // Matchs
  { id: 201, images: ['https://i.pravatar.cc/400?img=44'], name: 'Juliette, 25 ans', job: 'Danseuse', type: 'match' },
  { id: 202, images: ['https://i.pravatar.cc/400?img=47'], name: 'Lucie, 29 ans', job: 'Pharmacienne', type: 'match' },
  { id: 203, images: ['https://i.pravatar.cc/400?img=3'], name: 'Inès, 23 ans', job: 'Styliste', type: 'match' },
  // Likes reçus
  { id: 1, images: ['https://i.pravatar.cc/400?img=5'], name: 'Sophie, 28 ans', job: 'Éditrice', type: 'like_received' },
  { id: 2, images: ['https://i.pravatar.cc/400?img=9'], name: 'Julie, 26 ans', job: 'Coach sportive', type: 'like_received' },
  { id: 3, images: ['https://i.pravatar.cc/400?img=13'], name: 'Camille, 27 ans', job: 'Développeuse Full Stack', type: 'like_received' },
  { id: 4, images: ['https://i.pravatar.cc/400?img=20'], name: 'Emma, 29 ans', job: 'Chef pâtissière', type: 'like_received' },
  // Likes envoyés
  { id: 11, images: ['https://i.pravatar.cc/400?img=23'], name: 'Chloé, 26 ans', job: 'Médecin généraliste', type: 'like_sent' },
  { id: 12, images: ['https://i.pravatar.cc/400?img=26'], name: 'Manon, 23 ans', job: 'Étudiante en architecture', type: 'like_sent' },
  { id: 13, images: ['https://i.pravatar.cc/400?img=31'], name: 'Sarah, 25 ans', job: 'Influenceuse', type: 'like_sent' },
  // Super likes reçus
  { id: 101, images: ['https://i.pravatar.cc/400?img=1'], name: 'Marie, 25 ans', job: 'Designer graphique', type: 'superlike_received' },
  { id: 102, images: ['https://i.pravatar.cc/400?img=16'], name: 'Léa, 24 ans', job: 'Artiste peintre', type: 'superlike_received' },
  { id: 103, images: ['https://i.pravatar.cc/400?img=28'], name: 'Laura, 30 ans', job: 'Avocate', type: 'superlike_received' },
  // Super likes envoyés
  { id: 111, images: ['https://i.pravatar.cc/400?img=33'], name: 'Océane, 27 ans', job: 'Photographe', type: 'superlike_sent' },
  { id: 112, images: ['https://i.pravatar.cc/400?img=41'], name: 'Pauline, 28 ans', job: 'Journaliste', type: 'superlike_sent' },
];

const filterOptions: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'Tout', icon: <Filter className="h-4 w-4" /> },
  { value: 'match', label: 'Matchs', icon: <CheckCheck className="h-4 w-4 text-green-500" /> },
  { value: 'like_received', label: 'Likes reçus', icon: <Heart className="h-4 w-4 text-pink-500" /> },
  { value: 'like_sent', label: 'Likes envoyés', icon: <Heart className="h-4 w-4 text-muted-foreground" /> },
  { value: 'superlike_received', label: 'Coup de cœur reçus', icon: <Star className="h-4 w-4 text-blue-500" /> },
  { value: 'superlike_sent', label: 'Coup de cœur envoyés', icon: <Star className="h-4 w-4 text-muted-foreground" /> },
];

function getBadge(type: ProfileType) {
  switch (type) {
    case 'match':
      return <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-semibold shadow">Match</div>;
    case 'like_received':
      return <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-semibold shadow">Like reçu</div>;
    case 'like_sent':
      return <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-pink-300 text-white text-[10px] font-semibold shadow">Like envoyé</div>;
    case 'superlike_received':
      return (
        <div className="absolute top-2 right-2 z-10 flex items-center justify-center h-7 w-7 rounded-full bg-blue-500 shadow-lg">
          <Star className="h-3.5 w-3.5 text-white fill-white" />
        </div>
      );
    case 'superlike_sent':
      return (
        <div className="absolute top-2 right-2 z-10 flex items-center justify-center h-7 w-7 rounded-full bg-blue-300 shadow-lg">
          <Star className="h-3.5 w-3.5 text-white fill-white" />
        </div>
      );
  }
}

function ProfileCard({ profile, onAction }: { profile: Profile; onAction: (action: 'like' | 'pass' | 'chat') => void }) {
  const isReceived = profile.type === 'like_received' || profile.type === 'superlike_received';
  const isMatch = profile.type === 'match';

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
      <div className="aspect-[3/4] relative">
        <img src={profile.images[0]} alt={profile.name} className="h-full w-full object-cover" />
        {getBadge(profile.type)}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm sm:text-base font-semibold text-white truncate">{profile.name}</h3>
          <p className="text-xs text-white/80 truncate">{profile.job}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 p-2">
        {isReceived ? (
          <>
            <button onClick={() => onAction('pass')} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-xs sm:text-sm">
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Passer</span>
            </button>
            <button onClick={() => onAction('like')} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors text-xs sm:text-sm">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Liker</span>
            </button>
          </>
        ) : (
          <button onClick={() => onAction('chat')} className="w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs sm:text-sm">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Discuter</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function LikesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState(allProfiles);
  const [filter, setFilter] = useState('all');

  const filteredProfiles = useMemo(() => {
    if (filter === 'all') return profiles;
    return profiles.filter((p) => p.type === filter);
  }, [profiles, filter]);

  const counts = useMemo(() => ({
    all: profiles.length,
    match: profiles.filter((p) => p.type === 'match').length,
    like_received: profiles.filter((p) => p.type === 'like_received').length,
    like_sent: profiles.filter((p) => p.type === 'like_sent').length,
    superlike_received: profiles.filter((p) => p.type === 'superlike_received').length,
    superlike_sent: profiles.filter((p) => p.type === 'superlike_sent').length,
  }), [profiles]);

  const handleAction = (id: number, name: string, action: 'like' | 'pass' | 'chat') => {
    if (action === 'chat') {
      toast.success(`Ouverture de la conversation avec ${name}`, { position: 'top-right', duration: 2000 });
      router.push(APP_ROUTES.customer.coversations);
      return;
    }
    if (action === 'like') {
      toast.success(`C'est un match avec ${name} !`, { position: 'top-right', duration: 2000 });
    } else {
      toast.error('Profil ignoré', { position: 'top-right', duration: 2000 });
    }
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="flex flex-1 flex-col w-full overflow-y-auto">
      <div className="px-4 lg:px-6 py-4">
        <BreadcrumbDemo />
      </div>
      <div className="px-4 lg:px-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ThumbsUp className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
            <h1 className="text-2xl sm:text-3xl font-bold">Likes & Coup de cœur</h1>
          </div>
        </div>

        {/* Filtre Select + icone */}
        <div className="flex items-center gap-3 mb-6">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-muted-foreground">Filtre</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    {opt.label} ({counts[opt.value as keyof typeof counts]})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grille */}
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onAction={(action) => handleAction(profile.id, profile.name, action)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-xl font-bold mb-2">Aucun résultat</h2>
            <p className="text-muted-foreground">
              Aucun profil ne correspond à ce filtre pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
