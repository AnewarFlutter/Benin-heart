'use client';

import { useState } from 'react';
import { Package, QrCode, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface ShippingMethod {
  id: string;
  name: string;
  duration: string;
  price: number;
}

export interface OrderSummaryProps {
  subtotal: number;
  shipping?: number;
  totalPairs: number;
  totalServices: number;
  maxDuration: string;
  checkoutButtonText?: string;
  onApplyPromoCode?: (code: string) => void;
  onCheckout?: () => void;
  className?: string;
}

export function OrderSummary({
  subtotal,
  shipping = 0,
  totalPairs,
  totalServices,
  maxDuration,
  checkoutButtonText = 'Procéder au paiement',
  onApplyPromoCode,
  onCheckout,
  className,
}: OrderSummaryProps) {
  const [promoCode, setPromoCode] = useState('');

  const total = subtotal + shipping;

  const handleApplyPromoCode = () => {
    if (promoCode.trim()) {
      onApplyPromoCode?.(promoCode);
    }
  };

  return (
    <div className={cn('flex flex-col gap-5 rounded-xl border border-border bg-card p-5', className)}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Récapitulatif</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Détails de votre commande
        </p>
      </div>

      {/* Order Details */}
      <div className="rounded-lg border border-border bg-background p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Paires de chaussures</span>
          <span className="text-base font-semibold text-foreground">{totalPairs}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Services totaux</span>
          <span className="text-base font-semibold text-foreground">{totalServices}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">Délai maximum</span>
          <span className="text-base font-semibold text-foreground">{maxDuration}</span>
        </div>
      </div>

      {/* Promo Code */}
      <div className="border-t border-border pt-4">
        <label className="mb-2 block text-sm font-semibold text-foreground">
          Code Promo
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Entrer le code promo"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleApplyPromoCode} variant="outline" className="shrink-0">
            Appliquer
          </Button>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-foreground">Sous-total</span>
          <span className="font-medium text-foreground">{subtotal.toLocaleString('fr-FR')}€</span>
        </div>
        {shipping > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-foreground">Livraison</span>
            <span className="font-medium text-foreground">{shipping.toLocaleString('fr-FR')}€</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold text-foreground">{total.toLocaleString('fr-FR')}€</span>
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
        {checkoutButtonText}
      </Button>
    </div>
  );
}
