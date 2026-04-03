'use client';

import { TinderCard } from "@/components/tinder-card";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { BreadcrumbDemo } from "../_components/breadcrumb";
import { Loader2 } from "lucide-react";
import { featuresDi } from "@/di/features_di";
import { EntityProfilPublic } from "@/modules/beninheart/profil/profil/domain/entities/entity_profil";
import { TypeSwipe } from "@/modules/beninheart/like/like/domain/entities/entity_like";

export default function TomeetsomeonePage() {
  const [profiles, setProfiles] = useState<EntityProfilPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    featuresDi.profilController.getProfils()
      .then((data) => setProfiles(data))
      .catch(() => toast.error("Impossible de charger les profils."))
      .finally(() => setLoading(false));
  }, []);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (profiles.length === 0) return;

    const currentProfile = profiles[0];
    const typeAction: TypeSwipe = direction === 'right' ? 'LIKE' : 'DISLIKE';

    setProfiles((prev) => prev.slice(1));

    const result = await featuresDi.likeController.swipe(currentProfile.uuid!, typeAction);

    if (result?.estMatch) {
      toast.success(`💕 C'est un match avec ${currentProfile.prenom} !`, {
        duration: 4000,
        position: 'top-center',
      });
    } else if (direction === 'right') {
      toast.success(`Vous avez liké ${currentProfile.prenom} !`, {
        position: 'top-right',
        duration: 1500,
      });
    }
  };

  const handleSuperlike = async () => {
    if (profiles.length === 0) return;

    const currentProfile = profiles[0];
    setProfiles((prev) => prev.slice(1));

    const result = await featuresDi.likeController.swipe(currentProfile.uuid!, 'SUPERLIKE');

    if (result?.estMatch) {
      toast.success(`💕 Super Match avec ${currentProfile.prenom} !`, {
        duration: 4000,
        position: 'top-center',
      });
    } else {
      toast.success(`⭐ Super Like envoyé à ${currentProfile.prenom} !`, {
        position: 'top-right',
        duration: 2000,
      });
    }
  };

  const adaptedProfiles = profiles.map((p) => ({
    id: p.uuid!,
    images: [
      ...(p.photoPrincipale ? [p.photoPrincipale] : []),
      ...(p.photos ?? []).filter((ph) => !ph.estPrincipale).map((ph) => ph.image!),
    ],
    name: `${p.prenom}, ${p.age} ans`,
    bio: p.bio ?? undefined,
    location: (p.ville ? `${p.ville}, ${p.pays}` : p.pays) ?? undefined,
    interests: [] as string[],
  }));

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black overflow-hidden">
      <div className="px-4 lg:px-6 py-4">
        <BreadcrumbDemo />
      </div>
      <div className="flex flex-1 w-full items-center justify-center overflow-hidden">
        {adaptedProfiles.length > 0 ? (
          <div className="relative h-[calc(100dvh-180px)] w-[calc(100vw-32px)] max-w-[400px] sm:h-[530px] sm:w-[320px]">
            {adaptedProfiles.slice(0, 3).reverse().map((profile, index) => (
              <TinderCard
                key={profile.id}
                profile={profile}
                onSwipe={index === 0 ? handleSwipe : () => {}}
                isActive={index === 0}
                style={{
                  zIndex: 3 - index,
                  scale: 1 - index * 0.05,
                  y: index * -10,
                  opacity: 1 - index * 0.15,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-4 sm:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg max-w-md mx-4">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Plus de profils disponibles pour le moment</h2>
            <p className="text-muted-foreground">
              Revenez plus tard ou consultez vos matchs dans la section messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
