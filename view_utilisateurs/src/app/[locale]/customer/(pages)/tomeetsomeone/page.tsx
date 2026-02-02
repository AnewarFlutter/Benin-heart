'use client';

import { TinderCard } from "@/components/tinder-card";
import { toast } from "sonner";
import { useState } from "react";
import { BreadcrumbDemo } from "../_components/breadcrumb";


export default function TomeetsomeonePage() {
  const initialProfiles = [
    {
      id: 1,
      images: [
        "https://i.pravatar.cc/400?img=1",
        "https://i.pravatar.cc/400?img=2",
        "https://i.pravatar.cc/400?img=3",
      ],
      name: "Marie, 25 ans",
      bio: "Passionnée de voyages et de photographie. J'adore découvrir de nouvelles cultures et cuisines. Toujours partante pour une aventure spontanée !",
      job: "Designer graphique",
      location: "Paris, France",
      interests: ["Voyages", "Photographie", "Cuisine", "Yoga", "Musique"],
    },
    {
      id: 2,
      images: [
        "https://i.pravatar.cc/400?img=5",
        "https://i.pravatar.cc/400?img=6",
      ],
      name: "Sophie, 28 ans",
      bio: "Amoureuse des livres et du café. Je passe mes week-ends dans les librairies et les cafés parisiens.",
      job: "Éditrice",
      location: "Lyon, France",
      interests: ["Lecture", "Café", "Écriture", "Cinéma"],
    },
    {
      id: 3,
      images: [
        "https://i.pravatar.cc/400?img=9",
        "https://i.pravatar.cc/400?img=10",
        "https://i.pravatar.cc/400?img=11",
        "https://i.pravatar.cc/400?img=12",
      ],
      name: "Julie, 26 ans",
      bio: "Sportive et dynamique ! Je cours des marathons et j'adore les sports extrêmes. La vie est trop courte pour rester immobile.",
      job: "Coach sportive",
      location: "Marseille, France",
      interests: ["Running", "Fitness", "Escalade", "Surf", "Nutrition"],
    },
    {
      id: 4,
      images: [
        "https://i.pravatar.cc/400?img=13",
        "https://i.pravatar.cc/400?img=14",
      ],
      name: "Camille, 27 ans",
      bio: "Développeuse passionnée par la tech et l'innovation. J'aime créer des solutions qui changent la vie des gens.",
      job: "Développeuse Full Stack",
      location: "Toulouse, France",
      interests: ["Tech", "Gaming", "IA", "Randonnée"],
    },
    {
      id: 5,
      images: [
        "https://i.pravatar.cc/400?img=16",
        "https://i.pravatar.cc/400?img=17",
        "https://i.pravatar.cc/400?img=18",
      ],
      name: "Léa, 24 ans",
      bio: "Artiste dans l'âme. Je peins, je dessine et j'explore le monde de l'art contemporain. Cherche quelqu'un pour partager mes expositions préférées.",
      job: "Artiste peintre",
      location: "Bordeaux, France",
      interests: ["Art", "Peinture", "Musées", "Design", "Théâtre"],
    },
    {
      id: 6,
      images: [
        "https://i.pravatar.cc/400?img=20",
        "https://i.pravatar.cc/400?img=21",
      ],
      name: "Emma, 29 ans",
      bio: "Chef pâtissière avec une passion pour les créations sucrées. J'adore expérimenter de nouvelles recettes et partager mes desserts.",
      job: "Chef pâtissière",
      location: "Nice, France",
      interests: ["Pâtisserie", "Gastronomie", "Voyages culinaires"],
    },
    {
      id: 7,
      images: [
        "https://i.pravatar.cc/400?img=23",
        "https://i.pravatar.cc/400?img=24",
        "https://i.pravatar.cc/400?img=25",
      ],
      name: "Chloé, 26 ans",
      bio: "Médecin passionnée par mon métier. J'aime aider les autres et faire une différence dans la vie des gens.",
      job: "Médecin généraliste",
      location: "Nantes, France",
      interests: ["Médecine", "Lecture", "Danse", "Nature"],
    },
    {
      id: 8,
      images: [
        "https://i.pravatar.cc/400?img=26",
        "https://i.pravatar.cc/400?img=27",
      ],
      name: "Manon, 23 ans",
      bio: "Étudiante en architecture avec un amour pour le design moderne. Je rêve de créer des espaces qui inspirent.",
      job: "Étudiante en architecture",
      location: "Strasbourg, France",
      interests: ["Architecture", "Design", "Photo", "Voyages"],
    },
    {
      id: 9,
      images: [
        "https://i.pravatar.cc/400?img=28",
        "https://i.pravatar.cc/400?img=29",
        "https://i.pravatar.cc/400?img=30",
      ],
      name: "Laura, 30 ans",
      bio: "Avocate spécialisée en droit international. Passionnée par la justice et les voyages. Toujours prête pour un débat intellectuel !",
      job: "Avocate",
      location: "Paris, France",
      interests: ["Droit", "Voyages", "Débats", "Histoire", "Vin"],
    },
    {
      id: 10,
      images: [
        "https://i.pravatar.cc/400?img=31",
        "https://i.pravatar.cc/400?img=32",
      ],
      name: "Sarah, 25 ans",
      bio: "Influenceuse mode et lifestyle. J'adore la mode, la beauté et partager mes découvertes avec ma communauté.",
      job: "Influenceuse",
      location: "Cannes, France",
      interests: ["Mode", "Beauté", "Shopping", "Réseaux sociaux"],
    },
    {
      id: 11,
      images: [
        "https://i.pravatar.cc/400?img=33",
        "https://i.pravatar.cc/400?img=34",
        "https://i.pravatar.cc/400?img=35",
      ],
      name: "Océane, 27 ans",
    },
    {
      id: 12,
      images: [
        "https://i.pravatar.cc/400?img=36",
        "https://i.pravatar.cc/400?img=37",
      ],
      name: "Amélie, 26 ans",
    },
    {
      id: 13,
      images: [
        "https://i.pravatar.cc/400?img=38",
        "https://i.pravatar.cc/400?img=39",
        "https://i.pravatar.cc/400?img=40",
      ],
      name: "Clara, 24 ans",
    },
    {
      id: 14,
      images: [
        "https://i.pravatar.cc/400?img=41",
        "https://i.pravatar.cc/400?img=42",
      ],
      name: "Pauline, 28 ans",
    },
    {
      id: 15,
      images: [
        "https://i.pravatar.cc/400?img=43",
        "https://i.pravatar.cc/400?img=44",
        "https://i.pravatar.cc/400?img=45",
      ],
      name: "Juliette, 25 ans",
    },
    {
      id: 16,
      images: [
        "https://i.pravatar.cc/400?img=46",
        "https://i.pravatar.cc/400?img=47",
      ],
      name: "Lucie, 29 ans",
    },
    {
      id: 17,
      images: [
        "https://i.pravatar.cc/400?img=48",
        "https://i.pravatar.cc/400?img=49",
        "https://i.pravatar.cc/400?img=1",
      ],
      name: "Alice, 27 ans",
    },
    {
      id: 18,
      images: [
        "https://i.pravatar.cc/400?img=2",
        "https://i.pravatar.cc/400?img=3",
      ],
      name: "Inès, 23 ans",
    },
    {
      id: 19,
      images: [
        "https://i.pravatar.cc/400?img=4",
        "https://i.pravatar.cc/400?img=5",
        "https://i.pravatar.cc/400?img=6",
      ],
      name: "Charlotte, 26 ans",
    },
    {
      id: 20,
      images: [
        "https://i.pravatar.cc/400?img=7",
        "https://i.pravatar.cc/400?img=8",
      ],
      name: "Mathilde, 24 ans",
    },
  ];

  const [profiles, setProfiles] = useState(initialProfiles);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      toast.success("Intéressé !", {
        position: "top-right",
        duration: 2000,
      });
    } else {
      toast.error("Pas intéressé", {
        position: "top-right",
        duration: 2000,
      });
    }

    // Retirer le premier profil après un court délai
    setTimeout(() => {
      setProfiles((prev) => prev.slice(1));
    }, 300);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black overflow-hidden">
      <div className="px-4 lg:px-6 py-4">
        <BreadcrumbDemo />
      </div>
      <div className="flex flex-1 w-full items-center justify-center overflow-hidden">
        {profiles.length > 0 ? (
        <div className="relative h-[calc(100dvh-180px)] w-[calc(100vw-32px)] max-w-[400px] sm:h-[530px] sm:w-[320px]">
          {profiles.slice(0, 3).reverse().map((profile, index) => (
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
            Veuillez discuter avec les profils likés dans votre section message ou discuter avec les profils qui vous ont liké.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}