'use client';

import Image from 'next/image';
import { Clock, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Service {
  id: string;
  name: string;
}

export interface CartItemProps {
  id: string;
  name: string;
  image: string;
  services: Service[];
  duration: string;
  price: number;
  onRemove?: (id: string) => void;
}

export function CartItem({
  id,
  name,
  image,
  services,
  duration,
  price,
  onRemove,
}: CartItemProps) {
  const handleRemove = () => {
    onRemove?.(id);
  };

  return (
    <div className="flex gap-4 rounded-lg border border-border bg-card p-5">
      {/* Shoe Image */}
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>

      {/* Shoe Details */}
      <div className="flex flex-1 flex-col gap-3">
        {/* Header with name and remove button */}
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-foreground">{name}</h3>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRemove}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Services Badges */}
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <Badge
              key={service.id}
              variant="secondary"
              className="px-3 py-1 text-sm font-medium"
            >
              {service.name}
            </Badge>
          ))}
        </div>

        {/* Duration, Service Count, and Price */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>{services.length} service{services.length > 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-foreground">
              {price.toLocaleString('fr-FR')}€
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
