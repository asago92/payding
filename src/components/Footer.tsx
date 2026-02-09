import { DollarSign } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-secondary/20">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Payding</span>
          </div>

          {/* Info */}
          <p className="text-sm text-muted-foreground text-center">
            Smart currency alerts for remote workers. Keep your funds in PayPal, Wise, or Upwork—we just notify you when to transfer.
          </p>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms & Conditions
            </a>
            <span className="text-muted-foreground/40">·</span>
            <a
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-muted-foreground/40">·</span>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Payding
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
