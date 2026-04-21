import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuthReady } from "@/hooks/use-auth-ready";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import useSEO from "@/hooks/use-seo";

const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name cannot be empty" })
  .max(100, { message: "Name must be less than 100 characters" });

const Profile = () => {
  const navigate = useNavigate();
  const { user, isReady: authReady } = useAuthReady();
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useSEO({
    title: "Edit Profile | Payding",
    description: "Update your profile name and account details.",
    path: "/profile",
  });

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    void loadProfile(user.id);
  }, [authReady, user?.id, navigate]);

  const loadProfile = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", userId)
      .single();
    if (error) {
      toast.error("Failed to load profile");
    } else {
      setName(data?.name ?? "");
      setOriginalName(data?.name ?? "");
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const result = nameSchema.safeParse(name);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: result.data })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update name");
    } else {
      setOriginalName(result.data);
      setName(result.data);
      toast.success("Profile updated");
      navigate("/dashboard");
    }
    setSaving(false);
  };

  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isUnchanged = name.trim() === originalName.trim();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 max-w-xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground mt-1">
              Update your name to personalize your dashboard greeting.
            </p>
          </div>

          <form
            onSubmit={handleSave}
            className="bg-card rounded-2xl border border-border shadow-soft p-6 space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                  className="h-11 pl-9"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This name appears in your dashboard greeting.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="font-medium">{user?.email}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={saving || isUnchanged}
                className="h-11"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
