import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-10">
            Last Updated: February 2026
          </p>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                1. Data We Collect
              </h2>
              <p className="mb-3">
                We believe in "Privacy by Design." Because we do not handle your
                money, we do not require your bank account numbers, API keys, or
                login credentials. We collect:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <span className="font-medium text-foreground">Account Info:</span>{" "}
                  Email address (to send notifications).
                </li>
                <li>
                  <span className="font-medium text-foreground">Payment Logs:</span>{" "}
                  Currency type, amount, and date (manually entered by you) to
                  calculate rate shifts.
                </li>
                <li>
                  <span className="font-medium text-foreground">Usage Data:</span>{" "}
                  Standard analytics to improve app performance.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                2. How We Use Your Data
              </h2>
              <p>
                Your payment data is used exclusively to trigger the alerts you
                have requested. We do not sell your personal financial "habits" to
                third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                3. Third-Party Services
              </h2>
              <p>
                Our app links to third-party financial services (like Wise). Once
                you leave Payding, their privacy policies and terms apply. We are
                not responsible for how these third parties handle your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                4. Security
              </h2>
              <p>
                We implement industry-standard security measures to protect your
                email and logged data. However, as this is a free information
                tool, we encourage you not to use your full real-world invoice
                numbers or sensitive identifiers in your "Payment Note" fields.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
