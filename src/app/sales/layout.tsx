import { AuthProvider } from "@/lib/auth-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
