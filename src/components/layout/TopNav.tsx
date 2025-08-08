import { NavLink } from "react-router-dom";
import { BookOpen, Users, LibraryBig, Handshake, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
    isActive ? "bg-secondary text-foreground" : "text-foreground/80 hover:bg-secondary/70"
  }`;

export const TopNav = () => {
  return (
    <header className="sticky top-0 z-40 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary animate-float" aria-hidden />
          <a href="/" className="font-semibold tracking-tight">
            <span className="text-gradient-primary">Aurora Library</span>
          </a>
        </div>
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-1">
          <NavLink to="/dashboard" className={navItemClass} end>
            {({ isActive }) => (
              <span className="inline-flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Dashboard</span>
            )}
          </NavLink>
          <NavLink to="/books" className={navItemClass}>
            <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4" /> Books</span>
          </NavLink>
          <NavLink to="/members" className={navItemClass}>
            <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> Members</span>
          </NavLink>
          <NavLink to="/loans" className={navItemClass}>
            <span className="inline-flex items-center gap-2"><Handshake className="h-4 w-4" /> Loans</span>
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="soft" size="sm" asChild>
            <a href="/books">Add Book</a>
          </Button>
          <div className="hidden md:flex items-center gap-2 text-muted-foreground">
            <LibraryBig className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
