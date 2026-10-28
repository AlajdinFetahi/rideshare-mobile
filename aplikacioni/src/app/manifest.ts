import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RideShare AAB",
    short_name: "RideShare",
    description: "Udhëtime drejt AAB; listë publike për lexim offline.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b101b",
    theme_color: "#be3455",
    icons: [192, 512].map((size) => ({
      src: `/icons/icon-${size}.png`,
      sizes: `${size}x${size}`,
      type: "image/png",
    })),
  };
}
