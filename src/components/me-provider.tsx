"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface MeData {
  id: string;
  first_name: string;
  last_name: string;
  photo_signed_url: string | null;
  unread_count: number;
}

interface MeContextValue {
  me: MeData | null;
  loading: boolean;
  refetch: () => void;
}

const MeContext = createContext<MeContextValue>({
  me: null,
  loading: true,
  refetch: () => {},
});

export function useMe() {
  return useContext(MeContext);
}

export function MeProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMe = async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        setMe(await res.json());
      } else {
        setMe(null);
      }
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        fetchMe();
      } else {
        setMe(null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        fetchMe();
      } else {
        setMe(null);
        setLoading(false);
      }
    });

    intervalRef.current = setInterval(fetchMe, 30_000);

    return () => {
      subscription.unsubscribe();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MeContext.Provider value={{ me, loading, refetch: fetchMe }}>
      {children}
    </MeContext.Provider>
  );
}
