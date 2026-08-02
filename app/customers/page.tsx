"use client";

import { useState, useEffect } from "react";
import { PosShell } from "@/components/layout/pos-shell";
import { Search, UserPlus, Phone, Mail, Award, Loader2, X } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data);
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email }),
      });
      const json = await res.json();
      if (json.success) {
        setName("");
        setPhone("");
        setEmail("");
        setIsModalOpen(false);
        fetchCustomers();
      }
    } catch (error) {
      console.error("Failed to create customer", error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <PosShell>
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Customer Management</h1>
            <p className="text-sm text-muted-foreground">Manage membership profiles, contact details, and purchase history</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <UserPlus size={16} />
            Add Customer
          </button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-muted-foreground" size={28} />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-card text-muted-foreground text-sm">
            No customer records found in the database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-base">{customer.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Phone size={13} /> {customer.phone}
                    </p>
                    {customer.email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Mail size={13} /> {customer.email}
                      </p>
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border">
                    Member
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t text-center">
                  <div className="bg-muted/30 p-2.5 rounded-xl">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Orders</p>
                    <p className="text-sm font-semibold mt-0.5">{customer.orders?.length || 0}</p>
                  </div>
                  <div className="bg-muted/30 p-2.5 rounded-xl">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Total Spent</p>
                    <p className="text-sm font-semibold mt-0.5">
                      ฿{customer.orders?.reduce((acc: number, o: any) => acc + (o.total || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Create Customer */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-lg font-semibold">New Customer Registration</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full rounded-xl border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812345678"
                    className="w-full rounded-xl border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">Email (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full rounded-xl border bg-background px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Customer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PosShell>
  );
}