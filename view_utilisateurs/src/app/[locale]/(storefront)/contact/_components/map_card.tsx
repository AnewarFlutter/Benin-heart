'use client';

import { Card } from '@/components/ui/card';

interface MapCardProps {
  mapUrl?: string;
  className?: string;
}

export default function MapCard({ 
  mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.788062857264!2d-17.458411037231432!3d14.724570990685589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec172b4f67dcec5%3A0x9772fe44fc96bced!2sRms%20Sports!5e0!3m2!1sfr!2ssn!4v1762863024351!5m2!1sfr!2ssn",
  className = "h-64 md:h-80"
}: MapCardProps) {
  return (
    <Card className={`overflow-hidden p-0 ${className}`}>
      <iframe 
        src={mapUrl}
        width="100%" 
        height="100%" 
        style={{ border: 0 }} 
        allowFullScreen 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        title="Notre localisation"
        className="w-full h-full"
      />
    </Card>
  );
}