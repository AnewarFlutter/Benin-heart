'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { APP_ROUTES } from '@/shared/constants/routes';
import { Heart, Star, Crown, Clock, Check, X, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { featuresDi } from '@/di/features_di';
import { EntityPlan } from '@/modules/beninheart/abonnement/plan/domain/entities/entity_plan';

const ICONE_MAP: Record<string, React.ReactNode> = {
  heart: <Heart className="h-6 w-6" />,
  star: <Star className="h-6 w-6" />,
  crown: <Crown className="h-6 w-6" />,
};

export default function AbonnementsPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<EntityPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    featuresDi.planController.getPlans()
      .then((data) => setPlans(data))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = (plan: EntityPlan) => {
    if (plan.prix === '0.00' || plan.prixAffiche?.toLowerCase().includes('gratuit')) {
      router.push(APP_ROUTES.auth.register);
    } else {
      router.push(`${APP_ROUTES.checkout.root}?plan=${plan.slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16 md:auto-rows-fr">
              {plans.map((plan) => (
                <Card
                  key={plan.uuid}
                  className={`relative group hover:shadow-2xl transition-all duration-300 border h-full flex flex-col ${
                    plan.estPopulaire
                      ? 'border-primary shadow-xl ring-2 ring-primary/30'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {plan.estPopulaire && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-semibold">
                        🔥 Plus populaire
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-6 md:p-8 flex flex-col flex-1">
                    <div className="text-center mb-6">
                      <div className={`inline-flex p-4 rounded-2xl mb-4 ${
                        plan.estPopulaire
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {ICONE_MAP[plan.icone ?? ''] ?? <Heart className="h-6 w-6" />}
                      </div>
                      <h2 className="text-2xl font-bold mb-2">{plan.titre}</h2>
                      <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                        <Clock className="h-4 w-4" />
                        <span>{plan.duree}</span>
                      </div>
                      <div className="mb-6">
                        <p className="text-4xl font-bold text-primary mb-1">
                          {plan.prixAffiche?.split('/')[0]}
                        </p>
                        {plan.prixAffiche?.includes('/') && (
                          <p className="text-sm text-muted-foreground">
                            par {plan.prixAffiche.split('/')[1]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 mb-6 flex-1 min-h-[200px]">
                      <div className="space-y-3">
                        <p className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                          Fonctionnalités incluses
                        </p>
                        {(plan.fonctionnalites ?? []).map((f, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm leading-relaxed">{f}</span>
                          </div>
                        ))}
                      </div>

                      {(plan.fonctionnalitesExclues ?? []).length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-dashed">
                          <p className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                            Non inclus
                          </p>
                          {(plan.fonctionnalitesExclues ?? []).map((f, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground line-through leading-relaxed">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      size="lg"
                      variant={plan.estPopulaire ? 'default' : 'outline'}
                      className="w-full group/btn"
                      onClick={() => handleSubscribe(plan)}
                    >
                      <span>{plan.prix === '0.00' ? 'Commencer' : "S'abonner"}</span>
                      <ArrowRight className="h-5 w-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="bg-muted/50 rounded-2xl p-8 md:p-12 border">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Vous hésitez encore ?</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Commencez gratuitement et découvrez comment notre plateforme peut vous aider
                à rencontrer des personnes exceptionnelles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => router.push(APP_ROUTES.auth.register)}>
                  Essayer gratuitement
                </Button>
                <Button variant="outline" size="lg" onClick={() => router.push(APP_ROUTES.home.faq)}>
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
