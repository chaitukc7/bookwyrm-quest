import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { storage, uid } from "@/lib/storage";
import { Book } from "@/lib/types";
import { Trash2, Pencil, Plus, Search } from "lucide-react";

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Book | null>(null);

  useEffect(() => {
    setBooks(storage.getAll("books"));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(b => [b.title, b.author, b.category, b.isbn].some(v => (v || "").toLowerCase().includes(q)));
  }, [books, query]);

  function saveBook(form: Partial<Book>) {
    const now = new Date().toISOString();
    let item: Book;
    if (editing) {
      item = { ...editing, ...form, updatedAt: now } as Book;
    } else {
      const copies = Number(form.copiesTotal || 1);
      item = {
        id: uid("book"),
        title: form.title || "Untitled",
        author: form.author || "Unknown",
        isbn: form.isbn,
        category: form.category,
        publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
        copiesTotal: copies,
        copiesAvailable: copies,
        createdAt: now,
        updatedAt: now,
      };
    }
    storage.upsert("books", item);
    setBooks(storage.getAll("books"));
    setEditing(null);
  }

  function remove(id: string) {
    storage.remove("books", id);
    setBooks(storage.getAll("books"));
  }

  return (
    <AppLayout>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Books</h1>
          <p className="text-muted-foreground">Manage your catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search books..." className="pl-9 w-56" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="hero"><Plus className="h-4 w-4" /> Add Book</Button>
            </DialogTrigger>
            <BookForm onSubmit={saveBook} />
          </Dialog>
        </div>
      </header>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Catalog ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">ISBN</TableHead>
                  <TableHead>Copies</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.title}</TableCell>
                    <TableCell>{b.author}</TableCell>
                    <TableCell className="hidden md:table-cell">{b.category || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">{b.isbn || "—"}</TableCell>
                    <TableCell>{b.copiesAvailable}/{b.copiesTotal}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" onClick={() => setEditing(b)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <BookForm onSubmit={saveBook} book={editing || undefined} />
                      </Dialog>
                      <Button variant="ghost" size="sm" onClick={() => remove(b.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function BookForm({ onSubmit, book }: { onSubmit: (form: Partial<Book>) => void; book?: Book }) {
  const [form, setForm] = useState<Partial<Book>>(book || {});
  useEffect(() => setForm(book || {}), [book]);

  return (
    <DialogContent className="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{book ? "Edit Book" : "Add Book"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Title</Label>
          <Input id="title" className="col-span-3" value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="author" className="text-right">Author</Label>
          <Input id="author" className="col-span-3" value={form.author || ""} onChange={e => setForm({ ...form, author: e.target.value })} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">Category</Label>
          <Input id="category" className="col-span-3" value={form.category || ""} onChange={e => setForm({ ...form, category: e.target.value })} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="isbn" className="text-right">ISBN</Label>
          <Input id="isbn" className="col-span-3" value={form.isbn || ""} onChange={e => setForm({ ...form, isbn: e.target.value })} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="year" className="text-right">Year</Label>
          <Input type="number" id="year" className="col-span-3" value={form.publishedYear || "" as any} onChange={e => setForm({ ...form, publishedYear: Number(e.target.value) })} />
        </div>
        {!book && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="copies" className="text-right">Copies</Label>
            <Input type="number" id="copies" className="col-span-3" value={(form.copiesTotal as any) || 1} min={1} onChange={e => setForm({ ...form, copiesTotal: Number(e.target.value) })} />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => onSubmit(form)}>Save</Button>
      </div>
    </DialogContent>
  );
}
