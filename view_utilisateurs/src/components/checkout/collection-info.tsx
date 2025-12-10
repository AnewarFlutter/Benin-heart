'use client';

import { MapPin, Map } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CollectionInfoProps {
  address: string;
  phone: string;
  mapLocation?: string;
  sameAddressForDelivery: boolean;
  onAddressChange?: (address: string) => void;
  onPhoneChange?: (phone: string) => void;
  onMapLocationChange?: (location: string) => void;
  onSameAddressChange?: (checked: boolean) => void;
  className?: string;
}

export function CollectionInfo({
  address,
  phone,
  mapLocation = '',
  sameAddressForDelivery,
  onAddressChange,
  onPhoneChange,
  onMapLocationChange,
  onSameAddressChange,
  className,
}: CollectionInfoProps) {
  const handleOpenMaps = () => {
    if (mapLocation) {
      window.open(mapLocation, '_blank');
    }
  };
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Informations de collecte
        </h2>
      </div>

      {/* Collection Address */}
      <div className="mb-6">
        <Label htmlFor="address" className="mb-2 text-sm font-semibold">
          Adresse de collecte <span className="text-destructive">*</span>
        </Label>
        <Input
          id="address"
          type="text"
          placeholder="Ex: Plateau, Rue 6 x Rue 9, Immeuble Fahd, 3ème étage"
          value={address}
          onChange={(e) => onAddressChange?.(e.target.value)}
          className="bg-muted/50"
        />
      </div>

      {/* Google Maps Location */}
      <div className="mb-6">
        <Label htmlFor="map-location" className="mb-2 text-sm font-semibold">
          Localisation Google Maps (optionnel)
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Map className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="map-location"
              type="text"
              placeholder="Coller le lien Google Maps"
              value={mapLocation}
              onChange={(e) => onMapLocationChange?.(e.target.value)}
              className="bg-muted/50 pl-10"
            />
          </div>
          {mapLocation && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleOpenMaps}
              title="Ouvrir dans Google Maps"
            >
              <Map className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Partagez votre position depuis Google Maps pour faciliter la collecte
        </p>
      </div>

      {/* Same Address Checkbox */}
      <div className="mb-6 flex items-center gap-2">
        <input
          id="same-address"
          type="checkbox"
          checked={sameAddressForDelivery}
          onChange={(e) => onSameAddressChange?.(e.target.checked)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
        />
        <Label
          htmlFor="same-address"
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          L'adresse de livraison est la même
        </Label>
      </div>

      {/* Phone Number */}
      <div>
        <Label htmlFor="phone" className="mb-2 text-sm font-semibold">
          Numéro de téléphone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+221 77 123 45 67"
          value={phone}
          onChange={(e) => onPhoneChange?.(e.target.value)}
          className="bg-muted/50"
        />
      </div>
    </div>
  );
}
