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
  Check,
  X,
  ArrowRight
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
    icon: <Heart className="h-6 w-6" />,
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
    icon: <Star className="h-6 w-6" />,
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
    icon: <Crown className="h-6 w-6" />,
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

export default function AbonnementsPage() {
  const router = useRouter();

  const handleSubscribe = (service: Service) => {
    console.log('Souscrire à l\'abonnement:', service.id);
    if (service.id === 'gratuit') {
      router.push(APP_ROUTES.auth.register);
    } else {
      router.push(`${APP_ROUTES.checkout.root}?plan=${service.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4 text-sm">
              Nos Abonnements
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Trouvez le plan parfait pour vous
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Que vous débutiez ou que vous recherchiez une expérience premium,
              nous avons un plan adapté à vos besoins pour trouver l'amour.
            </p>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 md:auto-rows-fr">
            {services.map((service) => (
              <Card
                key={service.id}
                className={`relative group hover:shadow-2xl transition-all duration-300 border h-full flex flex-col ${
                  service.popular
                    ? 'border-primary shadow-xl ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {/* Badge populaire */}
                {service.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-semibold">
                      🔥 Plus populaire
                    </Badge>
                  </div>
                )}

                <CardContent className="p-6 md:p-8 flex flex-col flex-1">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-4 rounded-2xl mb-4 ${
                      service.popular
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {service.icon}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{service.title}</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration}</span>
                    </div>
                    <div className="mb-6">
                      <p className="text-4xl font-bold text-primary mb-1">
                        {service.price.split('/')[0]}
                      </p>
                      {service.price.includes('/') && (
                        <p className="text-sm text-muted-foreground">
                          par {service.price.split('/')[1]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-6 flex-1 min-h-[400px]">
                    <div className="space-y-3">
                      <p className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                        Fonctionnalités incluses
                      </p>
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {service.excludedFeatures && service.excludedFeatures.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-dashed">
                        <p className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                          Non inclus
                        </p>
                        {service.excludedFeatures.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground line-through leading-relaxed">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    variant={service.popular ? "default" : "outline"}
                    className="w-full group/btn"
                    onClick={() => handleSubscribe(service)}
                  >
                    <span>{service.price === 'Gratuit' ? 'Commencer' : 'S\'abonner'}</span>
                    <ArrowRight className="h-5 w-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="bg-muted/50 rounded-2xl p-8 md:p-12 border">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Vous hésitez encore ?
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Commencez gratuitement et découvrez comment notre plateforme peut vous aider
                à rencontrer des personnes exceptionnelles. Vous pourrez toujours passer au
                Premium ou VIP quand vous serez prêt !
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push(APP_ROUTES.auth.register)}
                >
                  Essayer gratuitement
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push(APP_ROUTES.home.faq)}
                >
                  Voir la FAQ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
