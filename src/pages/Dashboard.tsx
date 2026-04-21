import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthReady } from "@/hooks/use-auth-ready";
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
  Lock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import PaymentAlertCard from "@/components/PaymentAlertCard";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isReady: authReady } = useAuthReady();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fetchingPayments, setFetchingPayments] = useState(true);

  // Account settings
  const [profileName, setProfileName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    fetchPayments(user.id);
    fetchProfile(user.id);
  }, [authReady, user?.id, navigate]);

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

    try {
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
    } finally {
      setFetchingPayments(false);
    }
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

  if (!authReady) {
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
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                {profileName ? `Hello, ${profileName}` : "Dashboard"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your payment alerts and account settings
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/profile")}
              className="shrink-0"
            >
              Edit profile
            </Button>
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
                  <div className="grid gap-4">
                    {payments.map((p) => (
                      <PaymentAlertCard
                        key={p.id}
                        payment={p}
                        onDelete={handleDeletePayment}
                      />
                    ))}
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
