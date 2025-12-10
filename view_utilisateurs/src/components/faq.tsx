import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  faq: FAQItem[];
}

const FAQ = ({ faq }: FAQProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-3 md:mb-4 text-xs sm:text-sm">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-5xl leading-tight font-semibold tracking-tight mb-3">
            Questions fréquemment posées sur nos services de cordonnerie
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {"Retrouvez les réponses aux questions les plus courantes. Besoin d'aide supplémentaire ? N'hésitez pas à nous contacter."}
          </p>
        </div>

        <Accordion type="single" className="mt-8" defaultValue="question-0" collapsible>
          {faq.map(({ question, answer }, index) => (
            <AccordionItem key={question} value={`question-${index}`}>
              <AccordionTrigger className="text-left text-lg font-semibold">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
