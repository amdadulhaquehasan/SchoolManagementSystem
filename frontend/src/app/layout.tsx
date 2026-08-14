import type { Metadata, Viewport } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ClientChrome from "@/components/ClientChrome";

export const metadata: Metadata = {
  title: "School Management System",
  description: "Admin, Teacher & Student portal for assignments and classes.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClientChrome>{children}</ClientChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
