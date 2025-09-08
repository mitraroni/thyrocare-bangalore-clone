import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/cart-context";

export const metadata: Metadata = {
  title: "Thyrocare - Book Blood Tests Online",
  description: "Book blood tests online with home collection. Get accurate results from India's leading diagnostic lab.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}