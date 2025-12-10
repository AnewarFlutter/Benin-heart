"use client";

import { useRouter } from 'next/navigation';
import HeroBannerCarousel from './_components/hero_banner_carousel';
import PromoBanner from './_components/promo_banner';
import NosServicesSection from './_components/nos_services_section';
import BeforeAndAfterSection from './_components/before_and_after';
import PourquoiNousChoisirSection from './_components/pourquoi_nous_choisi_section';
import { APP_ROUTES } from '@/shared/constants/routes';

export default function Home() {
  const router = useRouter();

  const handleServiceClick = (serviceId: string) => {
    console.log("Profil sélectionné:", serviceId);
    // Ajoutez votre logique de navigation vers la page du profil
  };

  const handleViewAllServices = () => {
    console.log("Voir tous les profils");
    // Ajoutez votre logique de navigation vers la page des profils
  };

  const handleAddToCart = (abonnement: any) => {
    console.log("Souscrire à l'abonnement:", abonnement);
    // Rediriger vers la page de checkout avec le plan sélectionné
    router.push(`${APP_ROUTES.checkout.root}?plan=${abonnement.id}`);
  };

  return (
    <>
      {/* Bannière Promotionnelle */}
      <PromoBanner />

      {/* Carrousel de Présentation */}
      <HeroBannerCarousel />

      {/* Section Profils en Vedette */}
      <NosServicesSection
        onServiceClick={handleServiceClick}
        onViewAllClick={handleViewAllServices}
        onAddToCart={handleAddToCart}
      />

      {/* Section Témoignages */}
      <BeforeAndAfterSection autoplay={true} />

      {/* Pourquoi nous rejoindre */}
      <PourquoiNousChoisirSection />


    </>
  );
}