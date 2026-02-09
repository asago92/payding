import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LogPayment from "@/components/LogPayment";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import useSeo from "@/hooks/use-seo";

const Index = () => {
  useSeo({
    title: "Smart Currency Alerts for Global Earners",
    description: "Stop losing money on bad exchange rates. Payding notifies you when it's the right time to convert your foreign payments.",
    path: "/",
  });
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Hero />
        <HowItWorks />
        <LogPayment />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
