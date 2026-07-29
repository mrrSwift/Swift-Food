import {
  api,
  type Restaurant,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";

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


  export default function SettingsForm({
    restaurant,
    done,
  }: {
    restaurant: Restaurant;
    done: () => Promise<void>;
  }) {
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
  
    // Opening hours state
    const [openingHours, setOpeningHours] = useState<
      { day: string; open: string; close: string }[]
    >(() => {
      if (restaurant.openingHours && restaurant.openingHours.length > 0) {
        return restaurant.openingHours.map(h => ({ ...h }));
      }
      return week.map(day => ({ day, open: "", close: "" }));
    });
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, WebP, GIF)");
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setImageFile(file);
    };
  
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, WebP, GIF)");
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setLogoFile(file);
    };
  
    const updateDayTime = (
      day: string,
      field: "open" | "close",
      value: string
    ) => {
      setOpeningHours(prev =>
        prev.map(h => (h.day === day ? { ...h, [field]: value } : h))
      );
    };
  
    async function submit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      const formData = new FormData();
  
      try {
        let coverImageUrl = restaurant.coverImage;
        let logoUrl = restaurant.logo;
  
        if (imageFile) {
          formData.append("image", imageFile);
          formData.append("kind", "restaurant");
          const coverRes = await api.uploadImage(formData);
          coverImageUrl = coverRes.url;
        }
        if (logoFile) {
          const logoForm = new FormData();
          logoForm.append("image", logoFile);
          logoForm.append("kind", "restaurant");
          const logoRes = await api.uploadImage(logoForm);
          logoUrl = logoRes.url;
        }
  
        await api.updateRestaurant(restaurant._id, {
          name: String(values.get("name") || restaurant.name),
          email: String(values.get("email") || restaurant.email),
          phone: String(values.get("phone") || restaurant.phone),
          address: String(values.get("address") || restaurant.address),
          coverImage: coverImageUrl,
          logo: logoUrl,
          website: String(values.get("website") || "") || undefined,
          description: String(
            values.get("description") || restaurant.description
          ),
          cuisine: String(values.get("cuisine") || restaurant.cuisine.join(", "))
            .split(",")
            .map(v => v.trim())
            .filter(Boolean),
          openingHours: openingHours.filter(h => h.open && h.close), // only send non-empty times
        });
        toast.success("Settings saved!");
        await done();
      } catch (error) {
        setError(errorMessage(error));
      }
    }
  
    return (
      <form onSubmit={submit} className={`${glass} mt-auto max-w-7xl p-6`}>
        <h2 className="font-display text-2xl font-semibold">
          Restaurant settings
        </h2>
  
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Input name="name" placeholder="Name" defaultValue={restaurant.name} />
          <Input
            name="email"
            placeholder="Email"
            defaultValue={restaurant.email}
          />
          <Input
            name="phone"
            placeholder="Phone"
            defaultValue={restaurant.phone}
          />
          <Input
            name="address"
            placeholder="Address"
            defaultValue={restaurant.address}
          />
          <Input
            name="cuisine"
            placeholder="Cuisine"
            defaultValue={restaurant.cuisine.join(", ")}
          />
          <Input
            name="website"
            defaultValue={restaurant.website}
            placeholder="Website"
          />
          <div>
            <label className="mb-2">Cover Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="rounded-md border p-3 w-full"
            />
          </div>
          <div>
            <label className="mb-2">Logo</label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="rounded-md border p-3 w-full"
            />
          </div>
          <Textarea
            name="description"
            defaultValue={restaurant.description}
            className="min-h-28 sm:col-span-2"
            placeholder="Description"
          />
        </div>
  
        {/* Opening Hours Section */}
        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-3">Opening Hours</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {openingHours.map(hour => (
              <div
                key={hour.day}
                className="flex items-center gap-3 bg-white/50 rounded-xl p-3"
              >
                <span className="capitalize w-24 text-sm font-medium">
                  {hour.day}
                </span>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={hour.open}
                    onChange={e =>
                      updateDayTime(hour.day, "open", e.target.value)
                    }
                    className="h-9 rounded-lg border px-2 text-sm w-full"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="time"
                    value={hour.close}
                    onChange={e =>
                      updateDayTime(hour.day, "close", e.target.value)
                    }
                    className="h-9 rounded-lg border px-2 text-sm w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
        <Button className="mt-5 rounded-xl bg-slate-900 text-white">
          Save changes
        </Button>
      </form>
    );
  }