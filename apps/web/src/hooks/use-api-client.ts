"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";

export function useApiClient() {
  const { data: session } = useSession();
  const interceptorIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Eject the previous interceptor before adding a new one
    if (interceptorIdRef.current !== null) {
      apiClient.interceptors.request.eject(interceptorIdRef.current);
    }

    interceptorIdRef.current = apiClient.interceptors.request.use((config) => {
      if (session?.accessToken) {
        config.headers["Authorization"] = `Bearer ${session.accessToken}`;
      }
      return config;
    });

    return () => {
      if (interceptorIdRef.current !== null) {
        apiClient.interceptors.request.eject(interceptorIdRef.current);
        interceptorIdRef.current = null;
      }
    };
  }, [session?.accessToken]);

  return apiClient;
}
