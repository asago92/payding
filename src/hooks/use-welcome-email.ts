import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useWelcomeEmail() {
  const sentRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user && !sentRef.current) {
        sentRef.current = true;
        try {
          await supabase.functions.invoke("send-welcome-email", { body: {} });
        } catch (err) {
          console.error("Welcome email error:", err);
        }
      }
      if (event === "SIGNED_OUT") {
        sentRef.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, []);
}
