import { Context, Next } from "hono";
import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";
import z from "zod";

// Translation messages indexed by language code
const messages: Record<string, Record<string, string>> = {};

// Load all JSON locale files from the given directory (relative to project root)
async function loadLocales(dir: string) {
  try {
    const files = await readdir(dir);
    for (const file of files) {
      if (extname(file) !== ".json") continue;
      const lang = file.replace(".json", "");
      const content = await readFile(join(dir, file), "utf-8");
      const data = JSON.parse(content);
      // Flatten nested objects into dot-notation keys
      messages[lang] = flattenObject(data);
      console.log(
        `✅ Loaded locale: ${lang} (${Object.keys(messages[lang]).length} keys)`,
      );
    }
  } catch (err) {
    console.error("❌ Failed to load locales:", err);
  }
}

// Flatten nested JSON object to dot-notation keys (e.g., "error.validation")
function flattenObject(obj: any, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else if (typeof value === "string") {
      result[newKey] = value;
    }
  }
  return result;
}

// Initialize locales on startup (the path is relative to the project root)
// In a Bun/Hono app, the current working directory is usually the project root.
const localesDir = join(process.cwd(), "src", "locales");
loadLocales(localesDir);

// Extend Hono's Context to include a t() function
declare module "hono" {
  interface Context {
    t: (key: string, params?: Record<string, string | number>) => string;
  }
}

export const languageMiddleware = async (c: Context, next: Next) => {
  const langHeader = c.req.header("Accept-Language") || "en";
  const lang = langHeader.startsWith("fa") ? "fa" : "en";
  z.config(z.locales[lang]());

  c.t = (key: string, params?: Record<string, string | number>) => {
    let text = messages[lang]?.[key] || messages["en"]?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{{${param}}}`, String(value));
      });
    }
    return text;
  };

  await next();
};
