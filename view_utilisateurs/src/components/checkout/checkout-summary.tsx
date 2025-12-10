'use client';

import { Package, QrCode, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ShoeItem {
  id: string;
  name: string;
  services: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
}

export interface CheckoutSummaryProps {
  shoes: ShoeItem[];
  maxDuration: string;
  checkoutButtonText?: string;
  onCheckout?: () => void;
  className?: string;
}

export function CheckoutSummary({
  shoes,
  maxDuration,
  checkoutButtonText,
  onCheckout,
  className,
}: CheckoutSummaryProps) {
  // Calculate totals
  const totalPairs = shoes.length;
  const allServices = shoes.flatMap(shoe => shoe.services);
  const totalServices = allServices.length;
  const subtotal = allServices.reduce((sum, service) => sum + service.price, 0);

  return (
    <div className={cn('flex flex-col gap-5 rounded-xl border border-border bg-card p-5', className)}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Récapitulatif</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Détails de votre commande
        </p>
      </div>

      {/* Shoes List */}
      <div className="rounded-lg border border-border bg-background p-4 space-y-3">
        <div className="mb-2 text-sm font-semibold text-foreground">
          Paires de chaussures ({totalPairs})
        </div>
        <div className="space-y-2">
          {shoes.map((shoe) => (
            <div key={shoe.id} className="text-sm text-muted-foreground">
              {shoe.name}
            </div>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="mb-3 text-sm font-semibold text-foreground">
          Services totaux ({totalServices})
        </div>
        <div
          className={cn(
            'space-y-2',
            totalServices >= 4 && 'max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent'
          )}
        >
          {allServices.map((service, index) => (
            <div
              key={`${service.id}-${index}`}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{service.name}</span>
              <span className="font-medium text-foreground">
                {service.price.toLocaleString('fr-FR')}€
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-foreground">Sous-total</span>
          <span className="font-medium text-foreground">{subtotal.toLocaleString('fr-FR')}€</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground">Délai maximum</span>
          <span className="font-medium text-foreground">{maxDuration}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold text-foreground">{subtotal.toLocaleString('fr-FR')}€</span>
        </div>
      </div>

      {/* Commitments */}
      <div className="border-t border-border pt-4">
        <h3 className="mb-3 text-base font-semibold text-foreground">Nos engagements</h3>
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm text-foreground">
              Collecte et livraison à domicile
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm text-foreground">
              QR Code unique pour chaque paire
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm text-foreground">
              Suivi en temps réel de votre commande
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm text-foreground">
              Garantie satisfait ou refait
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        size="lg"
        className="w-full font-semibold"
      >
        {checkoutButtonText || 'Procéder au paiement'}
      </Button>
    </div>
  );
}
