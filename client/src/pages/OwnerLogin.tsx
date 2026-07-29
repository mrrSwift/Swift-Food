import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ChefHat, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { navigate } from "wouter/use-browser-location";

export default function OwnerLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const session = await api.login(email, password);

      if (session.user.role === "admin") {
        localStorage.setItem("restaurant-token", session.token);
        localStorage.setItem("restaurant-user", JSON.stringify(session.user));
        navigate("/admin");
      } else if (session.user.role === "r_owner") {
        localStorage.setItem("restaurant-token", session.token);
        localStorage.setItem("restaurant-user", JSON.stringify(session.user));
        navigate("/owner"); // or your owner dashboard path
      } else {
        throw new Error("This account is not a restaurant owner.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f5fb] p-5">
      <section className="w-full max-w-md rounded-[30px] bg-white p-8 shadow-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" /> Back to restaurants
        </Link>
        <span className="mt-8 grid size-12 place-items-center rounded-2xl bg-slate-900 text-white">
          <ChefHat />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Owner space
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Use your restaurant owner account.
        </p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="mt-2 h-11"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="mt-2 h-11"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </p>
          )}
          <Button
            disabled={submitting}
            className="h-12 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          >
            <LockKeyhole className="mr-2 size-4" />{" "}
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </section>
    </main>
  );
}
