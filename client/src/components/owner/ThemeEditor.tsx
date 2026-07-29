import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { api, Theme } from "@/lib/api";
import { toast } from "sonner";

export function ThemeEditor({
  restaurantId,
  initialTheme,
  onSaved,
}: {
  restaurantId: string;
  initialTheme?: Theme;
  onSaved?: () => void;
}) {
  const [theme, setTheme] = useState<Theme>({
    primaryColor: "#3a497e",
    backgroundColor: "#f6f6fc",
    cardColor: "#ffffffc2",
    textColor: "#1b1f2b",
    accentColor: "#e8ecfd",
    foreground: "#22283a",
    border: "#d9dae4",
  });
  const [saving, setSaving] = useState(false);

useEffect(() => {
  if (initialTheme) {
    setTheme(prev => ({ ...prev, ...initialTheme }));
  }
}, [initialTheme]);

  const handleChange = (key: keyof Theme, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateRestaurant(restaurantId, { theme });
      toast.success("Theme saved! Refresh your public page to see changes.");
      onSaved?.();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass p-6 rounded-3xl space-y-6 max-w-2xl">
      <h2 className="font-display text-2xl font-semibold">
        Customize Menu Theme
      </h2>
      <p className="text-sm text-muted-foreground">
        These colors will be applied to your public menu page.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {(
          [
            { label: "Primary Color", key: "primaryColor" },
            { label: "Background Color", key: "backgroundColor" },
            { label: "Card Color", key: "cardColor" },
            { label: "Text Color", key: "textColor" },
            { label: "Accent Color", key: "accentColor" },
            { label: "Foreground", key: "foreground" },
            { label: "Border", key: "border" }
          ] as const
        ).map(({ label, key }) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme[key]}
                onChange={e => handleChange(key, e.target.value)}
                className="h-10 w-16 rounded-lg border cursor-pointer"
              />
              <input
                type="text"
                value={theme[key]}
                onChange={e => handleChange(key, e.target.value)}
                className="h-10 flex-1 rounded-lg border px-3 text-sm font-mono"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Live preview */}
      <div
        className="mt-6 p-4 rounded-2xl"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: theme.cardColor, color: theme.textColor }}
        >
          <h3
            style={{ color: theme.textColor }}
            className="font-semibold text-lg"
          >
            Sample Item
          </h3>
          <p style={{ color: theme.foreground  }} className="text-sm">
            Delicious food description
          </p>
          <span
            className="inline-block mt-2 px-3 py-1 rounded-full text-white text-xs"
            style={{ backgroundColor: theme.accentColor }}
          >
            $12.99
          </span>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "Saving…" : "Save Theme"}
      </Button>
    </div>
  );
}
