import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DogBreederDocs.online — Editable Breeder Documents",
  description: "State-aware, fully editable dog breeder forms with reusable account access.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
