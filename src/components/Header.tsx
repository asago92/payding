import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">RateWatch</span>
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#calculator"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Calculator
            </a>
            <a
              href="#log-payment"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log Payment
            </a>
          </nav>

          {/* CTA */}
          <Button variant="default" size="sm">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
