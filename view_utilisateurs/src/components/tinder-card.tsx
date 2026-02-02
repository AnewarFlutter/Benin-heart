"use client";

import { motion, useMotionValue, useTransform, PanInfo, MotionStyle } from "framer-motion";
import { useState } from "react";
import { Info, Heart, X, MessageCircle, Star } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface TinderCardProps {
  profile: {
    id: number;
    images: string[];
    name: string;
    age?: number;
    bio?: string;
    location?: string;
    interests?: string[];
    job?: string;
  };
  onSwipe: (direction: "left" | "right") => void;
  style?: MotionStyle;
  isActive?: boolean;
}

export function TinderCard({ profile, onSwipe, style, isActive = true }: TinderCardProps) {
  const [exitX, setExitX] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      // Swipe détecté
      const direction = info.offset.x > 0 ? "right" : "left";
      setExitX(info.offset.x > 0 ? 1000 : -1000);
      onSwipe(direction);
    }
  };

  const handleImageNavigation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const cardWidth = rect.width;

    if (clickX < cardWidth / 2) {
      // Clic à gauche - image précédente
      setCurrentImageIndex((prev) =>
        prev > 0 ? prev - 1 : prev
      );
    } else {
      // Clic à droite - image suivante
      setCurrentImageIndex((prev) =>
        prev < profile.images.length - 1 ? prev + 1 : prev
      );
    }
  };

  const handleButtonAction = (direction: "left" | "right", e: React.MouseEvent) => {
    e.stopPropagation();
    setExitX(direction === "right" ? 1000 : -1000);
    onSwipe(direction);
  };

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        ...style,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      transition={{ duration: 0.3 }}
      className="absolute cursor-grab active:cursor-grabbing"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="relative h-[550px] w-[360px] sm:h-[450px] sm:w-[320px] overflow-hidden rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl"
          onClick={handleImageNavigation}
        >
        {/* Indicateurs de photos stylisés */}
        <div className="absolute top-3 left-3 right-3 z-10 flex gap-1.5">
          {profile.images.map((_, index) => (
            <div
              key={index}
              className="h-1 flex-1 rounded-full bg-black/20 backdrop-blur-sm overflow-hidden shadow-sm"
            >
              <motion.div
                initial={false}
                animate={{
                  width: index === currentImageIndex ? "100%" : "0%",
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full bg-white shadow-lg"
              />
            </div>
          ))}
        </div>

        {/* Image avec animation */}
        <motion.img
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={profile.images[currentImageIndex]}
          alt={`${profile.name} - Photo ${currentImageIndex + 1}`}
          className="h-full w-full object-cover"
          draggable={false}
        />

        {/* Gradient overlay amélioré */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/20" />

        {/* Informations du profil avec style amélioré */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 z-20">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                {profile.name}
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInfoOpen(true);
                }}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors relative z-30"
              >
                <Info className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {profile.images.length > 1 && (
                  <span className="text-xs text-white/80 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    {profile.images.length} photos
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Indicateurs de navigation gauche/droite */}
        <div className="absolute inset-y-0 left-0 w-1/2 z-0 hover:bg-white/5 transition-colors" />
        <div className="absolute inset-y-0 right-0 w-1/2 z-0 hover:bg-white/5 transition-colors" />
        </div>

        {/* Boutons d'action en bas de la carte */}
        {isActive && <div className="flex items-center justify-center gap-3 px-4 relative z-50">
          {/* Bouton Passer (X) */}
          <button
            onClick={(e) => handleButtonAction("right", e)}
            className="group relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-500 bg-white dark:bg-gray-900 shadow-lg transition-all hover:scale-110 hover:bg-red-500 active:scale-95"
          >
            <X className="h-5 w-5 text-red-500 transition-colors group-hover:text-white" />
          </button>

          {/* Bouton Super Like (Étoile) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Action super like
            }}
            className="group relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-500 bg-white dark:bg-gray-900 shadow-lg transition-all hover:scale-110 hover:bg-blue-500 active:scale-95"
          >
            <Star className="h-5 w-5 text-blue-500 transition-colors group-hover:text-white" />
          </button>

          {/* Bouton Like (Cœur) */}
          <button
            onClick={(e) => handleButtonAction("left", e)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-pink-500 bg-white dark:bg-gray-900 shadow-lg transition-all hover:scale-110 hover:bg-pink-500 active:scale-95"
          >
            <Heart className="h-6 w-6 text-pink-500 transition-colors group-hover:text-white group-hover:fill-white" />
          </button>
        </div>}
      </div>

      {/* Modal d'informations du profil */}
      <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-2xl">{profile.name}</SheetTitle>
            <SheetDescription>Informations du profil</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6 flex-1 overflow-y-auto">
            {/* Images carousel */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Photos</h3>
              <div className="grid grid-cols-3 gap-2">
                {profile.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">À propos</h3>
                <p className="text-sm">{profile.bio}</p>
              </div>
            )}

            {/* Job */}
            {profile.job && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Profession</h3>
                <p className="text-sm">{profile.job}</p>
              </div>
            )}

            {/* Location */}
            {profile.location && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Localisation</h3>
                <p className="text-sm">{profile.location}</p>
              </div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Centres d'intérêt</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="border-t pt-4 mt-4 space-y-3">
            <Button
              onClick={() => {
                setIsInfoOpen(false);
                // Action d'envoi de message
              }}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Envoyer un message
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => {
                  setIsInfoOpen(false);
                  onSwipe("left");
                }}
                className="bg-pink-500 hover:bg-pink-600 text-white"
                size="lg"
              >
                <Heart className="mr-2 h-5 w-5" />
                Liker
              </Button>

              <Button
                onClick={() => {
                  setIsInfoOpen(false);
                  onSwipe("right");
                }}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                size="lg"
              >
                <X className="mr-2 h-5 w-5" />
                Passer
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
