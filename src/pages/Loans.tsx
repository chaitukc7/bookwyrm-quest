import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { storage } from "@/lib/storage";
import { Book, Loan, Member, computeLoanStatus } from "@/lib/types";
import { Handshake, Plus, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function Loans() {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setBooks(storage.getAll("books"));
    setMembers(storage.getAll("members"));
    setLoans(storage.getAll("loans"));
  }, []);

  const sortedLoans = useMemo(() => {
    return [...loans].sort((a, b) => new Date(b.loanedAt).getTime() - new Date(a.loanedAt).getTime());
  }, [loans]);

  function createLoan() {
    if (!selectedBook || !selectedMember || !dueDate) return;
    const book = books.find(b => b.id === selectedBook);
    if (!book || book.copiesAvailable <= 0) return;

    // Update book availability
    const updatedBook: Book = { ...book, copiesAvailable: book.copiesAvailable - 1, updatedAt: new Date().toISOString() };
    storage.upsert("books", updatedBook);
    setBooks(storage.getAll("books"));

    const loan: Loan = {
      id: `loan_${Math.random().toString(36).slice(2)}`,
      bookId: selectedBook,
      memberId: selectedMember,
      loanedAt: new Date().toISOString(),
      dueAt: dueDate.toISOString(),
    };
    storage.upsert("loans", loan);
    setLoans(storage.getAll("loans"));
    setSelectedBook("");
    setSelectedMember("");
    setDueDate(undefined);
  }

  function returnLoan(loan: Loan) {
    if (loan.returnedAt) return;
    loan.returnedAt = new Date().toISOString();
    storage.upsert("loans", loan);

    const book = books.find(b => b.id === loan.bookId);
    if (book) {
      storage.upsert("books", { ...book, copiesAvailable: book.copiesAvailable + 1, updatedAt: new Date().toISOString() });
      setBooks(storage.getAll("books"));
    }
    setLoans(storage.getAll("loans"));
  }

  return (
    <AppLayout>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loans</h1>
          <p className="text-muted-foreground">Track borrowing and returns</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="h-4 w-4" /> New Loan</Button>
          </DialogTrigger>
          <LoanForm books={books} members={members} selectedBook={selectedBook} setSelectedBook={setSelectedBook} selectedMember={selectedMember} setSelectedMember={setSelectedMember} dueDate={dueDate} setDueDate={setDueDate} onCreate={createLoan} />
        </Dialog>
      </header>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle>All Loans ({sortedLoans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Loaned</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLoans.map((l) => {
                  const book = books.find(b => b.id === l.bookId);
                  const member = members.find(m => m.id === l.memberId);
                  const status = computeLoanStatus(l);
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{book?.title || "Unknown"}</TableCell>
                      <TableCell>{member?.name || "Unknown"}</TableCell>
                      <TableCell>{new Date(l.loanedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(l.dueAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs ${status === 'overdue' ? 'bg-destructive/15 text-destructive' : status === 'returned' ? 'bg-secondary text-foreground/70' : 'bg-primary/10 text-primary'}`}>{status}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {!l.returnedAt && (
                          <Button variant="secondary" size="sm" onClick={() => returnLoan(l)}>
                            <RotateCcw className="h-4 w-4" /> Return
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function LoanForm({ books, members, selectedBook, setSelectedBook, selectedMember, setSelectedMember, dueDate, setDueDate, onCreate }: {
  books: Book[];
  members: Member[];
  selectedBook: string; setSelectedBook: (v: string) => void;
  selectedMember: string; setSelectedMember: (v: string) => void;
  dueDate?: Date; setDueDate: (d: Date | undefined) => void;
  onCreate: () => void;
}) {
  const availableBooks = books.filter(b => b.copiesAvailable > 0);
  return (
    <DialogContent className="sm:max-w-[580px]">
      <DialogHeader>
        <DialogTitle>Create New Loan</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div>
          <label className="text-sm mb-2 block">Book</label>
          <select className="w-full h-10 rounded-md border bg-background" value={selectedBook} onChange={e => setSelectedBook(e.target.value)}>
            <option value="">Select a book (available)</option>
            {availableBooks.map(b => (
              <option key={b.id} value={b.id}>{b.title} — {b.copiesAvailable} available</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm mb-2 block">Member</label>
          <select className="w-full h-10 rounded-md border bg-background" value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
            <option value="">Select a member</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm mb-2 block">Due date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" className="w-full justify-start font-normal">
                {dueDate ? dueDate.toLocaleDateString() : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCreate} disabled={!selectedBook || !selectedMember || !dueDate}>
          <Handshake className="h-4 w-4" /> Create Loan
        </Button>
      </div>
    </DialogContent>
  );
}
