export type ID = string;

export type Book = {
  id: ID;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  publishedYear?: number;
  copiesTotal: number;
  copiesAvailable: number;
  createdAt: string;
  updatedAt: string;
};

export type Member = {
  id: ID;
  name: string;
  email?: string;
  phone?: string;
  joinedAt: string;
  active: boolean;
};

export type LoanStatus = "active" | "overdue" | "returned";

export type Loan = {
  id: ID;
  bookId: ID;
  memberId: ID;
  loanedAt: string; // ISO
  dueAt: string; // ISO
  returnedAt?: string; // ISO
};

export function computeLoanStatus(loan: Loan, now = new Date()): LoanStatus {
  if (loan.returnedAt) return "returned";
  const due = new Date(loan.dueAt);
  return due.getTime() < now.getTime() ? "overdue" : "active";
}
