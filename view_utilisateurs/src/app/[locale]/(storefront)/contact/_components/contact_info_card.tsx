'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  details: string[];
}

interface ContactInfoCardProps {
  contactInfos: ContactInfo[];
}

export default function ContactInfoCard({ contactInfos }: ContactInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nos coordonnées</CardTitle>
        <CardDescription>
          Retrouvez toutes les informations pour nous contacter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {contactInfos.map((info, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {info.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{info.title}</h3>
              {info.details.map((detail, idx) => (
                <p key={idx} className="text-sm text-muted-foreground">
                  {detail}
                </p>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}