import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/utils/AuthContext"; // Assuming AuthContext is in @/utils
import LogoutButton from "@/components/LogoutButton"; // Assuming LogoutButton is in @/components
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Financial Dashboard",
  description: "Manage your finances with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {/* This is a simplified header. You might want a more complex component. */}
          <header className="bg-gray-800 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold">
                Financial Dashboard
              </Link>
              {/* In a real app, you'd use useAuth() here, but RootLayout is a Server Component.
                  We'll handle conditional rendering of LogoutButton/user info in a Client Component
                  or pass auth state down. For now, this illustrates the structure.
                  A common pattern is to have a Client Component specifically for the header's dynamic parts.
              */}
              <div>
                {/* Placeholder for user info and logout button.
                    Actual conditional rendering based on auth state will be handled
                    in a client component or by passing auth state.
                    For now, we can assume this part will be dynamic.
                */}
                 {/* <LogoutButton /> We will add this later in a client component */}
              </div>
            </nav>
          </header>
          <main className="container mx-auto p-4">
            {children}
          </main>
          <footer className="bg-gray-200 text-center p-4 mt-8">
            <p>&copy; {new Date().getFullYear()} Financial Dashboard</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
