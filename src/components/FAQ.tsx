import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Does Payding handle my actual money?",
    answer:
      "No. We are a notification and tracking tool, not a bank or an exchange. You keep your funds in your existing accounts (like PayPal, Wise, or Upwork) and use our alerts to know the best time to trigger the transfer yourself.",
  },
  {
    question: "Can you guarantee I'll make more money?",
    answer:
      "While we can't control the global economy, we can guarantee you'll have better visibility. Instead of converting blindly, you'll know exactly how today's rate compares to the day you were paid.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Absolutely. Because we don't ask for bank logins, API keys, or credit card details to track rates, your financial footprint is nonexistent on our servers. We just track numbers and send pings.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to know about how Payding works.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-soft transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
