'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/shared/constants/routes';
import { APP_IMAGES } from '@/shared/constants/images';

interface BannerSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  cta?: {
    text: string;
    href: string;
  };
}

const defaultSlides: BannerSlide[] = [
  {
    id: 1,
    title: 'Trouvez l\'Amour Authentique',
    description: 'Rencontrez des personnes qui partagent vos valeurs et vos passions',
    image: APP_IMAGES.heroCarousel.slide1,
    cta: {
      text: 'Commencer maintenant',
      href: APP_ROUTES.auth.register
    }
  },
  {
    id: 2,
    title: 'Des Rencontres Sérieuses',
    description: 'Construisez une relation durable avec la bonne personne',
    image: APP_IMAGES.heroCarousel.slide2,
    cta: {  
      text: 'Découvrir nos abonnements',
      href: APP_ROUTES.home.abonnements
    }
  },
  {
    id: 3,
    title: 'Votre Âme Sœur Vous Attend',
    description: 'Des milliers de célibataires cherchent l\'amour comme vous',
    image: APP_IMAGES.heroCarousel.slide3,
    cta: {
      text: 'Rejoignez-nous',
      href: APP_ROUTES.auth.register
    }
  }
];

export default function HeroBannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const router = useRouter();

  const slides = defaultSlides;

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="w-full py-4 md:py-8 px-4">
      {/* Container avec largeur limitee */}
      <div className="relative w-full md:max-w-[90rem] md:mx-auto rounded-xl overflow-hidden shadow-2xl">
        {/* Slides */}
        <div className="relative h-[320px] md:h-[420px]">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Image de fond */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                {/* Overlay sombre */}
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Contenu */}
              <div className="relative h-full flex items-center justify-center text-center px-6 md:px-8">
                <div className="max-w-3xl w-full">
                  <h1 className="text-3xl md:text-6xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-base md:text-2xl text-white/90 mb-6 md:mb-8 drop-shadow-md">
                    {slide.description}
                  </p>
                  {slide.cta && (
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg shadow-xl"
                      onClick={() => router.push(slide.cta!.href)}
                    >
                      {slide.cta.text}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Boutons de navigation */}
        <button
          onClick={goToPrevious}
          className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-1.5 md:p-2 rounded-full transition-all"
          aria-label="Slide precedent"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-1.5 md:p-2 rounded-full transition-all"
          aria-label="Slide suivant"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Indicateurs */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 w-2 hover:bg-white/75'
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
