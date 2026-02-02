'use client';

import { Navbar08 } from '@/components/ui/shadcn-io/navbar-08';
import { APP_ROUTES } from '@/shared/constants/routes';
import { APP_IMAGES } from '@/shared/constants/images';
import { useRouter as useNextRouter } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
   const router = useNextRouter();



  const handleNavItemClick = (href: string) => {
    console.log('Navigation clicked:', href);

    // Pour les liens avec hash (#), utiliser window.location pour un scroll natif
    if (href.includes('#')) {
      window.location.href = href;
    } else {
      router.push(href);
    }
  };

  const handleSearchSubmit = (query: string) => {
    console.log('Search query:', query);
    // Ajoutez votre logique de recherche ici
  };

  const handleLoginClick = () => {
    console.log('Login clicked');
    router.push(APP_ROUTES.auth.login);
  };

  // const handleLanguageChange = (language: string) => {
  //   console.log('Language changed to:', language);
  //   // Ajoutez ici votre logique de changement de langue
  // };

  const navigationLinks = [
    { 
      href: APP_ROUTES.home.root, 
      label: 'Accueil', 
      active: true 
    },
    {
      href: APP_ROUTES.home.abonnements,
      label: 'Abonnements',
      featured: {
        image: APP_IMAGES.drownMenu.image1
      },
      subItems: [
        {
          href: APP_ROUTES.auth.register,
          label: 'Plan Gratuit',
          description: 'Découvrez l\'amour sans engagement'
        },
        {
          href: `${APP_ROUTES.checkout.root}?plan=premium`,
          label: 'Plan Premium',
          description: 'Maximisez vos chances de rencontres'
        },
        {
          href: `${APP_ROUTES.checkout.root}?plan=vip`,
          label: 'Plan VIP Elite',
          description: 'L\'expérience ultime de rencontres'
        }
      ]
    },
    {
      href: APP_ROUTES.home.pourquoiNousChoisir,
      label: 'Pourquoi nous choisir ?'
    },
    {
      href: APP_ROUTES.customer.root,
      label: 'Mon Espace utilisateur'
    },
    {
      href: APP_ROUTES.home.contact,
      label: 'Contact'
    },
    { 
      href: APP_ROUTES.home.faq, 
      label: 'FAQ' 
    },
  ];

  return (
    <Navbar08
      logo={
        <Image
          src={APP_IMAGES.logo.main}
          alt="Logo"
          width={70}
          height={70}
          className="object-contain"
        />
      }
      logoHref={APP_ROUTES.home.root}
      navigationLinks={navigationLinks}
      searchPlaceholder="Rechercher..."
      searchShortcut="⌘K"
      // currentLanguage="Fr"
      onNavItemClick={handleNavItemClick}
      onSearchSubmit={handleSearchSubmit}
      onLoginClick={handleLoginClick}
      // onLanguageChange={handleLanguageChange}
    />
  );
}