import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bell,
  Settings,
  Loader2,
  Check,
  Trash2,
  Lock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Mail,
  Smartphone,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

const WISE_AFFILIATE_LINKS: Record<string, string> = {
  USD: "https://wise.prf.hn/l/gx2xPje/",
  GBP: "https://wise.prf.hn/l/jXMX8y9/",
  AUD: "https://wise.prf.hn/l/p3oLkXe/",
  EUR: "https://wise.prf.hn/l/PlbGoRP/",
  JPY: "https://wise.prf.hn/l/xE1kXyP/",
};

const DEFAULT_WISE_LINK = "https://wise.com/invite/dic/a48d710";

interface Payment {
  id: string;
  amount: number;
  payment_currency: string;
  date_received: string;
  local_currency: string;
  payment_source: string;
  notification_type: string;
  notification_method: string;
  threshold: number;
  is_active: boolean;
  exchange_rate_at_receipt: number | null;
  last_checked_rate: number | null;
  last_rate_check: string | null;
  timezone?: string | null;
}

const currencies: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$", JPY: "¥", SGD: "S$",
  AED: "د.إ", CHF: "CHF", CNY: "¥", HKD: "HK$", NZD: "NZ$", INR: "₹",
  NGN: "₦", KES: "KSh", GHS: "₵", ZAR: "R", PHP: "₱", BRL: "R$", MXN: "$",
  PLN: "zł", CZK: "Kč", TRY: "₺", THB: "฿", MYR: "RM", IDR: "Rp", KRW: "₩",
  SEK: "kr", NOK: "kr", DKK: "kr", HUF: "Ft", PKR: "₨", BDT: "৳", LKR: "Rs",
  VND: "₫", COP: "$", PEN: "S/", CLP: "$", EGP: "E£",
};

const sources: Record<string, string> = {
  paypal: "PayPal", wise: "Wise", upwork: "Upwork", fiverr: "Fiverr",
  stripe: "Stripe", bank: "Bank Transfer", other: "Other",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fetchingPayments, setFetchingPayments] = useState(true);

  // Account settings
  const [profileName, setProfileName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        navigate("/auth");
      } else {
        fetchPayments(currentUser.id);
        fetchProfile(currentUser.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", userId)
      .single();
    if (data?.name) setProfileName(data.name);
  };

  const handleSaveName = async () => {
    if (!user) return;
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: profileName })
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update name");
    } else {
      toast.success("Name updated");
    }
    setSavingName(false);
  };

  const fetchPayments = async (userId: string) => {
    setFetchingPayments(true);
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load payments");
    } else {
      setPayments(data || []);
    }
    setFetchingPayments(false);
  };

  const handleDeletePayment = async (paymentId: string) => {
    const { error } = await supabase
      .from("payments")
      .update({ is_active: false })
      .eq("id", paymentId);

    if (error) {
      toast.error("Failed to remove alert");
    } else {
      toast.success("Alert removed");
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    }
    setUpdatingPassword(false);
  };

  const sym = (code: string) => currencies[code] || code;
  const src = (id: string) => sources[id] || id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {profileName ? `Hello, ${profileName}` : "Dashboard"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your payment alerts and account settings
            </p>
          </div>

          <Tabs defaultValue="alerts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-xs">
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Payment Alerts Tab */}
            <TabsContent value="alerts">
              <div className="bg-card rounded-2xl border border-border shadow-soft p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Active Payment Alerts
                  </h2>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => {
                      navigate("/#log-payment");
                    }}
                  >
                    + New Alert
                  </Button>
                </div>

                {fetchingPayments ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium mb-1">No active alerts</p>
                    <p className="text-sm">Log a payment on the home page to start tracking exchange rates.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {payments.map((p) => {
                      const rateChange =
                        p.exchange_rate_at_receipt && p.last_checked_rate
                          ? ((p.last_checked_rate - p.exchange_rate_at_receipt) / p.exchange_rate_at_receipt) * 100
                          : null;
                      const localDiff =
                        p.exchange_rate_at_receipt && p.last_checked_rate
                          ? p.amount * p.last_checked_rate - p.amount * p.exchange_rate_at_receipt
                          : null;

                      return (
                        <div
                          key={p.id}
                          className="p-5 rounded-xl bg-secondary/40 border border-border hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <span className="text-2xl font-bold">
                                {sym(p.payment_currency)}
                                {Number(p.amount).toLocaleString()}
                              </span>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {p.payment_currency} → {p.local_currency}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeletePayment(p.id)}
                              className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Remove alert"
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>

                          <div className="text-sm text-muted-foreground space-y-1.5">
                            <p>Source: {src(p.payment_source)}</p>
                            <p>Received: {new Date(p.date_received).toLocaleDateString()}</p>
                          </div>

                          {rateChange !== null && localDiff !== null && (
                            <div className="mt-3 p-3 bg-background/60 rounded-lg space-y-1">
                              <div className="flex items-center gap-1.5">
                                {rateChange >= 0 ? (
                                  <TrendingUp className="w-4 h-4 text-primary" />
                                ) : (
                                  <TrendingDown className="w-4 h-4 text-destructive" />
                                )}
                                <span
                                  className={`text-sm font-semibold ${
                                    rateChange >= 0 ? "text-primary" : "text-destructive"
                                  }`}
                                >
                                  {rateChange >= 0 ? "+" : ""}
                                  {rateChange.toFixed(2)}%
                                </span>
                                <span className="text-xs text-muted-foreground">vs receipt</span>
                              </div>
                              <p
                                 className={`text-xs font-medium ${
                                  localDiff >= 0 ? "text-primary" : "text-destructive"
                                }`}
                              >
                                {localDiff >= 0 ? "+" : ""}
                                {sym(p.local_currency)}
                                {Math.abs(localDiff).toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}{" "}
                                {p.local_currency} today
                              </p>
                            </div>
                          )}

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {p.notification_method === "email" ? (
                                <Mail className="w-3 h-3" />
                              ) : (
                                <Smartphone className="w-3 h-3" />
                              )}
                              {p.notification_type === "daily"
                                ? "Daily alerts"
                                : `Alert at +${p.threshold}%`}
                              <span className="ml-auto">
                                <span className="inline-flex items-center gap-1 text-primary">
                                  <Check className="w-3 h-3" />
                                  Active
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 gap-1.5"
                              onClick={() =>
                                window.open(
                                  WISE_AFFILIATE_LINKS[p.payment_currency] || DEFAULT_WISE_LINK,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                            >
                              Cash out via Wise
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help text-muted-foreground hover:text-foreground transition-colors">
                                    <Info className="w-3.5 h-3.5" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[240px] text-xs leading-relaxed">
                                  This is an affiliate link. If you use Wise through us, we may earn a small commission which helps keep this tool free for you! 🙏
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Account Settings Tab */}
            <TabsContent value="settings">
              <div className="space-y-6">
                {/* Account Info */}
                <div className="bg-card rounded-2xl border border-border shadow-soft p-6">
                  <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name" className="text-sm text-muted-foreground">Name</Label>
                      <div className="flex gap-2 max-w-sm">
                        <Input
                          id="profile-name"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="Your name"
                          className="h-11"
                        />
                        <Button onClick={handleSaveName} disabled={savingName} size="sm" className="h-11 px-4">
                          {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Email</Label>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Member Since</Label>
                      <p className="font-medium">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Active Alerts</Label>
                      <p className="font-medium">{payments.length}</p>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-card rounded-2xl border border-border shadow-soft p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    Change Password
                  </h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        minLength={6}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="h-11"
                      />
                    </div>
                    <Button type="submit" disabled={updatingPassword}>
                      {updatingPassword ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Update Password
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
