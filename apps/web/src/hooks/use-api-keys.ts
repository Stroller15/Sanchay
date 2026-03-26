"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./use-api-client";
import type { ApiKey } from "@sanchay/types";

export function useApiKeys() {
  const api = useApiClient();
  return useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await api.get<{ data: ApiKey[] }>("/api-keys");
      return res.data.data;
    },
  });
}

export function useCreateApiKey() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (label?: string) => {
      const res = await api.post<{ data: { key: string; label: string } }>("/api-keys", {
        label: label ?? "API Key",
      });
      return res.data.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}

export function useDeleteApiKey() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api-keys/${id}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
}
