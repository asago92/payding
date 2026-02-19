import { DollarSign } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-secondary/20">
      <div className="container px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Payding</span>
          </div>

          {/* Info */}
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Smart currency alerts for global earners. Keep your funds where they are—we just notify you when to transfer.
          </p>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms & Conditions
            </a>
            <span className="text-muted-foreground/40 hidden sm:inline">·</span>
            <a
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-muted-foreground/40 hidden sm:inline">·</span>
            <a
              href="mailto:contact@payding.xyz"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              contact@payding.xyz
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Payding
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
