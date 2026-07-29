import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { FormEvent, useState } from "react";

const week = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";
const glass =
  "rounded-[26px] border border-white/70 bg-white/70 shadow-[0_16px_45px_rgba(74,71,113,.10)] backdrop-blur-xl";

export default function CreateRestaurant({
  done,
}: {
  done: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    cuisine: "",
  });
  const [error, setError] = useState("");
  const field =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: event.target.value });
  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await api.createRestaurant({
        ...form,
        website: form.website || undefined,
        cuisine: form.cuisine
          .split(",")
          .map(value => value.trim())
          .filter(Boolean),
        openingHours: week.map(day => ({ day, open: "11:00", close: "22:00" })),
      });
      await done();
    } catch (error) {
      setError(errorMessage(error));
    }
  }
  return (
    <form onSubmit={submit} className={`${glass} mt-7 max-w-3xl p-6 sm:p-8`}>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-500">
        New location
      </p>
      <h2 className="mt-2 font-display text-3xl font-semibold">
        Create your restaurant
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(
          ["name", "email", "phone", "address", "cuisine", "website"] as const
        ).map(key => (
          <Input
            key={key}
            required={key !== "website"}
            type={key === "email" ? "email" : "text"}
            value={form[key]}
            onChange={field(key)}
            placeholder={
              key === "cuisine"
                ? "Cuisines — Italian, Pizza"
                : key[0].toUpperCase() + key.slice(1)
            }
            className="h-11 rounded-xl bg-white/80"
          />
        ))}
        <Textarea
          required
          value={form.description}
          onChange={field("description")}
          placeholder="A short restaurant description"
          className="min-h-28 rounded-xl bg-white/80 sm:col-span-2"
        />
      </div>
      {error && <p className="mt-4 text-sm text-rose-700">{error}</p>}
      <Button className="mt-6 h-11 rounded-xl bg-slate-900 px-6 text-white">
        Create restaurant
      </Button>
    </form>
  );
}
