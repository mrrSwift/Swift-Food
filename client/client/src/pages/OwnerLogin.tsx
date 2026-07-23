import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { ArrowLeft, ChefHat, LockKeyhole, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

export default function OwnerLogin() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) setLocation("/owner");
  }, [isAuthenticated, loading, setLocation]);

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#f6f5fb] p-4 sm:p-6 lg:grid-cols-2 lg:p-8">
      <div className="pointer-events-none absolute -left-36 -top-36 size-[35rem] rounded-full bg-[#d9e7ff]/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 right-[-4rem] size-[38rem] rounded-full bg-[#e5d7ff]/75 blur-3xl" />
      <section className="glass-panel relative z-10 hidden min-h-[calc(100vh-4rem)] flex-col justify-between overflow-hidden rounded-[34px] p-10 lg:flex">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"><ArrowLeft className="size-4" /> Back to menu</Link>
          <div className="mt-16 max-w-md">
            <span className="grid size-14 place-items-center rounded-[20px] bg-[linear-gradient(145deg,#b4e3d7,#7a90da)] text-white shadow-[0_12px_25px_rgba(87,108,182,.25)]"><ChefHat className="size-6" /></span>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-[#6674a4]">Restaurant Glass</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[.96] tracking-[-0.06em] text-slate-900">A beautiful menu deserves a calm control room.</h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-slate-500">Create up to two restaurants, keep every plate considered, and publish when the table is ready.</p>
          </div>
        </div>
        <p className="text-sm text-slate-400">Private access for restaurant owners.</p>
      </section>

      <section className="relative z-10 flex min-h-[calc(100vh-2rem)] items-center justify-center lg:min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 lg:hidden"><ArrowLeft className="size-4" /> Back to menu</Link>
          <div className="glass-panel rounded-[30px] p-7 shadow-[0_24px_64px_rgba(71,69,112,.14)] sm:p-9">
            <span className="grid size-12 place-items-center rounded-[18px] bg-white text-[#5969a5] shadow-sm"><LockKeyhole className="size-5" /></span>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-[#6674a4]">Owner space</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-slate-900">Sign in to your restaurants</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Continue securely with your Manus account. No extra password is created or stored here.</p>
            <Button
              disabled={loading}
              onClick={() => startLogin()}
              className="mt-8 h-12 w-full rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,.2)] hover:bg-slate-800"
            >
              <Sparkles className="mr-2 size-4" /> Continue with Manus
            </Button>
            <p className="mt-5 text-center text-xs leading-5 text-slate-400">By continuing, you will access only restaurants owned by your signed-in account.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
