import { Button } from "@/components/ui/button";
import { ArrowDown, TrendingUp, Bell, DollarSign } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-secondary border border-border animate-fade-in">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">
              Smart currency notifications for global earners
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Know the{" "}
            <span className="text-gradient">Perfect Moment</span>
            <br />
            to Cash Out
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Stop guessing when to transfer your earnings. Get notified when your 
            local payout beats the day you were paid—no hassle.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" onClick={() => document.getElementById("log-payment")?.scrollIntoView({ behavior: "smooth" })}>
              <TrendingUp className="w-5 h-5" />
              Get Started
            </Button>
          </div>

          {/* Product Hunt Badge */}
          <div className="flex justify-center mb-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <a 
              href="https://www.producthunt.com/products/payding/launches/payding?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-payding" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img 
                alt="Payding - Smart currency notifications for global earners | Product Hunt" 
                width="250" 
                height="54" 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1084966&theme=light&t=1776764905961"
                className="rounded-lg shadow-sm hover:shadow-md transition-shadow"
              />
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-sm">No bank logins needed</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <span className="text-sm">Daily or threshold alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm">Free to use</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
