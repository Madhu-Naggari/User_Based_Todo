import { Toaster } from "sonner";

import "./globals.css";

export const metadata = {
  title: "Role-Based Task API",
  description:
    "Next.js full-stack assignment with JWT auth, role-based access control, REST APIs, Swagger UI docs, and a demo dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "16px",
            },
          }}
        />
      </body>
    </html>
  );
}
