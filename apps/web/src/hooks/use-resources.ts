"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useApiClient } from "./use-api-client";
import type { Resource, PaginatedResponse } from "@sanchay/types";

interface ListResourcesParams {
  q?: string;
  collection?: string;
  type?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export function useResources(params: ListResourcesParams = {}) {
  const api = useApiClient();
  const { status } = useSession();
  return useQuery<PaginatedResponse<Resource>>({
    queryKey: ["resources", params],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<Resource>>("/resources", {
        params: { ...params },
      });
      return res.data;
    },
    enabled: status === "authenticated",
  });
}

export function useCreateResource() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      url: string;
      collectionId?: string;
      notes?: string;
      tags?: string[];
    }) => {
      const res = await api.post<{ data: Resource }>("/resources", data);
      return res.data.data;
    },
    onMutate: async (newResource) => {
      await queryClient.cancelQueries({ queryKey: ["resources"] });
      const previousResources = queryClient.getQueriesData({ queryKey: ["resources"] });

      // Optimistically prepend the new card
      queryClient.setQueriesData<PaginatedResponse<Resource>>(
        { queryKey: ["resources"] },
        (old) => {
          if (!old) return old;
          const placeholder: Resource = {
            id: `optimistic-${Date.now()}`,
            userId: "",
            collectionId: newResource.collectionId ?? "",
            url: newResource.url,
            title: new URL(newResource.url).hostname,
            favicon: null,
            type: "article",
            notes: newResource.notes ?? null,
            tags: newResource.tags ?? [],
            savedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { ...old, data: [placeholder, ...old.data], total: old.total + 1 };
        },
      );
      return { previousResources };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (_err, _vars, context) => {
      if (context?.previousResources) {
        for (const [key, data] of context.previousResources) {
          queryClient.setQueryData(key, data);
        }
      }
    },
  });
}

export function useUpdateResource() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<Resource, "collectionId" | "notes" | "tags" | "type" | "title">>;
    }) => {
      const res = await api.patch<{ data: Resource }>(`/resources/${id}`, data);
      return res.data.data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

export function useDeleteResource() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/resources/${id}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useMetadataPreview(url: string | null) {
  const api = useApiClient();
  return useQuery<{ title: string; favicon: string | null; type: string }>({
    queryKey: ["metadata", url],
    queryFn: async () => {
      const res = await api.get<{ data: { title: string; favicon: string | null; type: string } }>(
        "/metadata",
        { params: { url } },
      );
      return res.data.data;
    },
    enabled: Boolean(url),
    staleTime: 1000 * 60 * 5,
  });
}
