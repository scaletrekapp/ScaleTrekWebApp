import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScaleTrek — The Blueprint Meets The Steel",
  description:
    "An elite investment discovery network bridging visionary Dreamers and verified Reality Checks in the Moroccan and regional ecosystem.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
