import { ReactNode } from "react";
import TopNav from "@/components/layout/TopNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1">
        <div className="container py-8">
          {children}
        </div>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Built with love • Aurora Library Manager
      </footer>
    </div>
  );
}
