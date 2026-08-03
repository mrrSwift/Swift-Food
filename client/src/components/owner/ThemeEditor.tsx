import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { api, Theme } from "@/lib/api";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";

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
  const { t } = useLocale();

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
      toast.success(t("owner.theme.saved"));
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
        {t("owner.theme.title")}
      </h2>
      <p className="text-sm text-muted-foreground">
        {t("owner.theme.subtitle")}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {(
          [
            { label: "primary", key: "primaryColor" },
            { label: "background", key: "backgroundColor" },
            { label: "card", key: "cardColor" },
            { label: "text", key: "textColor" },
            { label: "accent", key: "accentColor" },
            { label: "foreground", key: "foreground" },
            { label: "border", key: "border" }
          ] as const
        ).map(({ label, key }) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium">{t("owner.theme." + label)}</label>
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
        {saving ? "Saving…" : t("owner.theme.save")}
      </Button>
    </div>
  );
}
