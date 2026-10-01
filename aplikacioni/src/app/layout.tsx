import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RideShare",
  description: "Udhëtime të përbashkëta për studentët",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sq" className="dark" style={{ colorScheme: "dark" }}>
      <body>{children}</body>
    </html>
  );
}
