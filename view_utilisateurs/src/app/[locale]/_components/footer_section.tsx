import Footer from '@/components/footer';
import { APP_ROUTES } from '@/shared/constants/routes';
import { APP_IMAGES } from '@/shared/constants/images';
import Image from 'next/image';

const footerSections = [
  {
    title: "Navigation",
    links: [
      { title: "Accueil", href: APP_ROUTES.home.root },
      { title: "Nos Services", href: APP_ROUTES.home.nosService },
      { title: "Se connecter", href: APP_ROUTES.auth.login },
      { title: "S'inscrire", href: APP_ROUTES.auth.register },
    ],
  },
  {
    title: "À propos",
    links: [
      { title: "Pourquoi nous choisir", href: APP_ROUTES.home.pourquoiNousChoisir },
      { title: "Témoignages", href: APP_ROUTES.home.testimonials },
    ],
  },
  {
    title: "Aide & Contact",
    links: [
      { title: "FAQ", href: APP_ROUTES.home.faq },
      { title: "Contact", href: APP_ROUTES.home.contact },
    ],
  },

];

export default function FooterSection() {
  return (
    <Footer
      logo={
        <Image
          src={APP_IMAGES.logo.main}
          alt="Application de Rencontre Logo"
          width={80}
          height={80}
          className="object-contain"
        />
      }
      description="Plateforme de rencontre sérieuse qui aide des milliers de célibataires à trouver l'amour. Rejoignez une communauté bienveillante et commencez votre histoire aujourd'hui."
      sections={footerSections}
      logoUrl={APP_ROUTES.home.root}
      companyName="Rencontre Sérieuse"
      socialLinks={{
      }}
    />
  );
}