import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Tibo", short_name: "Tibo", description: "A local-first decision ledger for coding agents.", start_url: "/", display: "standalone", background_color: "#0b0b0a", theme_color: "#0b0b0a", icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }] };
}
