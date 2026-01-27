import { TrendingUp } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-secondary/20">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">RateWatch</span>
          </div>

          {/* Info */}
          <p className="text-sm text-muted-foreground text-center">
            Smart currency alerts for remote workers. Keep your funds in PayPal, Wise, or Upwork—we just notify you when to transfer.
          </p>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} RateWatch
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
