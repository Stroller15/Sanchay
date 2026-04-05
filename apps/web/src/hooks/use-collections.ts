"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useApiClient } from "./use-api-client";
import type { Collection } from "@sanchay/types";

export function useCollections() {
  const api = useApiClient();
  const { status } = useSession();
  return useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await api.get<{ data: Collection[] }>("/collections");
      return res.data.data;
    },
    enabled: status === "authenticated",
  });
}

export function useCreateCollection() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; emoji?: string }) => {
      const res = await api.post<{ data: Collection }>("/collections", data);
      return res.data.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useUpdateCollection() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; emoji?: string; position?: number };
    }) => {
      const res = await api.patch<{ data: Collection }>(`/collections/${id}`, data);
      return res.data.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useDeleteCollection() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/collections/${id}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}
