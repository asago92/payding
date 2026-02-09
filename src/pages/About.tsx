import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
            About Us
          </h1>

          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              As remote workers and freelancers, we noticed a frustrating pattern:
              we'd work hard, get paid in foreign currency, and then lose a
              significant chunk of our paycheck simply because we converted on the
              "wrong" day.
            </p>

            <p>
              We realized that timing the market shouldn't be a full-time job or a
              guessing game. We built <span className="text-foreground font-semibold">Payding</span> to
              take the emotion out of exchange rates. We wanted a tool that didn't
              just show us numbers, but showed us{" "}
              <span className="text-foreground font-semibold">opportunity</span>.
            </p>

            <p>
              Now, we help thousands of global earners get the "raise" they
              deserve, just by waiting for the right notification.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
