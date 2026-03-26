"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useApiClient } from "./use-api-client";
import type { User } from "@sanchay/types";

export function useCurrentUser() {
  const { status } = useSession();
  const api = useApiClient();

  return useQuery<User>({
    queryKey: ["users", "me"],
    queryFn: async () => {
      const response = await api.get<{ data: User }>("/users/me");
      return response.data.data;
    },
    enabled: status === "authenticated",
  });
}
