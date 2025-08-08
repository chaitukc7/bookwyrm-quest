import { Book, Loan, Member } from "./types";

const KEYS = {
  books: "lms:books",
  members: "lms:members",
  loans: "lms:loans",
} as const;

type CollectionKey = keyof typeof KEYS;

type MapType<K extends CollectionKey> = K extends "books"
  ? Book
  : K extends "members"
  ? Member
  : Loan;

function readCollection<K extends CollectionKey>(key: K): MapType<K>[] {
  const raw = localStorage.getItem(KEYS[key]);
  if (!raw) return [] as MapType<K>[];
  try {
    return JSON.parse(raw) as MapType<K>[];
  } catch {
    return [] as MapType<K>[];
  }
}

function writeCollection<K extends CollectionKey>(key: K, value: MapType<K>[]) {
  localStorage.setItem(KEYS[key], JSON.stringify(value));
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

export const storage = {
  getAll: readCollection,
  setAll: writeCollection,
  upsert<K extends CollectionKey>(key: K, item: MapType<K>) {
    const list = readCollection(key);
    const index = list.findIndex((i: any) => i.id === (item as any).id);
    if (index >= 0) list[index] = item;
    else list.unshift(item);
    writeCollection(key, list);
    return item;
  },
  remove<K extends CollectionKey>(key: K, id: string) {
    const list = readCollection(key).filter((i: any) => i.id !== id);
    writeCollection(key, list);
  },
  seedIfEmpty() {
    const hasBooks = readCollection("books").length > 0;
    const hasMembers = readCollection("members").length > 0;
    if (!hasBooks) {
      const now = new Date().toISOString();
      writeCollection("books", [
        {
          id: uid("book"),
          title: "The Pragmatic Programmer",
          author: "Andrew Hunt, David Thomas",
          isbn: "978-0201616224",
          category: "Software",
          publishedYear: 1999,
          copiesTotal: 5,
          copiesAvailable: 5,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uid("book"),
          title: "Clean Code",
          author: "Robert C. Martin",
          isbn: "978-0132350884",
          category: "Software",
          publishedYear: 2008,
          copiesTotal: 4,
          copiesAvailable: 3,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: uid("book"),
          title: "Atomic Habits",
          author: "James Clear",
          isbn: "978-0735211292",
          category: "Self-help",
          publishedYear: 2018,
          copiesTotal: 6,
          copiesAvailable: 6,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }
    if (!hasMembers) {
      const now = new Date().toISOString();
      writeCollection("members", [
        { id: uid("mem"), name: "Alex Johnson", email: "alex@example.com", phone: "+1 555-0142", joinedAt: now, active: true },
        { id: uid("mem"), name: "Priya Sharma", email: "priya@example.com", phone: "+1 555-0199", joinedAt: now, active: true },
        { id: uid("mem"), name: "Chen Li", email: "chen@example.com", phone: "+1 555-0123", joinedAt: now, active: true },
      ]);
    }
    if (!localStorage.getItem(KEYS.loans)) {
      writeCollection("loans", []);
    }
  },
};
