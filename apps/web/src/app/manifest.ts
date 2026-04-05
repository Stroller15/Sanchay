import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sanchay",
    short_name: "Sanchay",
    description: "Save, organize, and find your learning resources",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#22c55e",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    // PWA Web Share Target — allows "Share" from mobile to save directly
    share_target: {
      action: "/save",
      method: "GET",
      params: {
        url: "url",
        text: "text",
        title: "title",
      },
    },
  } as MetadataRoute.Manifest & {
    share_target?: {
      action: string;
      method: string;
      params: { url?: string; text?: string; title?: string };
    };
  };
}
