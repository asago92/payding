import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LogPayment from "@/components/LogPayment";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Hero />
        <HowItWorks />
        <LogPayment />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
