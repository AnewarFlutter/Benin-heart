import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import ContactInfoCard from './_components/contact_info_card';
import MapCard from './_components/map_card';
import ContactFormCard from './_components/contact_form_card';
import { getContactInfoAction } from '@/actions/beninheart/storefront/actions';
import { EntityContactInfo } from '@/modules/beninheart/storefront/contact/domain/entities/entity_contact';

function buildContactInfoItems(info: EntityContactInfo) {
  return [
    {
      icon: <MapPin className="h-5 w-5" />,
      title: 'Adresse',
      details: [info.adresse, `${info.ville}, ${info.pays}`].filter(Boolean),
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: 'Téléphone',
      details: info.telephones.length > 0 ? info.telephones : ['+229 97 00 00 00'],
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: 'Email',
      details: info.emails.length > 0 ? info.emails : ['contact@beninheart.com'],
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: 'Support disponible',
      details: info.horaires ? [info.horaires] : ['Lun - Ven: 9h00 - 20h00'],
    },
  ];
}

const fallbackContactInfos = [
  {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Adresse',
    details: ['Cotonou, Bénin'],
  },
  {
    icon: <Phone className="h-5 w-5" />,
    title: 'Téléphone',
    details: ['+229 97 00 00 00'],
  },
  {
    icon: <Mail className="h-5 w-5" />,
    title: 'Email',
    details: ['contact@beninheart.com'],
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: 'Support disponible',
    details: ['Lun - Ven: 9h00 - 20h00', 'Sam: 10h00 - 16h00'],
  },
];

export default async function ContactPage() {
  const result = await getContactInfoAction();
  const contactInfos = result.success && result.data
    ? buildContactInfoItems(result.data)
    : fallbackContactInfos;

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
            {/* Colonne Gauche */}
            <div className="space-y-6">
              <ContactInfoCard contactInfos={contactInfos} />
              <MapCard />
            </div>

            {/* Colonne Droite — formulaire connecté */}
            <ContactFormCard />
          </div>
        </div>
      </section>
    </main>
  );
}
