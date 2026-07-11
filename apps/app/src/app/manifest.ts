import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#0a0a0f",
    description:
      "A Unicode wireframe design tool where everything renders as box-drawing characters. Share as text.",
    display: "standalone",
    icons: [
      {
        sizes: "32x32",
        src: "/icon",
        type: "image/png",
      },
      {
        sizes: "180x180",
        src: "/apple-icon",
        type: "image/png",
      },
    ],
    name: "Wiretext — Wireframe with text",
    short_name: "Wiretext",
    start_url: "/",
    theme_color: "#0a0a0f",
  };
}
