'use client';

import {
  Award,
  Clock,
  Shield,
  Sparkles,
  MessageCircle,
  Users,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Feature {
  heading: string;
  description: string;
  icon: React.ReactNode;
}

interface PourquoiNousChoisirProps {
  title?: string;
  features?: Feature[];
  buttonText?: string;
  buttonUrl?: string;
  onButtonClick?: () => void;
}

const PourquoiNousChoisirSection = ({
  title = "Pourquoi nous choisir ?",
  features = [
    {
      heading: "Profils authentiques",
      description:
        "Des profils vérifiés et authentiques pour des rencontres en toute confiance. Chaque membre est validé pour garantir une expérience de qualité et des rencontres sincères.",
      icon: <Award className="size-6" />,
    },
    {
      heading: "Communauté bienveillante",
      description:
        "Une communauté de célibataires sérieux qui cherchent l'amour véritable. Rejoignez des milliers de personnes partageant les mêmes valeurs et aspirations que vous.",
      icon: <Users className="size-6" />,
    },
    {
      heading: "Matchs rapides",
      description:
        "Notre algorithme intelligent vous propose des profils compatibles en quelques secondes. Trouvez rapidement des personnes qui correspondent vraiment à vos attentes.",
      icon: <Clock className="size-6" />,
    },
    {
      heading: "Sécurité garantie",
      description:
        "Vos données personnelles sont protégées et sécurisées. Nous respectons votre vie privée et assurons une confidentialité totale de vos informations.",
      icon: <Shield className="size-6" />,
    },
    {
      heading: "Chat instantané",
      description:
        "Messagerie instantanée fluide et sécurisée pour échanger facilement. Discutez en temps réel avec vos matchs et apprenez à vous connaître naturellement.",
      icon: <MessageCircle className="size-6" />,
    },
    {
      heading: "Rencontres sérieuses",
      description:
        "Une plateforme dédiée aux relations durables et authentiques. Nous privilégions la qualité des rencontres pour vous aider à construire une vraie histoire d'amour.",
      icon: <Heart className="size-6" />,
    },
  ],
  buttonText = "Commencer l'aventure",
  buttonUrl = "/#nos-services",
  onButtonClick,
}: PourquoiNousChoisirProps) => {
  return (
    <section id="pourquoi-nous-choisir" className="py-16 md:py-32 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {title && (
          <div className="mx-auto mb-12 md:mb-16 max-w-3xl text-center">
            <Badge variant="outline" className="mb-3 md:mb-4 text-xs sm:text-sm">
              Pourquoi nous choisir ?
            </Badge>
            <h2 className="text-pretty text-3xl md:text-4xl lg:text-5xl font-medium">
              {title}
            </h2>
          </div>
        )}
        <div className="grid gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center md:items-start md:text-left">
              <div className="bg-accent mb-5 flex size-16 items-center justify-center rounded-full">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.heading}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
        {(buttonUrl || onButtonClick) && (
          <div className="mt-12 md:mt-16 flex justify-center">
            <Button
              size="lg"
              onClick={onButtonClick}
              asChild={!!buttonUrl && !onButtonClick}
            >
              {buttonUrl && !onButtonClick ? (
                <a href={buttonUrl}>{buttonText}</a>
              ) : (
                <span>{buttonText}</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PourquoiNousChoisirSection;