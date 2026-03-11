import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import LogPayment from "@/components/LogPayment";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import useSeo from "@/hooks/use-seo";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingSession, setCheckingSession] = useState(true);

  // Scroll to hash section when arriving from another page
  useEffect(() => {
    if (!checkingSession && location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [checkingSession, location.hash]);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        navigate("/dashboard", { replace: true });
      } else {
        setCheckingSession(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard", { replace: true });
      } else if (mounted) {
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  useSeo({
    title: "Smart Currency Alerts for Global Earners",
    description: "Stop losing money on bad exchange rates. Payding notifies you when it's the right time to convert your foreign payments.",
    path: "/",
  });

  if (checkingSession) {
    return <div className="min-h-screen bg-background" />;
  }

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
