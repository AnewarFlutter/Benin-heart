'use client';

import FAQ from '@/components/faq';

const defaultFAQs = [
  {
    question: "Comment fonctionne votre plateforme de rencontre ?",
    answer: "Après votre inscription, créez votre profil en y ajoutant vos photos et informations. Notre algorithme vous propose des profils compatibles basés sur vos préférences. Likez les profils qui vous intéressent et commencez à discuter dès qu'il y a un match mutuel."
  },
  {
    question: "Quelle est la différence entre les abonnements ?",
    answer: "Le plan Gratuit vous permet de découvrir l'application avec 5 likes par jour. Le plan Premium offre des likes illimités, la possibilité de voir qui vous a liké et des messages prioritaires. Le plan VIP Elite inclut tout le Premium plus le mode invisible, des Super Likes illimités et un support prioritaire 24/7."
  },
  {
    question: "Comment puis-je annuler mon abonnement ?",
    answer: "Vous pouvez annuler votre abonnement à tout moment depuis votre profil dans la section 'Paramètres > Abonnement'. L'annulation prendra effet à la fin de votre période de facturation en cours. Aucun remboursement n'est effectué pour la période déjà payée."
  },
  {
    question: "Est-ce que mes données personnelles sont sécurisées ?",
    answer: "Absolument. Nous prenons la sécurité de vos données très au sérieux. Toutes vos informations sont cryptées et protégées. Nous ne partageons jamais vos données personnelles avec des tiers sans votre consentement. Consultez notre politique de confidentialité pour plus de détails."
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer: "Nous acceptons les cartes bancaires (Visa, MasterCard, American Express), PayPal, et les paiements mobile (Orange Money, Wave, Free Money) pour votre confort et sécurité."
  },
  {
    question: "Comment signaler un profil suspect ?",
    answer: "Si vous rencontrez un profil suspect ou un comportement inapproprié, utilisez le bouton 'Signaler' présent sur chaque profil. Notre équipe de modération examinera le signalement dans les 24h et prendra les mesures appropriées pour assurer la sécurité de notre communauté."
  }
];

export default function AnswerAndQuestion() {
  
  return <FAQ faq={defaultFAQs} />;
}
