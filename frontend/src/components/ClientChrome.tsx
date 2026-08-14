"use client";

import { ToastContainer } from "react-toastify";
import AppNavbar from "./AppNavbar";

export default function ClientChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNavbar />
      <main className="page-container">{children}</main>
      <ToastContainer position="top-right" autoClose={4000} newestOnTop />
    </>
  );
}
