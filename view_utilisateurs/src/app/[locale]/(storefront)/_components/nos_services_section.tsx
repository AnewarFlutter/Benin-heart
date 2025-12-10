'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/shared/constants/routes';
import {
  Heart,
  Star,
  Crown,
  Clock,
  ShoppingCart,
  Check,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  price: string;
  duration: string;
  features: string[];
  excludedFeatures?: string[];
  popular?: boolean;
  href: string;
}

const services: Service[] = [
  {
    id: 'gratuit',
    title: 'Plan Gratuit',
    description: 'Découvrez l\'application et commencez à faire des rencontres avec les fonctionnalités de base.',
    icon: <Heart className="h-5 w-5 sm:h-6 sm:w-6" />,
    price: 'Gratuit',
    duration: 'À vie',
    features: [
      '5 likes par jour',
      'Voir les profils à proximité',
      'Messagerie limitée',
      'Création de profil'
    ],
    excludedFeatures: [
      'Likes illimités',
      'Voir qui vous a liké',
      'Messages prioritaires',
      'Filtres avancés',
      'Mode invisible'
    ],
    href: '/abonnements/gratuit'
  },
  {
    id: 'premium',
    title: 'Plan Premium',
    description: 'Boostez vos chances de rencontrer l\'âme sœur avec des fonctionnalités avancées.',
    icon: <Star className="h-5 w-5 sm:h-6 sm:w-6" />,
    price: '14,99€ / mois',
    duration: 'Mensuel',
    features: [
      'Likes illimités',
      'Voir qui vous a liké',
      'Messages prioritaires',
      '5 Super Likes par semaine',
      'Filtres de recherche avancés',
      'Aucune publicité'
    ],
    excludedFeatures: [
      'Mode invisible',
      'Boost mensuel gratuit',
      'Lecture des messages',
      'Support prioritaire VIP'
    ],
    popular: true,
    href: '/abonnements/premium'
  },
  {
    id: 'vip',
    title: 'Plan VIP Elite',
    description: 'L\'expérience ultime avec un accès complet à toutes les fonctionnalités exclusives.',
    icon: <Crown className="h-5 w-5 sm:h-6 sm:w-6" />,
    price: '29,99€ / mois',
    duration: 'Mensuel',
    features: [
      'Tout du plan Premium',
      'Mode invisible',
      'Super Likes illimités',
      '2 Boost gratuits par mois',
      'Voir les lectures de messages',
      'Badge VIP sur votre profil',
      'Support prioritaire 24/7',
      'Accès anticipé aux nouvelles fonctionnalités'
    ],
    excludedFeatures: [],
    href: '/abonnements/vip'
  }
];

interface NosServicesSectionProps {
  onServiceClick?: (serviceId: string) => void;
  onViewAllClick?: () => void;
  onAddToCart?: (service: Service) => void;
}

export default function NosServicesSection({ 
  onServiceClick, 
  onViewAllClick,
  onAddToCart 
}: NosServicesSectionProps) {
  const router = useRouter();

  const handleServiceClick = (service: Service) => {
    console.log('Abonnement sélectionné:', service.id);
    if (service.id === 'gratuit') {
      router.push(APP_ROUTES.auth.register);
    } else {
      router.push(`${APP_ROUTES.checkout.root}?plan=${service.id}`);
    }
    onServiceClick?.(service.id);
  };

  const handleAddToCart = (service: Service, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Souscrire à l\'abonnement:', service.id);
    if (service.id === 'gratuit') {
      router.push(APP_ROUTES.auth.register);
    } else {
      router.push(`${APP_ROUTES.checkout.root}?plan=${service.id}`);
    }
    onAddToCart?.(service);
  };

    const handleDevisClick = () => {
      router.push(APP_ROUTES.auth.register);
    };

    const handleViewAllServices = () => {
      // Navigation vers la page de comparaison des abonnements
      console.log('Comparer les abonnements');
      router.push(APP_ROUTES.home.abonnements);
    };

  return (
    <section id="nos-services" className="py-8 md:py-16 px-3 sm:px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl">
        {/* En-tête de section */}
        <div className="text-center mb-8 md:mb-12">
          <Badge variant="outline" className="mb-3 md:mb-4 text-xs sm:text-sm">
            Nos Abonnements
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 px-2">
            Choisissez votre plan et trouvez l'amour
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            {"Découvrez nos formules d'abonnement conçues pour maximiser vos chances de rencontrer la personne idéale. Du plan gratuit au VIP Elite, trouvez l'option qui vous correspond."}
          </p>
        </div>

        {/* Grille d'abonnements - Optimisée mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 md:mb-12">
          {services.map((service) => (
            <Card
              key={service.id}
              className={`relative group hover:shadow-lg transition-all duration-300 cursor-pointer border h-full flex flex-col ${
                service.popular
                  ? 'border-primary shadow-md ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleServiceClick(service)}
            >
              {/* Badge populaire - Ajusté pour mobile */}
              {service.popular && (
                <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground px-2 sm:px-3 py-0.5 sm:py-1 text-xs">
                    Plus populaire
                  </Badge>
                </div>
              )}

              <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
                {/* Icône et titre - Layout adaptatif */}
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${
                    service.popular
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
                  } transition-colors duration-300`}>
                    {service.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold mb-1 leading-tight">
                      {service.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{service.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Description - Taille adaptative */}
                <p className="text-muted-foreground mb-2 sm:mb-3 text-xs sm:text-sm line-clamp-2">
                  {service.description}
                </p>

                {/* Fonctionnalités incluses - Avec icône Check */}
                <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <span className="leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Fonctionnalités exclues - Avec icône X */}
                {service.excludedFeatures && service.excludedFeatures.length > 0 && (
                  <div className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4 pt-2 border-t border-dashed">
                    <p className="text-xs text-muted-foreground mb-1">Non inclus :</p>
                    {service.excludedFeatures.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground/80">
                        <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span className="leading-tight line-through">{feature}</span>
                      </div>
                    ))}
                    {service.excludedFeatures.length > 3 && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground/60">
                        <X className="w-3.5 h-3.5 text-red-400/60 flex-shrink-0" />
                        <span>+{service.excludedFeatures.length - 3} autres restrictions</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Prix et bouton - Layout mobile optimisé */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 pt-2 sm:pt-3 border-t mt-auto">
                  {/* Prix - Toujours en premier sur mobile et desktop */}
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-primary">
                      {service.price}
                    </p>
                  </div>
                  {/* Bouton - Toujours en second */}
                  <Button
                    variant={service.popular ? "default" : "outline"}
                    size="sm"
                    className="group/btn w-full sm:w-auto text-xs h-8"
                    onClick={(e) => handleAddToCart(service, e)}
                  >
                    <span>{service.price === 'Gratuit' ? 'Commencer' : 'S\'abonner'}</span>
                    <ShoppingCart className="h-3 w-3 ml-1.5 group-hover/btn:scale-110 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section call-to-action - Mobile responsive */}
        <div className="text-center">
          <div className="bg-muted/50 rounded-lg p-6 sm:p-8 border mx-2 sm:mx-0">
            <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              {"Vous hésitez encore ?"}
            </h3>
            <p className="text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
              {"Commencez gratuitement et découvrez comment notre plateforme peut vous aider à rencontrer des personnes exceptionnelles. Passez au Premium quand vous serez prêt !"}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
              <Button
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? "default" : "lg"}
                onClick={handleViewAllServices}
                className="px-6 sm:px-8 text-sm sm:text-base"
              >
                Comparer les abonnements
              </Button>
              <Button
                variant="outline"
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? "default" : "lg"}
                className="px-6 sm:px-8 text-sm sm:text-base"
                onClick={handleDevisClick}
              >
                Essayer gratuitement
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}