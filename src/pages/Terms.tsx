import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last Updated: February 2026
          </p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                1. Scope of Service
              </h2>
              <p>
                Payding is a financial information tool that provides currency
                exchange rate notifications based on mid-market data. We are not a
                bank, a currency exchange, or a financial advisor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                2. "Information Only" Disclaimer
              </h2>
              <p>
                All data provided by Payding is for informational purposes only.
                While we strive for accuracy, currency markets move rapidly. The
                rates shown in-app may differ from the rates offered by your bank
                or transfer provider (e.g., Wise, PayPal) at the time of your
                transaction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                3. No Financial Liability
              </h2>
              <p className="mb-3">
                By using Payding, you agree that:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  You are solely responsible for your decision to hold or convert
                  currency.
                </li>
                <li>
                  Payding is not liable for any financial losses, missed
                  opportunities, or "bad timing" resulting from our notifications
                  or data.
                </li>
                <li>
                  Past performance of exchange rates is not a guarantee of future
                  trends.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                4. Affiliate Disclosure
              </h2>
              <p>
                Some links within the app are affiliate links. If you click on
                these links and perform a transaction (e.g., with Wise or
                Revolut), we may receive a small commission at no extra cost to
                you. This does not influence our data; we remain an unbiased
                information provider.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
