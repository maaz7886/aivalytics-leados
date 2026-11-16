// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

export default function ProtectedRoute() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const storedUser = localStorage.getItem("aivalytics_demo_user") || localStorage.getItem("aivalytics_active_user");
        if (storedUser) {
          setSession(JSON.parse(storedUser));
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
        }
      } catch (e) {
        const storedUser = localStorage.getItem("aivalytics_demo_user") || localStorage.getItem("aivalytics_active_user");
        if (storedUser) setSession(JSON.parse(storedUser));
      } finally {
        setLoading(false);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return session ? <Outlet /> : <Navigate to="/auth/signin" replace />;
}
