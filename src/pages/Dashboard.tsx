import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Handshake, Timer } from "lucide-react";
import { storage } from "@/lib/storage";
import { Book, Loan, Member, computeLoanStatus } from "@/lib/types";

export default function Dashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    setBooks(storage.getAll("books"));
    setMembers(storage.getAll("members"));
    setLoans(storage.getAll("loans"));
  }, []);

  const stats = useMemo(() => {
    const activeLoans = loans.filter(l => computeLoanStatus(l) === "active").length;
    const overdue = loans.filter(l => computeLoanStatus(l) === "overdue").length;
    const availableCopies = books.reduce((sum, b) => sum + b.copiesAvailable, 0);
    return {
      books: books.length,
      members: members.length,
      activeLoans,
      overdue,
      availableCopies,
    };
  }, [books, members, loans]);

  return (
    <AppLayout>
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Welcome to <span className="text-gradient-primary">Aurora Library</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl">Manage books, members, and loans with a modern, fast, and delightful interface.</p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Books" value={stats.books} icon={<BookOpen className="h-5 w-5" />} />
        <StatCard title="Members" value={stats.members} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Active Loans" value={stats.activeLoans} icon={<Handshake className="h-5 w-5" />} />
        <StatCard title="Overdue" value={stats.overdue} icon={<Timer className="h-5 w-5" />} highlight />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-gradient-primary animate-shine bg-[length:200%_100%]"
                style={{ width: `${Math.min(100, Math.round((stats.availableCopies / Math.max(1, books.reduce((s,b)=>s+b.copiesTotal,0))) * 100))}%` }}
                aria-label="Availability bar"
              />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {stats.availableCopies} copies currently available across all titles.
            </p>
          </CardContent>
        </Card>
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Activity Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm space-y-2 text-muted-foreground">
              <li>Add new books and import your catalog from the Books page.</li>
              <li>Register members to enable borrowing and returns.</li>
              <li>Create loans and track overdue items with due dates.</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
}

function StatCard({ title, value, icon, highlight }: { title: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <Card className={`card-glass ${highlight ? "ring-1 ring-destructive/30" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${highlight ? "text-destructive" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
