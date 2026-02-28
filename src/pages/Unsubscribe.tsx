import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const paymentId = searchParams.get("id");
    if (!paymentId) {
      setStatus("error");
      return;
    }

    const doUnsubscribe = async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unsubscribe?id=${paymentId}`;
        const res = await fetch(url, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        });
        setStatus(res.ok ? "success" : "error");
      } catch {
        setStatus("error");
      }
    };

    doUnsubscribe();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {status === "loading" && (
          <p className="text-muted-foreground text-lg">Processing...</p>
        )}
        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-bold">P</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Unsubscribed</h1>
            <p className="text-muted-foreground">
              You've been unsubscribed from exchange rate alerts for this payment. 
              You can re-enable tracking anytime from your dashboard.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-destructive mb-2">Something went wrong</h1>
            <p className="text-muted-foreground">
              We couldn't process your unsubscribe request. Please try again later.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
