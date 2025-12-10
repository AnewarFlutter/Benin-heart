'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Star, Crown, ArrowLeft, CreditCard, Check, FileText, Wallet } from 'lucide-react';
import { APP_ROUTES } from '@/shared/constants/routes';
import { PhoneInput } from '@/components/ui/phone-input';

interface AbonnementDetails {
  id: string;
  title: string;
  pricePerMonth: number;
  icon: React.ReactNode;
}

const abonnements: Record<string, AbonnementDetails> = {
  gratuit: {
    id: 'gratuit',
    title: 'Plan Gratuit',
    pricePerMonth: 0,
    icon: <Heart className="h-6 w-6" />
  },
  premium: {
    id: 'premium',
    title: 'Plan Premium',
    pricePerMonth: 14.99,
    icon: <Star className="h-6 w-6" />
  },
  vip: {
    id: 'vip',
    title: 'Plan VIP Elite',
    pricePerMonth: 29.99,
    icon: <Crown className="h-6 w-6" />
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'premium';

  const selectedAbonnement = abonnements[planId] || abonnements.premium;

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [months, setMonths] = useState('1');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<{code: string; discount: number} | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  // Codes promo valides
  const validPromoCodes: Record<string, number> = {
    'LOVE10': 0.10, // 10% de réduction
    'AMOUR20': 0.20, // 20% de réduction
    'COUPLE15': 0.15, // 15% de réduction
  };

  const handleApplyPromoCode = () => {
    const upperCode = promoCode.toUpperCase();
    if (validPromoCodes[upperCode]) {
      setAppliedPromoCode({
        code: upperCode,
        discount: validPromoCodes[upperCode]
      });
    } else {
      alert('Code promo invalide');
      setPromoCode('');
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoCode('');
  };

  const monthsDiscount =
    parseInt(months) === 3 ? 0.1 :
    parseInt(months) === 6 ? 0.15 :
    parseInt(months) === 12 ? 0.2 : 0;

  const basePrice = selectedAbonnement.pricePerMonth * parseInt(months);
  const priceAfterMonthsDiscount = basePrice * (1 - monthsDiscount);
  const promoDiscount = appliedPromoCode ? priceAfterMonthsDiscount * appliedPromoCode.discount : 0;
  const totalPrice = priceAfterMonthsDiscount - promoDiscount;

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      // Passer à l'étape paiement
      handleNextStep();
    } else {
      // Soumettre la commande finale
      const orderData = {
        plan: selectedAbonnement.id,
        months: parseInt(months),
        basePrice,
        monthsDiscount: basePrice * monthsDiscount,
        promoCode: appliedPromoCode?.code,
        promoDiscount,
        total: totalPrice,
        paymentMethod,
        customer: {
          firstName,
          lastName,
          email,
          phone,
          address,
          city,
          postalCode
        }
      };

      console.log('Commande:', orderData);

      let message = `Commande validée !\nPlan: ${selectedAbonnement.title}\nDurée: ${months} mois`;
      if (appliedPromoCode) {
        message += `\nCode promo: ${appliedPromoCode.code}`;
      }
      message += `\nMode de paiement: ${paymentMethod === 'card' ? 'Carte bancaire' : 'PayPal'}`;
      message += `\nTotal: ${totalPrice.toLocaleString()}€`;

      alert(message);
    }
  };

  const handleBack = () => {
    router.push(APP_ROUTES.home.root);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={currentStep === 1 ? handleBack : handlePreviousStep}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          {/* Stepper */}
          <div className="flex items-center mb-6 gap-2 md:gap-4">
            {/* Step 1: Informations */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= 1 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'
              }`}>
                {currentStep > 1 ? <Check className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <span className={`ml-2 hidden md:inline font-medium ${currentStep >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                Informations
              </span>
            </div>

            {/* Connector */}
            <div className={`h-0.5 w-12 md:w-24 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />

            {/* Step 2: Paiement */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= 2 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'
              }`}>
                <Wallet className="h-5 w-5" />
              </div>
              <span className={`ml-2 hidden md:inline font-medium ${currentStep >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
                Paiement
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {currentStep === 1 ? 'Informations de facturation' : 'Mode de paiement'}
          </h1>
          <p className="text-muted-foreground">
            {currentStep === 1
              ? `Complétez vos informations pour souscrire au ${selectedAbonnement.title}`
              : 'Choisissez votre méthode de paiement préférée'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {currentStep === 1 ? (
                <>
                  {/* Subscription Duration */}
                  <Card>
                <CardHeader>
                  <CardTitle>Durée de l'abonnement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="months">Nombre de mois *</Label>
                    <Select value={months} onValueChange={setMonths}>
                      <SelectTrigger id="months">
                        <SelectValue placeholder="Sélectionnez la durée" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 mois</SelectItem>
                        <SelectItem value="3">3 mois (-10%)</SelectItem>
                        <SelectItem value="6">6 mois (-15%)</SelectItem>
                        <SelectItem value="12">12 mois (-20%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Plus vous vous abonnez longtemps, plus vous économisez
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="votre.email@exemple.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone *</Label>
                    <PhoneInput
                      value={phone}
                      onChange={setPhone}
                      defaultCountry="SN"
                      placeholder="Entrez votre numéro"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Adresse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      placeholder="Numéro et nom de rue"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        placeholder="Votre ville"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Code postal</Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Code postal"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
                </>
              ) : (
                <>
                  {/* Payment Method Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Choisissez votre mode de paiement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Card Payment Option */}
                      <div
                        className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'card'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'card'
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}>
                            {paymentMethod === 'card' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CreditCard className="h-5 w-5" />
                              <h3 className="font-semibold">Carte bancaire</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Paiement sécurisé par carte Visa, Mastercard ou American Express
                            </p>
                            {paymentMethod === 'card' && (
                              <div className="mt-4 space-y-3">
                                <div className="space-y-2">
                                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label htmlFor="expiry">Date d'expiration</Label>
                                    <Input id="expiry" placeholder="MM/AA" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input id="cvv" placeholder="123" maxLength={3} />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* PayPal Option */}
                      <div
                        className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === 'paypal'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setPaymentMethod('paypal')}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === 'paypal'
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}>
                            {paymentMethod === 'paypal' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#003087">
                                <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H7.72a.483.483 0 0 1-.477-.558L7.418 21l1.264-8.02.03-.193a.806.806 0 0 1 .793-.68h1.66c3.238 0 5.775-1.314 6.514-5.12.06-.307.093-.603.098-.883z"/>
                                <path fill="#0070E0" d="M7.295 8.206c.048-.309.21-.555.443-.663C8.167 7.362 8.86 7.24 9.734 7.24h4.65c.551 0 1.064.023 1.534.075.145.016.286.035.422.058.136.022.267.048.394.077.064.014.126.03.187.047.485.138.907.338 1.243.618.094-.672.076-1.28-.11-1.843-.203-.617-.6-1.077-1.136-1.384C16.274 4.533 15.387 4.4 14.27 4.4H8.426c-.45 0-.832.326-.903.768L5.168 20.232c-.024.148.093.28.242.28h3.513l.883-5.598z"/>
                              </svg>
                              <h3 className="font-semibold">PayPal</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Paiement rapide et sécurisé avec votre compte PayPal
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle>Récapitulatif de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Selected Plan */}
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <div className="p-2 bg-primary text-primary-foreground rounded-lg">
                      {selectedAbonnement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{selectedAbonnement.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedAbonnement.pricePerMonth.toLocaleString()}€ / mois
                      </p>
                    </div>
                  </div>

                  {/* Price Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prix mensuel</span>
                      <span>{selectedAbonnement.pricePerMonth.toLocaleString()}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Durée</span>
                      <span>{months} mois</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{basePrice.toLocaleString()}€</span>
                    </div>
                    {monthsDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Réduction durée ({monthsDiscount * 100}%)</span>
                        <span>
                          -{(basePrice * monthsDiscount).toLocaleString()}€
                        </span>
                      </div>
                    )}

                    {/* Code Promo Section */}
                    <div className="pt-3 border-t space-y-2">
                      {!appliedPromoCode ? (
                        <div className="flex gap-2">
                          <Input
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            placeholder="Code promo"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleApplyPromoCode}
                            disabled={!promoCode}
                          >
                            Appliquer
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded-md">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                {appliedPromoCode.code}
                              </Badge>
                              <span className="text-sm text-green-600 dark:text-green-400">
                                -{appliedPromoCode.discount * 100}%
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemovePromoCode}
                              className="h-6 px-2"
                            >
                              ✕
                            </Button>
                          </div>
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Réduction code promo</span>
                            <span>-{promoDiscount.toLocaleString()}€</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-border" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        {totalPrice.toLocaleString()}€
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full py-6 text-lg" size="lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    {currentStep === 1 ? 'Continuer vers le paiement' : 'Confirmer et payer'}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Paiement sécurisé. Vos informations sont protégées.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
