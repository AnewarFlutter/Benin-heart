'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Smartphone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import QRCode from 'react-qr-code';

export interface PaymentMethodSelectorProps {
  totalAmount?: number;
  orderId?: string;
  onPaymentMethodChange?: (method: 'card' | 'orange' | 'wave') => void;
  className?: string;
}

export function PaymentMethodSelector({
  totalAmount = 0,
  orderId = 'ORDER-' + Date.now(),
  onPaymentMethodChange,
  className,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'orange' | 'wave'>('orange');
  const [isMobile, setIsMobile] = useState(false);

  // Detect if user is on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate QR code data
  const generateQRData = (method: 'orange' | 'wave') => {
    return JSON.stringify({
      method: method,
      amount: totalAmount,
      orderId: orderId,
      currency: 'EUR',
      timestamp: new Date().toISOString(),
    });
  };

  // Handle app opening
  const handleOpenApp = (app: 'orange' | 'maxit' | 'wave') => {
    const deepLinks = {
      orange: 'orangemoney://', // Deep link for Orange Money app
      maxit: 'maxit://', // Deep link for Maxit app
      wave: 'wave://', // Deep link for Wave app
    };

    // Try to open the app
    window.location.href = deepLinks[app];
  };

  const handleMethodChange = (value: string) => {
    const method = value as 'card' | 'orange' | 'wave';
    setSelectedMethod(method);
    onPaymentMethodChange?.(method);
  };

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      <h2 className="text-xl font-semibold text-foreground mb-6">
        Choisir le moyen de paiement
      </h2>

      <Tabs value={selectedMethod} onValueChange={handleMethodChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orange" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Orange Money
          </TabsTrigger>
          <TabsTrigger value="wave" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Wave
          </TabsTrigger>
          <TabsTrigger value="card" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Carte bancaire
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orange" className="mt-6">
          <div className="space-y-6">
            {isMobile ? (
              <>
                {/* Mobile: Show app buttons */}
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg">
                  <p className="text-sm text-orange-900 dark:text-orange-100 text-center">
                    Ouvrez votre application de paiement mobile
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleOpenApp('orange')}
                    className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base"
                  >
                    <Smartphone className="mr-2 h-5 w-5" />
                    Ouvrir Orange Money
                  </Button>

                  <Button
                    onClick={() => handleOpenApp('maxit')}
                    className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base"
                  >
                    <Smartphone className="mr-2 h-5 w-5" />
                    Ouvrir Maxit
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    Montant: <span className="font-semibold text-foreground">{totalAmount.toLocaleString('fr-FR')} EUR</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Commande: {orderId}
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Desktop: Show QR Code */}
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg">
                  <p className="text-sm text-orange-900 dark:text-orange-100 text-center">
                    Scannez le QR code avec votre application Orange Money
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-6 bg-white rounded-xl border-2 border-dashed border-orange-500 shadow-lg">
                    <QRCode
                      value={generateQRData('orange')}
                      size={256}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                      fgColor="#000000"
                      bgColor="#ffffff"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Montant: <span className="font-semibold text-foreground">{totalAmount.toLocaleString('fr-FR')} EUR</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Commande: {orderId}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="wave" className="mt-6">
          <div className="space-y-6">
            {isMobile ? (
              <>
                {/* Mobile: Show app button */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
                    Ouvrez votre application Wave
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleOpenApp('wave')}
                    className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base"
                  >
                    <Smartphone className="mr-2 h-5 w-5" />
                    Ouvrir Wave
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    Montant: <span className="font-semibold text-foreground">{totalAmount.toLocaleString('fr-FR')} EUR</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Commande: {orderId}
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Desktop: Show QR Code */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
                    Scannez le QR code avec votre application Wave
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-6 bg-white rounded-xl border-2 border-dashed border-blue-500 shadow-lg">
                    <QRCode
                      value={generateQRData('wave')}
                      size={256}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                      fgColor="#000000"
                      bgColor="#ffffff"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Montant: <span className="font-semibold text-foreground">{totalAmount.toLocaleString('fr-FR')} EUR</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Commande: {orderId}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="card" className="mt-6 space-y-4">
          {/* Card Payment Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Numéro de carte</Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Date d'expiration</Label>
                <Input
                  id="expiry"
                  type="text"
                  placeholder="MM/AA"
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  maxLength={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Nom sur la carte</Label>
              <Input
                id="cardName"
                type="text"
                placeholder="JOHN DOE"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
