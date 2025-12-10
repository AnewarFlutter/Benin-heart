import AnswerAndQuestion from './_components/answer_and_question';
import WantToKnowMore from './_components/want_to_know_more';

export default function FAQPage() {
  return (
    <section className="min-h-screen">
      <AnswerAndQuestion />
      
      {/* Section "Want to know more" */}
      <div className="container mx-auto px-1 py-1 pb-16 max-w-4xl">
        <WantToKnowMore
          title="Besoin de plus d'informations ?"
          description="Notre équipe est là pour répondre à toutes vos questions et vous accompagner."
          buttonText="Contactez-nous"
          buttonUrl="/contact"
        />
      </div>
    </section>
  );
}

