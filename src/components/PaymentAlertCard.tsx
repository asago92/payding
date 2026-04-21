import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RateSparkline from "@/components/RateSparkline";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const WISE_AFFILIATE_LINKS: Record<string, string> = {
  USD: "https://wise.prf.hn/l/gx2xPje/",
  GBP: "https://wise.prf.hn/l/jXMX8y9/",
  AUD: "https://wise.prf.hn/l/p3oLkXe/",
  EUR: "https://wise.prf.hn/l/PlbGoRP/",
  JPY: "https://wise.prf.hn/l/xE1kXyP/",
};

const DEFAULT_WISE_LINK = "https://wise.com/invite/dic/a48d710";

const currencySymbols: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$", JPY: "¥", SGD: "S$",
  AED: "د.إ", CHF: "CHF", CNY: "¥", HKD: "HK$", NZD: "NZ$", INR: "₹",
  NGN: "₦", KES: "KSh", GHS: "₵", ZAR: "R", PHP: "₱", BRL: "R$", MXN: "$",
  PLN: "zł", CZK: "Kč", TRY: "₺", THB: "฿", MYR: "RM", IDR: "Rp", KRW: "₩",
  SEK: "kr", NOK: "kr", DKK: "kr", HUF: "Ft", PKR: "₨", BDT: "৳", LKR: "Rs",
  VND: "₫", COP: "$", PEN: "S/", CLP: "$", EGP: "E£",
};

const sourceLabels: Record<string, string> = {
  paypal: "PayPal", wise: "Wise", upwork: "Upwork", fiverr: "Fiverr",
  stripe: "Stripe", bank: "Bank Transfer", other: "Other",
};

export interface PaymentAlertData {
  id: string;
  amount: number;
  payment_currency: string;
  date_received: string;
  local_currency: string;
  payment_source: string;
  exchange_rate_at_receipt: number | null;
  last_checked_rate: number | null;
}

interface PaymentAlertCardProps {
  payment: PaymentAlertData;
  onDelete: (id: string) => void;
}

// Threshold (absolute %) below which we consider the rate "stable".
const STABLE_THRESHOLD = 0.5;

const PaymentAlertCard = ({ payment, onDelete }: PaymentAlertCardProps) => {
  const sym = (code: string) => currencySymbols[code] || code;
  const srcLabel = sourceLabels[payment.payment_source] || payment.payment_source;

  // Real 30-day rate history fetched from the edge function on mount
  const [history, setHistory] = useState<number[] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        const toISO = (d: Date) => d.toISOString().slice(0, 10);

        const { data, error } = await supabase.functions.invoke(
          "fetch-exchange-rates",
          {
            body: {
              action: "get_history",
              base: payment.payment_currency,
              target: payment.local_currency,
              start: toISO(start),
              end: toISO(end),
            },
          }
        );
        if (cancelled) return;
        if (error) {
          console.error("Failed to load rate history", error);
          return;
        }
        const series = (data?.series ?? []) as { date: string; rate: number }[];
        if (series.length >= 2) {
          setHistory(series.map((p) => p.rate));
        }
      } catch (e) {
        if (!cancelled) console.error("Rate history fetch error", e);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [payment.payment_currency, payment.local_currency]);

  const hasRates =
    payment.exchange_rate_at_receipt != null && payment.last_checked_rate != null;

  const originalRate = payment.exchange_rate_at_receipt ?? 0;
  const currentRate = payment.last_checked_rate ?? originalRate;
  const originalLocal = payment.amount * originalRate;
  const currentLocal = payment.amount * currentRate;
  const diffLocal = currentLocal - originalLocal;
  const percentChange = hasRates && originalRate
    ? (currentRate - originalRate) / originalRate * 100
    : 0;

  const status: "gain" | "loss" | "stable" = !hasRates
    ? "stable"
    : Math.abs(percentChange) < STABLE_THRESHOLD
      ? "stable"
      : percentChange > 0
        ? "gain"
        : "loss";

  const statusLabel =
    status === "gain" ? "Gained value" : status === "loss" ? "Lost value" : "Stable";

  const dateReceived = new Date(payment.date_received).toLocaleDateString(
    "en-GB",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  const formatLocal = (n: number) =>
    `${sym(payment.local_currency)}${Math.round(Math.abs(n)).toLocaleString()}`;

  const formatRate = (r: number) =>
    `${sym(payment.local_currency)}${r.toFixed(2)} / ${payment.payment_currency}`;

  // Token classes per status (used for the badge container, accent column, and text)
  const badgeBg =
    status === "gain"
      ? "bg-gain-soft text-gain"
      : status === "loss"
        ? "bg-loss-soft text-loss"
        : "bg-stable-soft text-stable";

  const diffPanelBg =
    status === "gain"
      ? "bg-gain-soft"
      : status === "loss"
        ? "bg-loss-soft"
        : "bg-neutral-panel";

  const diffTextColor =
    status === "gain"
      ? "text-gain"
      : status === "loss"
        ? "text-loss"
        : "text-stable";

  const wiseLink =
    WISE_AFFILIATE_LINKS[payment.payment_currency] || DEFAULT_WISE_LINK;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-soft p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
              badgeBg
            )}
          >
            {payment.payment_currency}
          </div>
          <div className="min-w-0">
            <div className="text-xl sm:text-2xl font-bold leading-tight">
              {sym(payment.payment_currency)}
              {Number(payment.amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              Received {dateReceived} · {srcLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap",
              badgeBg
            )}
          >
            {statusLabel}
          </span>
          <button
            onClick={() => onDelete(payment.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Remove alert"
            aria-label="Remove alert"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rate comparison row */}
      <div className="flex items-stretch gap-2 sm:gap-3">
        <RatePanel
          label="Original at receipt"
          amount={formatLocal(originalLocal)}
          subline={`@ ${formatRate(originalRate)}`}
          tone="neutral"
        />
        <Connector icon="arrow" />
        <RatePanel
          label="Current value"
          amount={formatLocal(currentLocal)}
          subline={`@ ${formatRate(currentRate)}`}
          tone="neutral"
        />
        <Connector icon="equals" />
        <RatePanel
          label="Difference"
          amount={`${diffLocal >= 0 ? "+" : "−"}${formatLocal(diffLocal)}`}
          subline={
            <span className={cn("flex items-center gap-1", diffTextColor)}>
              {status === "gain" && <ChevronUp className="w-3.5 h-3.5" />}
              {status === "loss" && <ChevronDown className="w-3.5 h-3.5" />}
              {percentChange >= 0 ? "+" : ""}
              {percentChange.toFixed(2)}%
            </span>
          }
          tone={status}
          highlightAmount
        />
      </div>

      {/* Sparkline footer */}
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-4">
        <span className="text-xs sm:text-sm text-muted-foreground">
          Rate trend · last 30 days
        </span>
        <RateSparkline status={status} className="shrink-0" />
      </div>

      {/* Wise CTA */}
      <div className="mt-4 flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5"
          onClick={() => window.open(wiseLink, "_blank", "noopener,noreferrer")}
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
};

interface RatePanelProps {
  label: string;
  amount: string;
  subline: React.ReactNode;
  tone: "neutral" | "gain" | "loss" | "stable";
  highlightAmount?: boolean;
}

const RatePanel = ({ label, amount, subline, tone, highlightAmount }: RatePanelProps) => {
  const bg =
    tone === "gain"
      ? "bg-gain-soft"
      : tone === "loss"
        ? "bg-loss-soft"
        : tone === "stable"
          ? "bg-neutral-panel"
          : "bg-neutral-panel";

  const labelColor =
    tone === "gain"
      ? "text-gain-foreground"
      : tone === "loss"
        ? "text-loss-foreground"
        : "text-muted-foreground";

  const amountColor = highlightAmount
    ? tone === "gain"
      ? "text-gain"
      : tone === "loss"
        ? "text-loss"
        : "text-foreground"
    : "text-foreground";

  return (
    <div className={cn("flex-1 min-w-0 rounded-xl px-3 py-3 sm:px-4 sm:py-4", bg)}>
      <div className={cn("text-[10px] sm:text-xs font-medium uppercase tracking-wide", labelColor)}>
        {label}
      </div>
      <div className={cn("mt-1 text-lg sm:text-2xl font-bold leading-tight truncate", amountColor)}>
        {amount}
      </div>
      <div className="mt-1 text-xs text-muted-foreground truncate">{subline}</div>
    </div>
  );
};

const Connector = ({ icon }: { icon: "arrow" | "equals" }) => (
  <div className="flex items-center text-muted-foreground shrink-0">
    {icon === "arrow" ? (
      <ArrowRight className="w-4 h-4" />
    ) : (
      <span className="text-base font-medium">=</span>
    )}
  </div>
);

export default PaymentAlertCard;
