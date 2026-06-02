import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "InterLingo",
    short_name: "InterLingo",
    description: "Recall-first multilingual learning.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#24a68a",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}

