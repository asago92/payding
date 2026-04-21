import { Bell, TrendingUp } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Log the payment",
    description: "Drop in the amount, the currency, and the date. No bank logins, no OAuth dance.",
    color: "primary" as const,
  },
  {
    step: "02",
    title: "Pick your signal",
    description: "A daily heads-up, or silence until your rate moves more than you'd shrug at.",
    color: "primary" as const,
  },
  {
    step: "03",
    title: "Convert on a green day",
    description: "We email the moment today beats your payday rate. Move money. Repeat.",
    color: "accent" as const,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three simple steps to maximize your earnings from international payments.
          </p>
        </div>

        <div className="max-w-6xl mx-auto relative">
          {/* Connector line with dots — desktop only */}
          <div className="hidden md:block absolute top-3 left-0 right-0 px-[8%]">
            <div className="relative h-0.5 bg-gradient-to-r from-primary via-primary to-accent">
              <span className="absolute -left-1 -top-[5px] w-3 h-3 rounded-full bg-primary" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-[5px] w-3 h-3 rounded-full bg-primary" />
              <span className="absolute -right-1 -top-[7px] w-4 h-4 rounded-full bg-accent shadow-[0_0_0_6px_hsl(var(--accent)/0.2)]" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8 pt-10">
            {steps.map((step, index) => (
              <div key={step.step} className="flex flex-col">
                {/* Big number + circle marker */}
                <div className="flex items-start justify-between mb-6">
                  <h3
                    className={`text-6xl sm:text-7xl font-bold leading-none ${
                      step.color === "accent" ? "text-accent" : "text-primary"
                    }`}
                  >
                    {step.step}
                  </h3>
                  <div
                    className={`hidden md:block w-6 h-6 rounded-full border-2 mt-2 ${
                      step.color === "accent" ? "border-accent" : "border-primary"
                    }`}
                  />
                </div>

                <h4 className="text-2xl font-bold mb-3 text-foreground">
                  {step.title}
                </h4>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Visual mockup */}
                <div className="mt-auto">
                  {index === 0 && (
                    <div className="bg-secondary/40 rounded-2xl p-5 border border-border">
                      <div className="flex items-center gap-2 mb-4 text-sm font-medium text-foreground">
                        <Bell className="w-4 h-4 text-primary" />
                        Active Payment Alerts
                      </div>
                      <div className="bg-card rounded-xl p-4 shadow-soft">
                        <div className="text-2xl font-bold text-foreground">$61.95</div>
                        <div className="text-xs text-muted-foreground mb-2">USD → ZAR</div>
                        <div className="flex items-center gap-1 text-sm font-medium text-primary">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +0.00% vs receipt
                        </div>
                        <div className="text-sm text-primary font-medium">+R0.00 ZAR today</div>
                      </div>
                    </div>
                  )}

                  {index === 1 && (
                    <div className="bg-secondary/40 rounded-2xl p-5 border border-border">
                      <div className="bg-card rounded-xl p-1 mb-4 flex shadow-soft">
                        <button className="flex-1 py-2 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                          Only big moves
                        </button>
                        <button className="flex-1 py-2 px-3 text-sm font-medium text-muted-foreground">
                          Daily
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-muted-foreground">Threshold</span>
                        <span className="font-medium text-foreground">≥ 1.5%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-[55%] bg-primary rounded-full" />
                      </div>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="bg-secondary/40 rounded-2xl p-5 border border-border">
                      <div className="gradient-hero rounded-xl p-3 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-card/30 flex items-center justify-center text-xs font-bold text-primary-foreground">
                          P
                        </span>
                        <span className="px-2 py-0.5 rounded bg-accent text-accent-foreground text-xs font-bold">
                          Payding
                        </span>
                      </div>
                      <div className="bg-primary/10 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-primary mb-1">+2.95%</div>
                        <div className="text-xs text-primary/80">
                          Rate has improved — now's a good time to convert.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
