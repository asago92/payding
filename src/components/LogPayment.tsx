import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Bell, TrendingUp, Plus, Mail, Smartphone } from "lucide-react";
import { toast } from "sonner";

const currencies = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
];

interface LoggedPayment {
  id: string;
  amount: number;
  paymentCurrency: string;
  dateReceived: string;
  localCurrency: string;
  notificationType: string;
  notificationMethod: string;
  threshold: number;
}

const paymentCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
];

const LogPayment = () => {
  const [amount, setAmount] = useState<string>("");
  const [paymentCurrency, setPaymentCurrency] = useState<string>("USD");
  const [dateReceived, setDateReceived] = useState<string>("");
  const [localCurrency, setLocalCurrency] = useState<string>("");
  const [notificationType, setNotificationType] = useState<string>("daily");
  const [notificationMethod, setNotificationMethod] = useState<string>("email");
  const [threshold, setThreshold] = useState<string>("2");
  const [payments, setPayments] = useState<LoggedPayment[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !dateReceived || !localCurrency) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newPayment: LoggedPayment = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      paymentCurrency,
      dateReceived,
      localCurrency,
      notificationType,
      notificationMethod,
      threshold: notificationType === "threshold" ? parseFloat(threshold) : 0,
    };

    setPayments([newPayment, ...payments]);
    toast.success(`Payment logged! We'll send ${notificationMethod === "email" ? "email" : "push"} alerts when rates are favorable.`, {
      icon: <Bell className="w-4 h-4" />,
    });

    // Reset form
    setAmount("");
    setPaymentCurrency("USD");
    setDateReceived("");
    setLocalCurrency("");
    setNotificationType("daily");
    setNotificationMethod("email");
    setThreshold("2");
  };

  const getPaymentCurrencySymbol = (code: string) => {
    return paymentCurrencies.find((c) => c.code === code)?.symbol || "$";
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find((c) => c.code === code)?.symbol || "";
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

                  <Button variant="hero" size="lg" className="w-full" type="submit">
                    <Plus className="w-5 h-5" />
                    Log Payment & Set Alert
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

                {payments.length === 0 ? (
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
                            {getPaymentCurrencySymbol(payment.paymentCurrency)}{payment.amount.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            <Check className="w-3 h-3" />
                            Tracking
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            {payment.paymentCurrency} → {getCurrencySymbol(payment.localCurrency)} {payment.localCurrency}
                          </p>
                          <p>Received: {new Date(payment.dateReceived).toLocaleDateString()}</p>
                          <p className="text-xs flex items-center gap-1">
                            {payment.notificationMethod === "email" ? <Mail className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                            {payment.notificationType === "daily"
                              ? "Daily alerts"
                              : `Alert at +${payment.threshold}%`}
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
