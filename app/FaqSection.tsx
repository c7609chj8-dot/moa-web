"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/lib/site-settings";

export default function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <Accordion className="faqList" type="single" collapsible>
      {items.map((item, index) => (
        <AccordionItem value={`faq-${index}`} key={item.id ?? item.question}>
          <AccordionTrigger className="faqQuestion">
            <span>Q. {item.question}</span>
          </AccordionTrigger>
          <AccordionContent className="faqAnswer">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
