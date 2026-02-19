import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Bell, TrendingUp, Plus, Mail, Smartphone, Loader2, Trash2, Globe } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "COP", name: "Colombian Peso", symbol: "$" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/" },
  { code: "CLP", name: "Chilean Peso", symbol: "$" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
];

const paymentCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
];

const paymentSources = [
  { id: "paypal", name: "PayPal" },
  { id: "wise", name: "Wise" },
  { id: "upwork", name: "Upwork" },
  { id: "fiverr", name: "Fiverr" },
  { id: "stripe", name: "Stripe" },
  { id: "bank", name: "Bank Transfer" },
  { id: "other", name: "Other" },
];

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European Time" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "India Standard Time" },
  { value: "Asia/Singapore", label: "Singapore Time" },
  { value: "Asia/Tokyo", label: "Japan Standard Time" },
  { value: "Asia/Shanghai", label: "China Standard Time" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
  { value: "Africa/Lagos", label: "West Africa Time (Lagos)" },
  { value: "Africa/Nairobi", label: "East Africa Time (Nairobi)" },
  { value: "Africa/Johannesburg", label: "South Africa Standard Time" },
];

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
  timezone?: string;
}

const LogPayment = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [paymentCurrency, setPaymentCurrency] = useState<string>("USD");
  const [dateReceived, setDateReceived] = useState<string>("");
  const [localCurrency, setLocalCurrency] = useState<string>("");
  const [paymentSource, setPaymentSource] = useState<string>("");
  const [notificationType, setNotificationType] = useState<string>("daily");
  const [notificationMethod, setNotificationMethod] = useState<string>("push");
  const [threshold, setThreshold] = useState<string>("2");
  const [timezone, setTimezone] = useState<string>(() => {
    // Try to detect user's timezone
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [guestPayments, setGuestPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const GUEST_PAYMENTS_KEY = "payding_guest_alerts";

  // Load guest payments from localStorage
  const GuestPaymentSchema = z.object({
    id: z.string(),
    amount: z.number(),
    payment_currency: z.string(),
    date_received: z.string(),
    local_currency: z.string(),
    payment_source: z.string(),
    notification_type: z.string(),
    notification_method: z.string(),
    threshold: z.number(),
    is_active: z.boolean(),
    exchange_rate_at_receipt: z.number().nullable(),
    last_checked_rate: z.number().nullable(),
    last_rate_check: z.string().nullable(),
    timezone: z.string().optional(),
  });

  const loadGuestPayments = () => {
    try {
      const stored = localStorage.getItem(GUEST_PAYMENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validated = z.array(GuestPaymentSchema).safeParse(parsed);
        if (validated.success) {
          setGuestPayments(validated.data as Payment[]);
        } else {
          console.warn('Invalid guest payments data, clearing');
          localStorage.removeItem(GUEST_PAYMENTS_KEY);
        }
      }
    } catch (e) {
      console.error("Error loading guest payments:", e);
      localStorage.removeItem(GUEST_PAYMENTS_KEY);
    }
  };

  const saveGuestPayment = (payment: Payment) => {
    try {
      const stored = localStorage.getItem(GUEST_PAYMENTS_KEY);
      const existing: Payment[] = stored ? JSON.parse(stored) : [];
      const updated = [payment, ...existing];
      localStorage.setItem(GUEST_PAYMENTS_KEY, JSON.stringify(updated));
      setGuestPayments(updated);
    } catch (e) {
      console.error("Error saving guest payment:", e);
    }
  };

  const removeGuestPayment = (paymentId: string) => {
    try {
      const updated = guestPayments.filter(p => p.id !== paymentId);
      localStorage.setItem(GUEST_PAYMENTS_KEY, JSON.stringify(updated));
      setGuestPayments(updated);
      toast.success("Alert removed");
    } catch (e) {
      console.error("Error removing guest payment:", e);
    }
  };

  useEffect(() => {
    // Load guest payments on mount
    loadGuestPayments();

    // Check for user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPayments(session.user.id);
      } else {
        setIsFetching(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPayments(session.user.id);
      } else {
        setPayments([]);
        setIsFetching(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPayments = async (userId: string) => {
    setIsFetching(true);
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } else {
      setPayments(data || []);
    }
    setIsFetching(false);
  };

  const fetchExchangeRate = async (base: string, target: string, date?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-exchange-rates', {
        body: { action: 'get_rate', base, target, date }
      });
      
      if (error) throw error;
      return data.rate;
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If email notification is selected and user not logged in, redirect to auth
    if (notificationMethod === "email" && !user) {
      toast.info("Please sign in to receive email notifications");
      navigate("/auth?signup=true");
      return;
    }

    // For push notifications, we can proceed without login
    if (notificationMethod === "push" && !user) {
      if (!agreedToTerms) {
        toast.error("Please agree to the Terms & Conditions before logging a payment.");
        return;
      }
      if (!amount || !dateReceived || !localCurrency || !paymentSource) {
        toast.error("Please fill in all required fields");
        return;
      }

      setIsLoading(true);

      // Fetch exchange rates for guest payment
      const rateAtReceipt = await fetchExchangeRate(paymentCurrency, localCurrency, dateReceived);
      const currentRate = await fetchExchangeRate(paymentCurrency, localCurrency);

      const guestPayment: Payment = {
        id: crypto.randomUUID(),
        amount: parseFloat(amount),
        payment_currency: paymentCurrency,
        date_received: dateReceived,
        local_currency: localCurrency,
        payment_source: paymentSource,
        notification_type: notificationType,
        notification_method: "push",
        threshold: notificationType === "threshold" ? parseFloat(threshold) : 0,
        is_active: true,
        exchange_rate_at_receipt: rateAtReceipt,
        last_checked_rate: currentRate,
        last_rate_check: new Date().toISOString(),
        timezone: timezone,
      };

      saveGuestPayment(guestPayment);
      
      toast.success("Push notification alert set!", {
        icon: <Bell className="w-4 h-4" />,
      });

      // Reset form
      setAmount("");
      setPaymentCurrency("USD");
      setDateReceived("");
      setLocalCurrency("");
      setPaymentSource("");
      setNotificationType("daily");
      setThreshold("2");
      setIsLoading(false);
      return;
    }

    if (!amount || !dateReceived || !localCurrency || !paymentSource) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    // Fetch the exchange rate for the date payment was received
    const rateAtReceipt = await fetchExchangeRate(paymentCurrency, localCurrency, dateReceived);
    const currentRate = await fetchExchangeRate(paymentCurrency, localCurrency);

    const { error } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: parseFloat(amount),
        payment_currency: paymentCurrency,
        date_received: dateReceived,
        local_currency: localCurrency,
        payment_source: paymentSource,
        notification_type: notificationType,
        notification_method: notificationMethod,
        threshold: notificationType === "threshold" ? parseFloat(threshold) : 0,
        exchange_rate_at_receipt: rateAtReceipt,
        last_checked_rate: currentRate,
        last_rate_check: new Date().toISOString(),
        timezone: timezone,
      });

    if (error) {
      console.error('Error saving payment:', error);
      toast.error("Failed to log payment");
    } else {
      toast.success(`Payment logged! We'll notify you when rates improve vs your payment date.`, {
        icon: <Bell className="w-4 h-4" />,
      });
      
      // Refresh payments list
      fetchPayments(user.id);

      // Reset form
      setAmount("");
      setPaymentCurrency("USD");
      setDateReceived("");
      setLocalCurrency("");
      setPaymentSource("");
      setNotificationType("daily");
      setNotificationMethod("email");
      setThreshold("2");
    }

    setIsLoading(false);
  };

  const handleDeletePayment = async (paymentId: string) => {
    const { error } = await supabase
      .from('payments')
      .update({ is_active: false })
      .eq('id', paymentId);

    if (error) {
      toast.error("Failed to remove payment");
    } else {
      toast.success("Payment alert removed");
      setPayments(payments.filter(p => p.id !== paymentId));
    }
  };

  const getPaymentCurrencySymbol = (code: string) => {
    return paymentCurrencies.find((c) => c.code === code)?.symbol || "$";
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find((c) => c.code === code)?.symbol || "";
  };

  const getSourceName = (id: string) => {
    return paymentSources.find((s) => s.id === id)?.name || id;
  };

  return (
    <section id="log-payment" className="py-24 bg-secondary/30">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Log a New Payment
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Track your international earnings and get notified when it's the perfect time to transfer.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border shadow-soft p-8">
                <div className="space-y-6">
                  {/* Amount & Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-amount" className="text-sm font-medium">
                      Amount Received *
                    </Label>
                    <div className="flex gap-3">
                      <Select value={paymentCurrency} onValueChange={setPaymentCurrency}>
                        <SelectTrigger className="w-28 h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentCurrencies.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              {curr.symbol} {curr.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {getPaymentCurrencySymbol(paymentCurrency)}
                        </span>
                        <Input
                          id="payment-amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-8 h-12"
                          placeholder="1000"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Source */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-source" className="text-sm font-medium">
                      Payment Source *
                    </Label>
                    <Select value={paymentSource} onValueChange={setPaymentSource}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Where did you receive this payment?" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentSources.map((source) => (
                          <SelectItem key={source.id} value={source.id}>
                            {source.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Received */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-date" className="text-sm font-medium">
                      Date Received *
                    </Label>
                    <Input
                      id="payment-date"
                      type="date"
                      value={dateReceived}
                      onChange={(e) => setDateReceived(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  {/* Local Currency */}
                  <div className="space-y-2">
                    <Label htmlFor="local-currency" className="text-sm font-medium">
                      Your Local Currency *
                    </Label>
                    <Select value={localCurrency} onValueChange={setLocalCurrency}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your local currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            {curr.symbol} {curr.name} ({curr.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notification Preference */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Notification Preference</Label>
                    <RadioGroup
                      value={notificationType}
                      onValueChange={setNotificationType}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily" className="flex-1 cursor-pointer">
                          <div className="font-medium">Daily Updates</div>
                          <div className="text-sm text-muted-foreground">
                            Get notified every day about rate changes
                          </div>
                        </Label>
                        <Bell className="w-5 h-5 text-muted-foreground" />
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="threshold" id="threshold" />
                        <Label htmlFor="threshold" className="flex-1 cursor-pointer">
                          <div className="font-medium">Threshold Only</div>
                          <div className="text-sm text-muted-foreground">
                            Only notify when rate jumps by a specific %
                          </div>
                        </Label>
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </RadioGroup>

                    {notificationType === "threshold" && (
                      <div className="pl-8 animate-fade-in">
                        <Label htmlFor="threshold-value" className="text-sm font-medium">
                          Alert me when rate increases by:
                        </Label>
                        <div className="relative mt-2">
                          <Input
                            id="threshold-value"
                            type="number"
                            value={threshold}
                            onChange={(e) => setThreshold(e.target.value)}
                            className="pr-8 h-12"
                            placeholder="2"
                            min="0.5"
                            max="50"
                            step="0.5"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            %
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notification Method */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">How would you like to be notified?</Label>
                    <RadioGroup
                      value={notificationMethod}
                      onValueChange={setNotificationMethod}
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            <span className="font-medium">Email</span>
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="push" id="push" />
                        <Label htmlFor="push" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-primary" />
                            <span className="font-medium">Push</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Timezone Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      Your Timezone (for 8 AM alerts)
                    </Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Daily rate alerts will be sent at 8:00 AM in your selected timezone
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground text-center bg-secondary/50 p-3 rounded-lg">
                    <strong>TL;DR:</strong> We provide the data, but you make the call. We aren't responsible for market shifts or how your bank handles your money.
                  </p>

                  {!user && (
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="guest-terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                        className="mt-0.5"
                      />
                      <label htmlFor="guest-terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                        I agree to the{" "}
                        <a href="/terms" target="_blank" className="text-primary hover:underline">
                          Terms & Conditions
                        </a>{" "}
                        and acknowledge that Payding provides information, not financial advice.
                      </label>
                    </div>
                  )}

                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="w-full" 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    {notificationMethod === "email" && !user 
                      ? "Sign Up & Set Alert" 
                      : "Log Payment & Set Alert"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Logged Payments */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border shadow-soft p-6 h-full">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Active Alerts
                </h3>

                {isFetching ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !user && guestPayments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No alerts yet.</p>
                    <p className="text-sm">Log a payment to start tracking.</p>
                  </div>
                ) : !user && guestPayments.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                      <Smartphone className="w-3 h-3 inline mr-1" />
                      Guest alerts (stored locally)
                    </p>
                    {guestPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="p-4 rounded-xl bg-secondary/50 border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xl font-bold">
                            {getPaymentCurrencySymbol(payment.payment_currency)}{Number(payment.amount).toLocaleString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              <Check className="w-3 h-3" />
                              Tracking
                            </div>
                            <button
                              onClick={() => removeGuestPayment(payment.id)}
                              className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                              title="Remove alert"
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            {payment.payment_currency} → {getCurrencySymbol(payment.local_currency)} {payment.local_currency}
                          </p>
                          <p>Source: {getSourceName(payment.payment_source)}</p>
                          <p>Received: {new Date(payment.date_received).toLocaleDateString()}</p>
                          {payment.exchange_rate_at_receipt && payment.last_checked_rate && (
                            <div className="mt-2 p-2 bg-background/50 rounded-lg">
                              <p className="text-xs">
                                Rate at receipt: <span className="font-medium">{payment.exchange_rate_at_receipt.toFixed(4)}</span>
                              </p>
                              <p className="text-xs">
                                Current rate: <span className="font-medium">{payment.last_checked_rate.toFixed(4)}</span>
                              </p>
                              {(() => {
                                const localAmountAtReceipt = payment.amount * payment.exchange_rate_at_receipt;
                                const localAmountNow = payment.amount * payment.last_checked_rate;
                                const difference = localAmountNow - localAmountAtReceipt;
                                const formattedDiff = Math.abs(difference).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                const dateStr = new Date(payment.date_received).toLocaleDateString();
                                
                                if (Math.abs(difference) < 0.01) {
                                  return (
                                    <p className="text-xs font-medium text-muted-foreground">
                                      No change in {payment.local_currency} value since {dateStr}
                                    </p>
                                  );
                                }
                                return (
                                  <p className={`text-xs font-medium ${difference > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    You get {difference > 0 ? 'an extra' : 'less'} {getCurrencySymbol(payment.local_currency)}{formattedDiff} {payment.local_currency} today compared to {dateStr}
                                  </p>
                                );
                              })()}
                            </div>
                          )}
                          <p className="text-xs flex items-center gap-1">
                            <Smartphone className="w-3 h-3" />
                            {payment.notification_type === "daily"
                              ? "Daily alerts (vs payment date)"
                              : `Alert at +${payment.threshold}% vs payment date`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No payments logged yet.</p>
                    <p className="text-sm">Log a payment to start tracking.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="p-4 rounded-xl bg-secondary/50 border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xl font-bold">
                            {getPaymentCurrencySymbol(payment.payment_currency)}{Number(payment.amount).toLocaleString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              <Check className="w-3 h-3" />
                              Tracking
                            </div>
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
                              title="Remove alert"
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            {payment.payment_currency} → {getCurrencySymbol(payment.local_currency)} {payment.local_currency}
                          </p>
                          <p>Source: {getSourceName(payment.payment_source)}</p>
                          <p>Received: {new Date(payment.date_received).toLocaleDateString()}</p>
                          {payment.exchange_rate_at_receipt && payment.last_checked_rate && (
                            <div className="mt-2 p-2 bg-background/50 rounded-lg">
                              <p className="text-xs">
                                Rate at receipt: <span className="font-medium">{payment.exchange_rate_at_receipt.toFixed(4)}</span>
                              </p>
                              <p className="text-xs">
                                Current rate: <span className="font-medium">{payment.last_checked_rate.toFixed(4)}</span>
                              </p>
                              {(() => {
                                const localAmountAtReceipt = Number(payment.amount) * Number(payment.exchange_rate_at_receipt);
                                const localAmountNow = Number(payment.amount) * Number(payment.last_checked_rate);
                                const difference = localAmountNow - localAmountAtReceipt;
                                const formattedDiff = Math.abs(difference).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                const dateStr = new Date(payment.date_received).toLocaleDateString();
                                
                                if (Math.abs(difference) < 0.01) {
                                  return (
                                    <p className="text-xs font-medium text-muted-foreground">
                                      No change in {payment.local_currency} value since {dateStr}
                                    </p>
                                  );
                                }
                                return (
                                  <p className={`text-xs font-medium ${difference > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    You get {difference > 0 ? 'an extra' : 'less'} {getCurrencySymbol(payment.local_currency)}{formattedDiff} {payment.local_currency} today compared to {dateStr}
                                  </p>
                                );
                              })()}
                            </div>
                          )}
                          <p className="text-xs flex items-center gap-1">
                            {payment.notification_method === "email" ? <Mail className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                            {payment.notification_type === "daily"
                              ? "Daily alerts (vs payment date)"
                              : `Alert at +${payment.threshold}% vs payment date`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogPayment;
