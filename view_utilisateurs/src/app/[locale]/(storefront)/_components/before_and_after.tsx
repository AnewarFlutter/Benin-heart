
'use client';
import { Badge } from '@/components/ui/badge';
import { APP_IMAGES } from '@/shared/constants/images';
import dynamic from 'next/dynamic';


const AnimatedTestimonialsssr = dynamic(
  () => import('@/components/ui/animated-testimonials').then(mod => ({ default: mod.AnimatedTestimonials })),
  { ssr: false }
);

const testimonials = [
  {
    quote: "J'avais perdu espoir de trouver quelqu'un qui me comprenne vraiment. Grâce à cette plateforme, j'ai rencontré l'amour de ma vie ! Nous sommes ensemble depuis 2 ans maintenant.",
    name: "Adjoa Hounkpatin",
    designation: "En couple depuis 2 ans",
    src: APP_IMAGES.beforeAfter.image1,
  },
  {
    quote: "Après plusieurs déceptions, j'ai décidé d'essayer cette application. J'ai été agréablement surpris par la qualité des profils et l'ambiance bienveillante. J'ai trouvé ma partenaire idéale !",
    name: "Koffi Dossou",
    designation: "Marié depuis 1 an",
    src: APP_IMAGES.beforeAfter.image2,
  },
  {
    quote: "Je cherchais une relation sérieuse et durable. Cette plateforme m'a permis de rencontrer des personnes authentiques. J'ai trouvé mon âme sœur et nous construisons notre futur ensemble !",
    name: "Sèna Agbessi",
    designation: "Fiancée",
    src: APP_IMAGES.beforeAfter.image3,
  },
  {
    quote: "En tant que musulmane pratiquante, il était important pour moi de trouver quelqu'un qui partage mes valeurs. Cette application m'a aidée à rencontrer un homme formidable et respectueux. Nous préparons notre mariage !",
    name: "Aminata Soumanou",
    designation: "Fiancée",
    src: APP_IMAGES.beforeAfter.image4,
  },
  {
    quote: "Je recherchais une femme pieuse et éduquée pour fonder une famille. Alhamdulillah, j'ai trouvé ma moitié sur cette plateforme. Nous partageons les mêmes objectifs de vie et sommes très heureux ensemble.",
    name: "Abdoul-Razak Alassane",
    designation: "Marié depuis 6 mois",
    src: APP_IMAGES.beforeAfter.image5,
  }
];

interface BeforeAndAfterSectionProps {
  autoplay?: boolean;
}

export default function BeforeAndAfterSection({ 
  autoplay = true 
}: BeforeAndAfterSectionProps) {
  return (
    <section id="testimonials" className="py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-black dark:to-black">
      <div className="container mx-auto max-w-7xl">
        {/* En-tête de section */}
        <div className="text-center mb-12 md:mb-16">
           <Badge variant="outline" className="mb-3 md:mb-4 text-xs sm:text-sm">
           Témoignages
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">
            Ils ont trouvé l'amour
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Des milliers de couples se sont formés grâce à notre plateforme.
            Découvrez leurs histoires d'amour inspirantes et rejoignez-nous pour écrire la vôtre.
          </p>
        </div>

        {/* Section AnimatedTestimonials */}
        <div className="relative">
          <div className="absolute inset-0 bg-white dark:bg-accent/30 rounded-3xl"></div>
          <div className="relative z-10">
            <AnimatedTestimonialsssr
              testimonials={testimonials}
              autoplay={autoplay}
            />
          </div>
        </div>
      </div>
    </section>
  );
}