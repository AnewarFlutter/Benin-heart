'use client';

import { useState, useMemo, useEffect } from 'react';
import { ThumbsUp, Heart, X, Star, MessageCircle, SlidersHorizontal, Filter, CheckCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { BreadcrumbDemo } from '../_components/breadcrumb';
import { APP_ROUTES } from '@/shared/constants/routes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMatchsAction, getMesLikesAction, swipeAction } from '@/actions/beninheart/like/actions';
import { EntityMatch } from '@/modules/beninheart/like/like/domain/entities/entity_like';

type ProfileType = 'match' | 'like_received';

interface Profile {
  uuid: string;
  prenom: string;
  photo: string | null;
  type: ProfileType;
}

const filterOptions: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'Tout', icon: <Filter className="h-4 w-4" /> },
  { value: 'match', label: 'Matchs', icon: <CheckCheck className="h-4 w-4 text-green-500" /> },
  { value: 'like_received', label: 'Likes reçus', icon: <Heart className="h-4 w-4 text-pink-500" /> },
];

function getBadge(type: ProfileType) {
  if (type === 'match') {
    return <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-semibold shadow">Match</div>;
  }
  return <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-semibold shadow">Like reçu</div>;
}

function ProfileCard({ profile, onAction }: { profile: Profile; onAction: (action: 'like' | 'pass' | 'chat') => void }) {
  const isLikeReceived = profile.type === 'like_received';

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
      <div className="aspect-[3/4] relative">
        {profile.photo ? (
          <img src={profile.photo} alt={profile.prenom} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted text-4xl">💕</div>
        )}
        {getBadge(profile.type)}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm sm:text-base font-semibold text-white truncate">{profile.prenom}</h3>
        </div>
      </div>
      <div className="flex items-center gap-2 p-2">
        {isLikeReceived ? (
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

function toProfile(match: EntityMatch, type: ProfileType): Profile {
  return {
    uuid: match.uuid ?? '',
    prenom: match.autreUtilisateur?.prenom ?? 'Anonyme',
    photo: match.autreUtilisateur?.photoPrincipale ?? null,
    type,
  };
}

export default function LikesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [matchsRes, likesRes] = await Promise.all([
        getMatchsAction(),
        getMesLikesAction(),
      ]);
      const matchProfiles = matchsRes.success ? (matchsRes.data ?? []).map((m) => toProfile(m, 'match')) : [];
      const likeProfiles = likesRes.success ? (likesRes.data ?? []).map((l) => toProfile(l, 'like_received')) : [];
      setProfiles([...matchProfiles, ...likeProfiles]);
      setLoading(false);
    }
    load();
  }, []);

  const filteredProfiles = useMemo(() => {
    if (filter === 'all') return profiles;
    return profiles.filter((p) => p.type === filter);
  }, [profiles, filter]);

  const counts = useMemo(() => ({
    all: profiles.length,
    match: profiles.filter((p) => p.type === 'match').length,
    like_received: profiles.filter((p) => p.type === 'like_received').length,
  }), [profiles]);

  const handleAction = async (uuid: string, prenom: string, action: 'like' | 'pass' | 'chat') => {
    if (action === 'chat') {
      router.push(APP_ROUTES.customer.coversations);
      return;
    }
    if (action === 'like') {
      const res = await swipeAction(uuid, 'LIKE');
      if (res.success && res.data?.estMatch) {
        toast.success(`C'est un match avec ${prenom} !`);
      } else {
        toast.success(`Like envoyé à ${prenom}`);
      }
    } else {
      await swipeAction(uuid, 'DISLIKE');
      toast.error('Profil ignoré');
    }
    setProfiles((prev) => prev.filter((p) => p.uuid !== uuid));
  };

  return (
    <div className="flex flex-1 flex-col w-full overflow-y-auto">
      <div className="px-4 lg:px-6 py-4">
        <BreadcrumbDemo />
      </div>
      <div className="px-4 lg:px-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ThumbsUp className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />
            <h1 className="text-2xl sm:text-3xl font-bold">Likes & Matchs</h1>
          </div>
        </div>

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
                    {opt.label} ({counts[opt.value as keyof typeof counts] ?? 0})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.uuid}
                profile={profile}
                onAction={(action) => handleAction(profile.uuid, profile.prenom, action)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-xl font-bold mb-2">Aucun résultat</h2>
            <p className="text-muted-foreground">Aucun profil ne correspond à ce filtre pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
