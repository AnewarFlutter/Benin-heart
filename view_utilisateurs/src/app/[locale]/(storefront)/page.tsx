import HeroBannerCarousel from './_components/hero_banner_carousel';
import PromoBanner from './_components/promo_banner';
import NosServicesSection from './_components/nos_services_section';
import BeforeAndAfterSection from './_components/before_and_after';
import PourquoiNousChoisirSection from './_components/pourquoi_nous_choisi_section';
import { getHeroBannersAction, getTemoignagesAction } from '@/actions/beninheart/storefront/actions';

export default async function Home() {
  const [bannersResult, temoignagesResult] = await Promise.all([
    getHeroBannersAction(),
    getTemoignagesAction(),
  ]);

  const banners = bannersResult.success ? bannersResult.data : undefined;
  const temoignages = temoignagesResult.success ? temoignagesResult.data : undefined;

  return (
    <>
      {/* Bannière Promotionnelle */}
      <PromoBanner />

      {/* Carrousel de Présentation */}
      <HeroBannerCarousel banners={banners} />

      {/* Section Profils en Vedette */}
      <NosServicesSection />

      {/* Section Témoignages */}
      <BeforeAndAfterSection autoplay={true} temoignages={temoignages} />

      {/* Pourquoi nous rejoindre */}
      <PourquoiNousChoisirSection />
    </>
  );
}
