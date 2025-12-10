'use client';

import { useState } from 'react';
import { X, Megaphone } from 'lucide-react';

interface PromoBannerProps {
  hasPromotion?: boolean;
  promotionText?: string;
}

export default function PromoBanner({
  hasPromotion = true,
  promotionText = "Offre spéciale : -20% sur l'abonnement Premium avec le code AMOUR20 !"
}: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!hasPromotion || !isVisible) {
    return null;
  }

  return (
    <div className="w-full bg-black dark:bg-white text-white dark:text-black">
      <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-4 relative">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 dark:bg-black/20 rounded-full p-2">
            <Megaphone className="h-5 w-5" />
          </div>
          <p className="text-sm md:text-base font-medium">
            {promotionText}
          </p>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 hover:bg-white/20 dark:hover:bg-black/20 rounded-full p-1 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
