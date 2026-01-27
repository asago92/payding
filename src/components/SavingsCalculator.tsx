import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, Sparkles } from "lucide-react";

const currencies = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", baseRate: 1580 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", baseRate: 130 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", baseRate: 15.5 },
  { code: "ZAR", name: "South African Rand", symbol: "R", baseRate: 18.5 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", baseRate: 83 },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", baseRate: 56 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", baseRate: 5.0 },
  { code: "MXN", name: "Mexican Peso", symbol: "$", baseRate: 17.2 },
];

const SavingsCalculator = () => {
  const [amount, setAmount] = useState<string>("1000");
  const [currency, setCurrency] = useState<string>("NGN");
  const [rateIncrease, setRateIncrease] = useState<string>("1");
  const [dateReceived, setDateReceived] = useState<string>("");
  const [isCalculated, setIsCalculated] = useState(false);

  const selectedCurrency = currencies.find((c) => c.code === currency);

  const calculation = useMemo(() => {
    const amountNum = parseFloat(amount) || 0;
    const rateNum = parseFloat(rateIncrease) || 0;
    const baseRate = selectedCurrency?.baseRate || 0;

    const originalLocal = amountNum * baseRate;
    const newRate = baseRate * (1 + rateNum / 100);
    const newLocal = amountNum * newRate;
    const savings = newLocal - originalLocal;
    const daysToWait = Math.ceil(rateNum * 3); // Simulated wait time

    return {
      originalLocal,
      newLocal,
      savings,
      daysToWait,
      percentGain: rateNum,
    };
  }, [amount, currency, rateIncrease, selectedCurrency]);

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const formatCurrency = (value: number, currencyCode: string) => {
    const curr = currencies.find((c) => c.code === currencyCode);
    return `${curr?.symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <section id="calculator" className="py-24">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-accent/20 border border-accent/30">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
              <span className="text-sm font-medium">What-If Calculator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Potential Savings Calculator
            </h2>
            <p className="text-muted-foreground">
              See how much extra you could make by waiting for a better rate.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-card rounded-2xl border border-border shadow-soft p-8">
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Amount Received (USD)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 h-12"
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Date Received */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Date Received
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={dateReceived}
                  onChange={(e) => setDateReceived(e.target.value)}
                  className="h-12"
                />
              </div>

              {/* Local Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">
                  Your Local Currency
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select currency" />
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

              {/* Rate Increase */}
              <div className="space-y-2">
                <Label htmlFor="rate" className="text-sm font-medium">
                  "What if" Rate Increase (%)
                </Label>
                <div className="relative">
                  <Input
                    id="rate"
                    type="number"
                    value={rateIncrease}
                    onChange={(e) => setRateIncrease(e.target.value)}
                    className="pr-8 h-12"
                    placeholder="1"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleCalculate}
            >
              <Calculator className="w-5 h-5" />
              Calculate Potential Savings
            </Button>

            {/* Results */}
            {isCalculated && (
              <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground mb-1">
                      You could make an extra{" "}
                      <span className="text-gradient">
                        {formatCurrency(calculation.savings, currency)}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      by waiting approximately {calculation.daysToWait} days for a{" "}
                      {calculation.percentGain}% rate increase.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="px-3 py-1.5 rounded-lg bg-secondary">
                        <span className="text-muted-foreground">Original: </span>
                        <span className="font-medium">
                          {formatCurrency(calculation.originalLocal, currency)}
                        </span>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-secondary">
                        <span className="text-muted-foreground">With {rateIncrease}% gain: </span>
                        <span className="font-medium text-primary">
                          {formatCurrency(calculation.newLocal, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SavingsCalculator;
