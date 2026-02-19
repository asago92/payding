import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, LogOut, User, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        toast.error("Failed to sign out");
      } else {
        setUser(null);
        toast.success("Signed out successfully");
        navigate("/");
      }
    } catch (err) {
      toast.error("Failed to sign out");
    }
  };

  const navLinks = [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#log-payment", label: "Log Payment" },
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "#faq", label: "FAQ" },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Payding</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Auth CTA */}
          <div className="hidden md:flex">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="max-w-[150px] truncate">{user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  <span className="ml-2">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate("/auth?signup=true")}>
                  Create Account
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-lg md:hidden animate-fade-in"
        >
          <nav className="flex flex-col p-6 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="text-lg font-medium text-foreground py-3 px-4 rounded-xl hover:bg-secondary transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="border-t border-border my-4" />

            {user ? (
              <div className="space-y-3 px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <Button variant="outline" className="w-full" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-3 px-4">
                <Button variant="outline" className="w-full" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}>
                  Sign In
                </Button>
                <Button variant="default" className="w-full" onClick={() => { navigate("/auth?signup=true"); setMobileMenuOpen(false); }}>
                  Create Account
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
