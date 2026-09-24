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
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
        } else {
          const demoUser = localStorage.getItem("aivalytics_demo_user");
          if (demoUser) {
            setSession(JSON.parse(demoUser));
          }
        }
      } catch (e) {
        const demoUser = localStorage.getItem("aivalytics_demo_user");
        if (demoUser) setSession(JSON.parse(demoUser));
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
