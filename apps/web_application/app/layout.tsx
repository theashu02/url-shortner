import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ReduxProvider } from "@/store/provider";
import { Toaster } from "@/components/ui/toast";

const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-ubuntu",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://simplx.co"),
  title: {
    default: "SimpLx — Short Links, Big Impact",
    template: "%s | SimpLx",
  },
  description:
    "SimpLx is a blazing-fast URL shortener with real-time analytics, custom domains, QR codes, and a developer API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", ubuntu.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-ubuntu" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <AuthProvider>
            <ReduxProvider>
              {children}
            </ReduxProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}