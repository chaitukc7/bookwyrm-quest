import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { storage, uid } from "@/lib/storage";
import { Member } from "@/lib/types";
import { Trash2, Pencil, Plus, Search } from "lucide-react";

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Member | null>(null);

  useEffect(() => {
    setMembers(storage.getAll("members"));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m => [m.name, m.email, m.phone].some(v => (v || "").toLowerCase().includes(q)));
  }, [members, query]);

  function saveMember(form: Partial<Member>) {
    const now = new Date().toISOString();
    let item: Member;
    if (editing) {
      item = { ...editing, ...form } as Member;
    } else {
      item = {
        id: uid("mem"),
        name: form.name || "Unnamed",
        email: form.email,
        phone: form.phone,
        joinedAt: now,
        active: true,
      };
    }
    storage.upsert("members", item);
    setMembers(storage.getAll("members"));
    setEditing(null);
  }

  function remove(id: string) {
    storage.remove("members", id);
    setMembers(storage.getAll("members"));
  }

  return (
    <AppLayout>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">Manage registered members</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search members..." className="pl-9 w-56" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="hero"><Plus className="h-4 w-4" /> Add Member</Button>
            </DialogTrigger>
            <MemberForm onSubmit={saveMember} />
          </Dialog>
        </div>
      </header>

      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Directory ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.email || "—"}</TableCell>
                    <TableCell>{m.phone || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" onClick={() => setEditing(m)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <MemberForm onSubmit={saveMember} member={editing || undefined} />
                      </Dialog>
                      <Button variant="ghost" size="sm" onClick={() => remove(m.id)}>
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

function MemberForm({ onSubmit, member }: { onSubmit: (form: Partial<Member>) => void; member?: Member }) {
  const [form, setForm] = useState<Partial<Member>>(member || {});
  useEffect(() => setForm(member || {}), [member]);

  return (
    <DialogContent className="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{member ? "Edit Member" : "Add Member"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input id="name" className="col-span-3" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Email</Label>
          <Input id="email" type="email" className="col-span-3" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">Phone</Label>
          <Input id="phone" className="col-span-3" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => onSubmit(form)}>Save</Button>
      </div>
    </DialogContent>
  );
}
