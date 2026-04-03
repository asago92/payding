import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useWelcomeEmail() {
  const sentRef = useRef(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user && !sentRef.current) {
        sentRef.current = true;
        void supabase.functions
          .invoke("send-welcome-email", { body: {} })
          .catch((err) => {
            console.error("Welcome email error:", err);
          });

        // Trigger Zapier webhook on new signup
        void fetch("https://hooks.zapier.com/hooks/catch/27080843/unj4mil/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            event: "new_user_signup",
            email: session.user.email,
            user_id: session.user.id,
            timestamp: new Date().toISOString(),
          }),
        }).catch((err) => {
          console.error("Zapier webhook error:", err);
        });
      }

      if (event === "SIGNED_OUT") {
        sentRef.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}
