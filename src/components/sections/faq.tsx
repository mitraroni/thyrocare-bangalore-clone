"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FaqItem = {
  question: string;
  answer: string | React.ReactNode;
};

const faqItems: FaqItem[] = [
  {
    question: "What are the timings for sample collection at home?",
    answer: "For tests/profiles requiring prior fasting, 6:30 AM to 11:00 AM is an ideal time-slot for sample collection, whereas for non-fasting tests/profiles, you can choose any time-slot till 7:00 PM.",
  },
  {
    question: "Is same-day home blood collection possible?",
    answer: "Yes, you can get blood collection on the same day as per the availability of phlebotomists. Our walk-in centers also offer same-day blood collection. Find our center near you on Google to book tests with home sample collection. To ensure no inconvenience, we request 1-day prior intimation.",
  },
  {
    question: "When can I expect a callback from the team?",
    answer: "Once you fill in your details, you will receive a call from one of our representatives in less than 24 hrs.",
  },
  {
    question: "Is a doctor’s prescription needed to avail the testing service?",
    answer: "A doctor’s prescription is not required for availing any preventive healthcare package. However, in case of any illness, the patient is advised to consult their physician before booking tests/profiles.",
  },
  {
    question: "Do I have to fill in any forms when I visit a walk-in center near me for blood collection?",
    answer: "Only a few tests require filling of forms as per govt guidelines. Same forms are available at the center, and our technicians will guide you about the same during your visit.",
  },
  {
    question: "How can I register a complaint?",
    answer: (
      <p>
        You can register a complaint by writing to us at{" "}
        <a href="mailto:complaints@thyrocare.com" className="text-link hover:underline">
          complaints@thyrocare.com
        </a>{" "}
        or calling our helpline numbers{" "}
        <a href="tel:02230900000" className="text-link hover:underline">
          02230900000
        </a>{" "}
        or{" "}
        <a href="tel:02241252525" className="text-link hover:underline">
          02241252525
        </a>
        . You can WhatsApp us at{" "}
        <a
          href="https://wa.me/919870666333"
          className="text-link hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          9870666333
        </a>
        . If your query is not resolved, please forward the same thread to{" "}
        <a href="mailto:redressals@thyrocare.com" className="text-link hover:underline">
          redressals@thyrocare.com
        </a>
        . TAT for closure of complaints is 24-48 hours depending upon the nature of the complaint and resolution needs to be given.
      </p>
    ),
  },
  {
    question: "How soon will I get reports?",
    answer: "Reports will be released within 6 hrs of samples reaching the lab. Some tests might require higher TAT, which will be confirmed by your service provider during sample collection.",
  },
];

const FaqSection = () => {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="text-center text-3xl font-bold text-text-dark">FAQ</h2>
        <div className="mx-auto mt-4 mb-10 h-1 w-16 rounded-full bg-gray-200"></div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index + 1}`}
              className="rounded-lg border-none bg-muted"
            >
              <AccordionTrigger className="w-full px-6 py-5 text-left text-base font-medium text-text-dark hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5">
                <div className="text-base text-text-medium leading-relaxed">{item.answer}</div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;