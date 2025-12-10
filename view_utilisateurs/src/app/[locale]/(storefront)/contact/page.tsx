'use client';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import ContactInfoCard from './_components/contact_info_card';
import MapCard from './_components/map_card';
import ContactFormCard from './_components/contact_form_card';

interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  details: string[];
}

interface ContactPageProps {
  contactInfos?: ContactInfo[];
  mapUrl?: string;
  onSubmit?: (data: FormData) => void;
}

const defaultContactInfos: ContactInfo[] = [
  {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Adresse',
    details: [
      '123 Avenue des Rencontres',
      '75001 Paris, France'
    ]
  },
  {
    icon: <Phone className="h-5 w-5" />,
    title: 'Téléphone',
    details: [
      '+33 1 23 45 67 89',
      '+33 6 12 34 56 78'
    ]
  },
  {
    icon: <Mail className="h-5 w-5" />,
    title: 'Email',
    details: [
      'contact@rencontre-serieuse.fr',
      'support@rencontre-serieuse.fr'
    ]
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: 'Support disponible',
    details: [
      'Lun - Ven: 9h00 - 20h00',
      'Sam - Dim: 10h00 - 18h00',
      'Support VIP: 24/7'
    ]
  }
];

export default function ContactPage({
  contactInfos = defaultContactInfos,
  mapUrl,
  onSubmit
}: ContactPageProps) {
  return (
    <main className="min-h-screen">
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          {/* En-tête */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Contactez-nous
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nous sommes là pour vous aider
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {"Une question sur votre abonnement ? Besoin d'aide ? Notre équipe est disponible pour vous accompagner dans votre recherche de l'amour."}
            </p>
          </div>

          {/* Grille Contact Info + Formulaire */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne Gauche - Informations de contact */}
            <div className="space-y-6">
              <ContactInfoCard contactInfos={contactInfos} />
              <MapCard mapUrl={mapUrl} />
            </div>

            {/* Colonne Droite - Formulaire de contact */}
            <ContactFormCard onSubmit={onSubmit} />
          </div>
        </div>
      </section>
    </main>
  );
}