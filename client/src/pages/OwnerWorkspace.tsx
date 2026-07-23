import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout, { type DashboardNavigationItem } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Clock3,
  Eye,
  GripVertical,
  ImagePlus,
  LayoutDashboard,
  MapPin,
  MenuSquare,
  MoreHorizontal,
  NotebookPen,
  PackageOpen,
  Pencil,
  Phone,
  Plus,
  Settings2,
  Sparkles,
  Store,
  Tags,
  Trash2,
  UploadCloud,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useRoute } from "wouter";

const imageContentTypes = ["image/jpeg", "image/png", "image/webp"] as const;
type ImageContentType = (typeof imageContentTypes)[number];

type RestaurantFormState = {
  name: string;
  description: string;
  bannerImageKey: string | null;
  bannerImageUrl: string | null;
  address: string;
  phone: string;
  hours: string;
  instagram: string;
  facebook: string;
  website: string;
  isPublished: boolean;
};

type MenuItemFormState = {
  categoryId: string;
  title: string;
  description: string;
  ingredients: string;
  price: string;
  rating: string;
  imageKey: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
};

type OwnedRestaurant = {
  id: string;
  slug: string;
  name: string;
  description: string;
  bannerImageKey: string | null;
  bannerImageUrl: string | null;
  address: string;
  phone: string;
  hours: string;
  socialLinks: string;
  isPublished: boolean;
};

function parseLinks(value: string) {
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return {
      instagram: typeof parsed.instagram === "string" ? parsed.instagram : "",
      facebook: typeof parsed.facebook === "string" ? parsed.facebook : "",
      website: typeof parsed.website === "string" ? parsed.website : "",
    };
  } catch {
    return { instagram: "", facebook: "", website: "" };
  }
}

function restaurantFormFrom(record: {
  name: string;
  description: string;
  bannerImageKey: string | null;
  bannerImageUrl: string | null;
  address: string;
  phone: string;
  hours: string;
  socialLinks: string;
  isPublished: boolean;
}): RestaurantFormState {
  return { ...record, ...parseLinks(record.socialLinks) };
}

function emptyMenuItemForm(): MenuItemFormState {
  return {
    categoryId: "",
    title: "",
    description: "",
    ingredients: "",
    price: "",
    rating: "",
    imageKey: null,
    imageUrl: null,
    isAvailable: true,
  };
}

function menuItemFormFrom(record: {
  categoryId: string | null;
  title: string;
  description: string;
  ingredients: string;
  price: string | number;
  rating: string | number | null;
  imageKey: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
}): MenuItemFormState {
  return {
    categoryId: record.categoryId ?? "",
    title: record.title,
    description: record.description,
    ingredients: record.ingredients,
    price: String(record.price),
    rating: record.rating === null ? "" : String(record.rating),
    imageKey: record.imageKey,
    imageUrl: record.imageUrl,
    isAvailable: record.isAvailable,
  };
}

function money(value: string | number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value) || 0);
}

function readImageDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("The image could not be read."));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
}

function useOwnerImageUpload(restaurantId: string) {
  const mutation = trpc.restaurant.owner.assets.uploadImage.useMutation();
  const upload = async (file: File) => {
    const type = file.type as ImageContentType;
    if (!imageContentTypes.includes(type)) {
      throw new Error("Choose a JPG, PNG, or WebP image.");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Images must be 5 MB or smaller.");
    }
    return mutation.mutateAsync({
      restaurantId,
      fileName: file.name,
      contentType: type,
      dataUrl: await readImageDataUrl(file),
    });
  };
  return { upload, isUploading: mutation.isPending };
}

function OwnerLoading() {
  return (
    <div className="min-h-screen bg-[#f6f5fb] p-6">
      <div className="mx-auto max-w-6xl space-y-5"><Skeleton className="h-16 rounded-[20px]" /><Skeleton className="h-44 rounded-[28px]" /><Skeleton className="h-80 rounded-[28px]" /></div>
    </div>
  );
}

export default function OwnerWorkspace() {
  const { loading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) setLocation("/owner/login");
  }, [loading, setLocation, user]);

  if (loading) return <OwnerLoading />;
  if (!user) return null;
  return <OwnerWorkspaceContent />;
}

function OwnerWorkspaceContent() {
  const [location, setLocation] = useLocation();
  const [, overviewMatch] = useRoute("/owner/restaurants/:restaurantId/overview");
  const [, settingsMatch] = useRoute("/owner/restaurants/:restaurantId/settings");
  const [, categoriesMatch] = useRoute("/owner/restaurants/:restaurantId/categories");
  const [, menuMatch] = useRoute("/owner/restaurants/:restaurantId/menu");
  const restaurantId = overviewMatch?.restaurantId || settingsMatch?.restaurantId || categoriesMatch?.restaurantId || menuMatch?.restaurantId;
  const section = overviewMatch ? "overview" : settingsMatch ? "settings" : categoriesMatch ? "categories" : menuMatch ? "menu" : "home";

  const navigation: DashboardNavigationItem[] = restaurantId
    ? [
        { icon: LayoutDashboard, label: "Overview", path: `/owner/restaurants/${restaurantId}/overview` },
        { icon: Settings2, label: "Restaurant", path: `/owner/restaurants/${restaurantId}/settings` },
        { icon: Tags, label: "Categories", path: `/owner/restaurants/${restaurantId}/categories` },
        { icon: MenuSquare, label: "Menu items", path: `/owner/restaurants/${restaurantId}/menu` },
      ]
    : [{ icon: Building2, label: "My restaurants", path: "/owner" }];

  return (
    <DashboardLayout navigation={navigation} brand="Luma owner">
      {restaurantId ? <RestaurantWorkspace restaurantId={restaurantId} section={section} onBack={() => setLocation("/owner")} /> : <RestaurantHome onSelect={id => setLocation(`/owner/restaurants/${id}/overview`)} />}
    </DashboardLayout>
  );
}

function RestaurantHome({ onSelect }: { onSelect: (id: string) => void }) {
  const restaurants = trpc.restaurant.owner.restaurants.list.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (restaurants.isLoading) return <WorkspaceSkeleton />;
  const records = restaurants.data ?? [];
  const atLimit = records.length >= 2;

  return (
    <div className="mx-auto max-w-6xl pb-8">
      <PageHeader eyebrow="Owner workspace" title="Your restaurants" description="Select a restaurant to shape its public menu, or begin a second concept when you are ready." />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {records.map(record => (
          <button key={record.id} onClick={() => onSelect(record.id)} className="glass-panel group relative overflow-hidden rounded-[28px] p-6 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(70,69,111,.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7182c4]">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_75%_35%,rgba(193,220,255,.72),transparent_63%)]" />
            <div className="relative flex min-h-44 flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-12 place-items-center rounded-[17px] bg-white/80 text-[#5969a5] shadow-sm"><Store className="size-5" /></span>
                <Badge className={cn("rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]", record.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{record.isPublished ? "Published" : "Draft"}</Badge>
              </div>
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] text-slate-900">{record.name}</h2>
                <p className="mt-2 line-clamp-2 max-w-md text-sm leading-6 text-slate-500">{record.description || "A restaurant ready for its first details."}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#53639e]">Open workspace <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
            </div>
          </button>
        ))}

        {!atLimit && (
          <button onClick={() => setDialogOpen(true)} className="group relative min-h-64 overflow-hidden rounded-[28px] border border-dashed border-[#b9c2e5] bg-white/36 p-6 text-left transition-colors hover:bg-white/56 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7182c4]">
            <span className="grid size-12 place-items-center rounded-[17px] bg-[#eef1ff] text-[#5c6ba3]"><Plus className="size-5" /></span>
            <h2 className="mt-10 font-display text-2xl font-semibold tracking-[-0.04em] text-slate-900">Add a restaurant</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">You can manage up to two restaurants with this owner account.</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#53639e]">Create restaurant <Plus className="size-4" /></span>
          </button>
        )}
      </div>

      {atLimit && <p className="mt-5 text-sm text-slate-500">This account is currently using its two-restaurant limit.</p>}
      {!records.length && <div className="mt-7 rounded-[24px] border border-[#d8dcf2] bg-[#edf0ff]/60 px-5 py-4 text-sm leading-6 text-[#586693]"><Sparkles className="mr-2 inline size-4" /> Start with the restaurant name and refine its banner, contact details, categories, and menu after creation.</div>}
      <NewRestaurantDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={record => onSelect(record.id)} />
    </div>
  );
}

function NewRestaurantDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: (record: { id: string }) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const utils = trpc.useUtils();
  const create = trpc.restaurant.owner.restaurants.create.useMutation({
    onSuccess: async record => {
      await utils.restaurant.owner.restaurants.list.invalidate();
      if (record) onCreated(record);
      setName("");
      setDescription("");
      onOpenChange(false);
      toast.success("Restaurant created. You can now make it your own.");
    },
    onError: error => toast.error(error.message),
  });

  const submit = () => {
    if (name.trim().length < 2) {
      toast.error("Enter a restaurant name with at least two characters.");
      return;
    }
    create.mutate({ name: name.trim(), description: description.trim(), isPublished: false });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/70 bg-[#f9f9fd]/95 sm:max-w-md sm:rounded-[28px]">
        <DialogHeader><DialogTitle className="font-display text-2xl tracking-[-0.045em]">Create your restaurant</DialogTitle><DialogDescription>It starts as a draft and will not appear publicly until you publish it.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-2"><Label htmlFor="new-restaurant-name">Restaurant name</Label><Input id="new-restaurant-name" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Luma Table" className="h-11 rounded-xl bg-white/80" /></div>
          <div className="space-y-2"><Label htmlFor="new-restaurant-description">A short introduction</Label><Textarea id="new-restaurant-description" value={description} onChange={event => setDescription(event.target.value)} placeholder="Tell guests what makes this table special." className="min-h-28 rounded-xl bg-white/80" /></div>
        </div>
        <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button><Button disabled={create.isPending} onClick={submit} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">{create.isPending ? "Creating…" : "Create restaurant"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RestaurantWorkspace({ restaurantId, section, onBack }: { restaurantId: string; section: string; onBack: () => void }) {
  const restaurant = trpc.restaurant.owner.restaurants.get.useQuery({ restaurantId });
  const [, setLocation] = useLocation();

  if (restaurant.isLoading) return <WorkspaceSkeleton />;
  if (!restaurant.data) return <MissingRestaurant onBack={onBack} />;

  const record = restaurant.data;
  const heading = section === "overview" ? "Overview" : section === "settings" ? "Restaurant settings" : section === "categories" ? "Categories" : "Menu items";
  const descriptions: Record<string, string> = {
    overview: "A calm snapshot of what is ready for guests.",
    settings: "Shape the identity, details, and public visibility of this restaurant.",
    categories: "Organize how guests move through the menu.",
    menu: "Create and maintain every plate on the public menu.",
  };

  return (
    <div className="mx-auto max-w-6xl pb-8">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"><ArrowLeft className="size-4" /> All restaurants</button>
        <a href={`/r/${record.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-white"><Eye className="size-4" /> View public menu <ArrowUpRight className="size-3.5" /></a>
      </div>
      <PageHeader eyebrow={record.name} title={heading} description={descriptions[section] || "Manage your restaurant."} badge={record.isPublished ? "Published" : "Draft"} />
      <div className="mt-8">
        {section === "overview" && <OverviewPanel restaurantId={restaurantId} />}
        {section === "settings" && <SettingsPanel restaurant={record} />}
        {section === "categories" && <CategoriesPanel restaurantId={restaurantId} />}
        {section === "menu" && <MenuItemsPanel restaurantId={restaurantId} />}
      </div>
      <div className="mt-8 flex gap-2 lg:hidden">
        <Button variant="outline" onClick={() => setLocation(`/owner/restaurants/${restaurantId}/overview`)} className="rounded-xl">Overview</Button>
        <Button variant="outline" onClick={() => setLocation(`/owner/restaurants/${restaurantId}/settings`)} className="rounded-xl">Settings</Button>
      </div>
    </div>
  );
}

function OverviewPanel({ restaurantId }: { restaurantId: string }) {
  const overview = trpc.restaurant.owner.restaurants.overview.useQuery({ restaurantId });
  if (overview.isLoading) return <WorkspaceSkeleton compact />;
  const data = overview.data;
  if (!data) return null;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard icon={<UtensilsCrossed className="size-5" />} label="Menu items" value={data.itemCount} note={`${data.availableItemCount} available now`} tint="blue" />
        <MetricCard icon={<Tags className="size-5" />} label="Categories" value={data.categoryCount} note="Order the menu your way" tint="mint" />
        <MetricCard icon={<NotebookPen className="size-5" />} label="Orders" value="—" note="Placeholder for a future release" tint="lilac" />
      </div>
      <section className="glass-panel overflow-hidden rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6674a4]">Next step</p><h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.045em] text-slate-900">Make the menu unmistakably yours.</h3><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Set restaurant details, shape categories, then add the plates guests will see. Publishing remains in your control.</p></div>
          <Badge className="w-fit rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600">{data.restaurant?.isPublished ? "Visible to guests" : "Not public yet"}</Badge>
        </div>
        <Separator className="my-7 bg-slate-200/70" />
        <div className="flex items-start gap-3 rounded-2xl bg-[#f1f2fc]/75 p-4"><CircleDashed className="mt-0.5 size-5 shrink-0 text-[#6775ab]" /><div><p className="text-sm font-semibold text-slate-800">{data.ordersPlaceholder.label}</p><p className="mt-1 text-sm leading-6 text-slate-500">{data.ordersPlaceholder.detail}</p></div></div>
      </section>
    </div>
  );
}

function SettingsPanel({ restaurant }: { restaurant: OwnedRestaurant }) {
  const [form, setForm] = useState<RestaurantFormState>(() => restaurantFormFrom(restaurant));
  const utils = trpc.useUtils();
  const image = useOwnerImageUpload(restaurant.id);
  const update = trpc.restaurant.owner.restaurants.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.restaurant.owner.restaurants.get.invalidate({ restaurantId: restaurant.id }),
        utils.restaurant.owner.restaurants.list.invalidate(),
        utils.restaurant.public.getBySlug.invalidate({ slug: restaurant.slug }),
      ]);
      toast.success("Restaurant settings saved.");
    },
    onError: error => toast.error(error.message),
  });

  useEffect(() => setForm(restaurantFormFrom(restaurant)), [restaurant]);

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await image.upload(file);
      setForm(current => ({ ...current, bannerImageKey: result.key, bannerImageUrl: result.url }));
      toast.success("Banner image ready. Save settings to keep it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The banner could not be uploaded.");
    } finally {
      event.target.value = "";
    }
  };

  const save = () => {
    if (form.name.trim().length < 2) return toast.error("Enter a restaurant name with at least two characters.");
    update.mutate({
      restaurantId: restaurant.id,
      data: {
        name: form.name.trim(), description: form.description.trim(), bannerImageKey: form.bannerImageKey, bannerImageUrl: form.bannerImageUrl,
        address: form.address.trim(), phone: form.phone.trim(), hours: form.hours.trim(), isPublished: form.isPublished,
        socialLinks: { instagram: form.instagram.trim(), facebook: form.facebook.trim(), website: form.website.trim() },
      },
    });
  };

  return (
    <section className="glass-panel rounded-[28px] p-5 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[.95fr_1.35fr]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6674a4]">Public picture</p>
          <div className="relative mt-4 aspect-[1.25/1] overflow-hidden rounded-[24px] border border-white/75 bg-[#edf0fb]">
            {form.bannerImageUrl ? <img src={form.bannerImageUrl} alt="Restaurant banner preview" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-[17px] bg-white/75 text-[#6877aa]"><ImagePlus className="size-5" /></span><p className="mt-3 text-sm font-medium text-slate-600">Add a banner image</p></div></div>}
            {form.bannerImageUrl && <button onClick={() => setForm(current => ({ ...current, bannerImageKey: null, bannerImageUrl: null }))} className="absolute right-3 top-3 grid size-9 place-items-center rounded-xl bg-slate-950/50 text-white backdrop-blur-md hover:bg-slate-950/70" aria-label="Remove banner image"><X className="size-4" /></button>}
          </div>
          <label className="mt-4 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/75 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-white"><UploadCloud className="size-4" /> {image.isUploading ? "Uploading…" : "Upload banner"}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} disabled={image.isUploading} /></label>
          <p className="mt-3 text-xs leading-5 text-slate-400">JPG, PNG, or WebP, up to 5 MB.</p>
        </div>
        <div className="space-y-5">
          <div className="space-y-2"><Label htmlFor="restaurant-name">Restaurant name</Label><Input id="restaurant-name" value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} className="h-11 rounded-xl bg-white/75" /></div>
          <div className="space-y-2"><Label htmlFor="restaurant-description">Description</Label><Textarea id="restaurant-description" value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} className="min-h-28 rounded-xl bg-white/75" placeholder="Tell guests about the table." /></div>
          <div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="restaurant-phone">Phone</Label><Input id="restaurant-phone" value={form.phone} onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} className="h-11 rounded-xl bg-white/75" placeholder="+1 555 012 3456" /></div><div className="space-y-2"><Label htmlFor="restaurant-hours">Business hours</Label><Input id="restaurant-hours" value={form.hours} onChange={event => setForm(current => ({ ...current, hours: event.target.value }))} className="h-11 rounded-xl bg-white/75" placeholder="Tue–Sun · 12:00–22:30" /></div></div>
          <div className="space-y-2"><Label htmlFor="restaurant-address">Address</Label><Textarea id="restaurant-address" value={form.address} onChange={event => setForm(current => ({ ...current, address: event.target.value }))} className="min-h-20 rounded-xl bg-white/75" placeholder="Street, city, neighborhood" /></div>
          <div className="grid gap-4 sm:grid-cols-3"><SocialInput label="Instagram" value={form.instagram} onChange={value => setForm(current => ({ ...current, instagram: value }))} /><SocialInput label="Facebook" value={form.facebook} onChange={value => setForm(current => ({ ...current, facebook: value }))} /><SocialInput label="Website" value={form.website} onChange={value => setForm(current => ({ ...current, website: value }))} /></div>
          <div className="flex items-center justify-between rounded-2xl bg-white/55 p-4"><div><p className="text-sm font-semibold text-slate-800">Publish public menu</p><p className="mt-1 text-xs leading-5 text-slate-500">Guests can only open published restaurants.</p></div><Switch checked={form.isPublished} onCheckedChange={checked => setForm(current => ({ ...current, isPublished: checked }))} aria-label="Publish public menu" /></div>
        </div>
      </div>
      <div className="mt-8 flex justify-end border-t border-slate-200/70 pt-5"><Button disabled={update.isPending || image.isUploading} onClick={save} className="h-11 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800">{update.isPending ? "Saving…" : "Save settings"}</Button></div>
    </section>
  );
}

function CategoriesPanel({ restaurantId }: { restaurantId: string }) {
  const categories = trpc.restaurant.owner.categories.list.useQuery({ restaurantId });
  const utils = trpc.useUtils();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const create = trpc.restaurant.owner.categories.create.useMutation({ onSuccess: async () => { await utils.restaurant.owner.categories.list.invalidate({ restaurantId }); setNewName(""); toast.success("Category added."); }, onError: error => toast.error(error.message) });
  const update = trpc.restaurant.owner.categories.update.useMutation({ onSuccess: async () => { await utils.restaurant.owner.categories.list.invalidate({ restaurantId }); setEditingId(null); toast.success("Category updated."); }, onError: error => toast.error(error.message) });
  const remove = trpc.restaurant.owner.categories.remove.useMutation({ onSuccess: async () => { await Promise.all([utils.restaurant.owner.categories.list.invalidate({ restaurantId }), utils.restaurant.owner.menuItems.list.invalidate({ restaurantId })]); toast.success("Category removed. Its menu items remain uncategorized."); }, onError: error => toast.error(error.message) });
  const reorder = trpc.restaurant.owner.categories.reorder.useMutation({ onSuccess: async () => { await utils.restaurant.owner.categories.list.invalidate({ restaurantId }); }, onError: error => toast.error(error.message) });
  const rows = categories.data ?? [];

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate({ restaurantId, categoryIds: next.map(row => row.id) });
  };

  return (
    <section className="glass-panel rounded-[28px] p-5 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row"><Input value={newName} onChange={event => setNewName(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && newName.trim()) create.mutate({ restaurantId, data: { name: newName.trim() } }); }} placeholder="New category name" className="h-11 rounded-xl bg-white/75" /><Button disabled={!newName.trim() || create.isPending} onClick={() => create.mutate({ restaurantId, data: { name: newName.trim() } })} className="h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800"><Plus className="mr-2 size-4" /> Add category</Button></div>
      <p className="mt-3 text-xs leading-5 text-slate-400">Use the arrow controls to set the order guests see in the public menu.</p>
      <div className="mt-7 space-y-3">
        {categories.isLoading && <WorkspaceSkeleton compact />}
        {rows.map((category, index) => (
          <div key={category.id} className="flex items-center gap-3 rounded-2xl bg-white/63 p-3 shadow-[0_5px_18px_rgba(70,69,111,.06)]">
            <GripVertical className="size-4 shrink-0 text-slate-300" />
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {editingId === category.id ? <Input autoFocus value={editingName} onChange={event => setEditingName(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && editingName.trim()) update.mutate({ categoryId: category.id, data: { name: editingName.trim() } }); }} className="h-9 rounded-lg bg-white" /> : <span className="truncate text-sm font-semibold text-slate-800">{category.name}</span>}
            </div>
            <div className="flex shrink-0 gap-1">
              {editingId === category.id ? <Button size="sm" onClick={() => editingName.trim() && update.mutate({ categoryId: category.id, data: { name: editingName.trim() } })} className="h-8 rounded-lg bg-slate-900 px-2 text-xs text-white">Save</Button> : <IconButton label={`Edit ${category.name}`} onClick={() => { setEditingId(category.id); setEditingName(category.name); }}><Pencil className="size-3.5" /></IconButton>}
              <IconButton label={`Move ${category.name} up`} onClick={() => move(index, -1)} disabled={index === 0 || reorder.isPending}><ChevronLeft className="size-4 rotate-90" /></IconButton>
              <IconButton label={`Move ${category.name} down`} onClick={() => move(index, 1)} disabled={index === rows.length - 1 || reorder.isPending}><ChevronRight className="size-4 rotate-90" /></IconButton>
              <IconButton label={`Delete ${category.name}`} danger onClick={() => remove.mutate({ categoryId: category.id })} disabled={remove.isPending}><Trash2 className="size-3.5" /></IconButton>
            </div>
          </div>
        ))}
        {!categories.isLoading && !rows.length && <EmptyPanel icon={<Tags className="size-6" />} title="No categories yet" description="Add a category to group the first menu items." />}
      </div>
    </section>
  );
}

function MenuItemsPanel({ restaurantId }: { restaurantId: string }) {
  const menuItems = trpc.restaurant.owner.menuItems.list.useQuery({ restaurantId });
  const categories = trpc.restaurant.owner.categories.list.useQuery({ restaurantId });
  const utils = trpc.useUtils();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NonNullable<typeof menuItems.data>[number] | null>(null);
  const remove = trpc.restaurant.owner.menuItems.remove.useMutation({ onSuccess: async () => { await utils.restaurant.owner.menuItems.list.invalidate({ restaurantId }); toast.success("Menu item removed."); }, onError: error => toast.error(error.message) });
  const categoryMap = useMemo(() => new Map((categories.data ?? []).map(category => [category.id, category.name])), [categories.data]);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (item: NonNullable<typeof menuItems.data>[number]) => { setEditing(item); setDialogOpen(true); };

  return (
    <section className="glass-panel rounded-[28px] p-5 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><p className="max-w-lg text-sm leading-6 text-slate-500">Every item includes its public presentation, category, price, optional owner-supplied rating, and availability.</p><Button onClick={openCreate} className="h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800"><Plus className="mr-2 size-4" /> Add menu item</Button></div>
      <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {menuItems.isLoading && <WorkspaceSkeleton compact />}
        {menuItems.data?.map(item => (
          <article key={item.id} className="overflow-hidden rounded-[22px] bg-white/68 p-2.5 shadow-[0_5px_18px_rgba(70,69,111,.06)]">
            <div className="relative aspect-[1.35/1] overflow-hidden rounded-[16px] bg-[#eef0f8]">
              {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover" /> : <span className="grid size-full place-items-center text-[#aab3d2]"><ImagePlus className="size-6" /></span>}
              <Badge className={cn("absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.11em]", item.isAvailable ? "bg-emerald-100/90 text-emerald-700" : "bg-slate-100/90 text-slate-500")}>{item.isAvailable ? "Available" : "Hidden"}</Badge>
            </div>
            <div className="p-2 pb-1 pt-4"><div className="flex items-start justify-between gap-3"><h3 className="line-clamp-1 font-display text-lg font-semibold tracking-[-0.035em] text-slate-900">{item.title}</h3><span className="text-sm font-semibold text-slate-800">{money(item.price)}</span></div><p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{item.description || "No description yet."}</p><div className="mt-3 flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7380ab]">{item.categoryId ? categoryMap.get(item.categoryId) || "Category" : "Uncategorized"}</span><div className="flex gap-1"><IconButton label={`Edit ${item.title}`} onClick={() => openEdit(item)}><Pencil className="size-3.5" /></IconButton><IconButton danger label={`Delete ${item.title}`} onClick={() => remove.mutate({ menuItemId: item.id })} disabled={remove.isPending}><Trash2 className="size-3.5" /></IconButton></div></div></div>
          </article>
        ))}
      </div>
      {!menuItems.isLoading && !menuItems.data?.length && <div className="mt-7"><EmptyPanel icon={<UtensilsCrossed className="size-6" />} title="The menu is still a blank page" description="Add the first item to begin shaping the public menu." /></div>}
      <MenuItemDialog open={dialogOpen} onOpenChange={setDialogOpen} restaurantId={restaurantId} item={editing} categories={categories.data ?? []} onSaved={async () => { await utils.restaurant.owner.menuItems.list.invalidate({ restaurantId }); setDialogOpen(false); }} />
    </section>
  );
}

function MenuItemDialog({ open, onOpenChange, restaurantId, item, categories, onSaved }: { open: boolean; onOpenChange: (open: boolean) => void; restaurantId: string; item: { id: string; categoryId: string | null; title: string; description: string; ingredients: string; price: string | number; rating: string | number | null; imageKey: string | null; imageUrl: string | null; isAvailable: boolean } | null; categories: Array<{ id: string; name: string }>; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState<MenuItemFormState>(() => item ? menuItemFormFrom(item) : emptyMenuItemForm());
  const image = useOwnerImageUpload(restaurantId);
  const create = trpc.restaurant.owner.menuItems.create.useMutation({ onSuccess: async () => { await onSaved(); toast.success("Menu item added."); }, onError: error => toast.error(error.message) });
  const update = trpc.restaurant.owner.menuItems.update.useMutation({ onSuccess: async () => { await onSaved(); toast.success("Menu item updated."); }, onError: error => toast.error(error.message) });

  useEffect(() => { if (open) setForm(item ? menuItemFormFrom(item) : emptyMenuItemForm()); }, [item, open]);
  const isSaving = create.isPending || update.isPending;

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try { const result = await image.upload(file); setForm(current => ({ ...current, imageKey: result.key, imageUrl: result.url })); toast.success("Image ready. Save the item to keep it."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "The image could not be uploaded."); }
    finally { event.target.value = ""; }
  };

  const submit = () => {
    const price = Number(form.price);
    const rating = form.rating.trim() ? Number(form.rating) : null;
    if (!form.title.trim()) return toast.error("Add a menu item title.");
    if (!Number.isFinite(price) || price < 0) return toast.error("Enter a valid non-negative price.");
    if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) return toast.error("Rating must be between 0 and 5.");
    const data = { categoryId: form.categoryId || null, title: form.title.trim(), description: form.description.trim(), ingredients: form.ingredients.trim(), price, rating, imageKey: form.imageKey, imageUrl: form.imageUrl, isAvailable: form.isAvailable };
    if (item) update.mutate({ menuItemId: item.id, data }); else create.mutate({ restaurantId, data });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/70 bg-[#f9f9fd]/96 sm:max-w-2xl sm:rounded-[28px]">
        <DialogHeader><DialogTitle className="font-display text-2xl tracking-[-0.045em]">{item ? "Edit menu item" : "Add menu item"}</DialogTitle><DialogDescription>Only owner-provided menu metadata appears in the public card and detail sheet.</DialogDescription></DialogHeader>
        <div className="grid gap-6 py-3 sm:grid-cols-[.78fr_1.22fr]">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-[22px] border border-white bg-[#eef0f8]">{form.imageUrl ? <img src={form.imageUrl} alt="Item preview" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-center"><div><ImagePlus className="mx-auto size-6 text-[#8490bd]" /><p className="mt-2 text-xs text-slate-500">No image yet</p></div></div>}{form.imageUrl && <button onClick={() => setForm(current => ({ ...current, imageKey: null, imageUrl: null }))} className="absolute right-2 top-2 grid size-8 place-items-center rounded-lg bg-slate-950/50 text-white" aria-label="Remove item image"><X className="size-4" /></button>}</div>
            <label className="mt-3 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/80 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"><UploadCloud className="size-3.5" /> {image.isUploading ? "Uploading…" : "Upload image"}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} disabled={image.isUploading} /></label>
          </div>
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="item-title">Title</Label><Input id="item-title" value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} className="h-10 rounded-xl bg-white/80" placeholder="Plate name" /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Category</Label><Select value={form.categoryId || "uncategorized"} onValueChange={value => setForm(current => ({ ...current, categoryId: value === "uncategorized" ? "" : value }))}><SelectTrigger className="h-10 rounded-xl bg-white/80"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="uncategorized">Uncategorized</SelectItem>{categories.map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="item-price">Price</Label><Input id="item-price" value={form.price} onChange={event => setForm(current => ({ ...current, price: event.target.value }))} inputMode="decimal" placeholder="0.00" className="h-10 rounded-xl bg-white/80" /></div></div>
            <div className="space-y-2"><Label htmlFor="item-description">Description</Label><Textarea id="item-description" value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} className="min-h-20 rounded-xl bg-white/80" placeholder="A concise description for guests." /></div>
            <div className="space-y-2"><Label htmlFor="item-ingredients">Ingredients</Label><Textarea id="item-ingredients" value={form.ingredients} onChange={event => setForm(current => ({ ...current, ingredients: event.target.value }))} className="min-h-20 rounded-xl bg-white/80" placeholder="Use a comma-separated list or a sentence." /></div>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]"><div className="space-y-2"><Label htmlFor="item-rating">Owner-supplied rating (optional)</Label><Input id="item-rating" value={form.rating} onChange={event => setForm(current => ({ ...current, rating: event.target.value }))} inputMode="decimal" placeholder="Leave empty for no rating" className="h-10 rounded-xl bg-white/80" /></div><div className="flex items-end"><div className="flex h-10 items-center gap-2 rounded-xl bg-white/60 px-3"><Switch checked={form.isAvailable} onCheckedChange={checked => setForm(current => ({ ...current, isAvailable: checked }))} aria-label="Item availability" /><span className="text-xs font-semibold text-slate-600">Available</span></div></div></div>
          </div>
        </div>
        <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button><Button disabled={isSaving || image.isUploading} onClick={submit} className="rounded-xl bg-slate-900 text-white hover:bg-slate-800">{isSaving ? "Saving…" : item ? "Save changes" : "Add item"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PageHeader({ eyebrow, title, description, badge }: { eyebrow: string; title: string; description: string; badge?: string }) {
  return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6875a6]">{eyebrow}</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.055em] text-slate-900 sm:text-5xl">{title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p></div>{badge && <Badge className={cn("w-fit rounded-full px-3 py-1.5 text-xs font-medium", badge === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{badge}</Badge>}</div>;
}

function MetricCard({ icon, label, value, note, tint }: { icon: React.ReactNode; label: string; value: string | number; note: string; tint: "blue" | "mint" | "lilac" }) {
  const styles = { blue: "bg-[#edf1ff] text-[#6170a8]", mint: "bg-[#e8f7f1] text-[#43836f]", lilac: "bg-[#f2ecff] text-[#876db1]" };
  return <Card className="glass-panel border-white/70 rounded-[24px]"><CardContent className="p-5"><span className={cn("grid size-10 place-items-center rounded-[14px]", styles[tint])}>{icon}</span><p className="mt-5 text-sm font-medium text-slate-500">{label}</p><p className="mt-1 font-display text-4xl font-semibold tracking-[-0.055em] text-slate-900">{value}</p><p className="mt-2 text-xs text-slate-400">{note}</p></CardContent></Card>;
}

function SocialInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = `social-${label.toLowerCase()}`;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} value={value} onChange={event => onChange(event.target.value)} className="h-10 rounded-xl bg-white/75" placeholder="https://" /></div>;
}

function IconButton({ label, children, onClick, danger = false, disabled = false }: { label: string; children: React.ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return <button aria-label={label} title={label} disabled={disabled} onClick={onClick} className={cn("grid size-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40", danger && "hover:bg-rose-50 hover:text-rose-600")}>{children}</button>;
}

function EmptyPanel({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div className="rounded-[22px] border border-dashed border-[#cbd2eb] bg-white/35 p-9 text-center"><span className="mx-auto grid size-12 place-items-center rounded-[16px] bg-white/75 text-[#7481b2]">{icon}</span><h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.04em] text-slate-900">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p></div>;
}

function MissingRestaurant({ onBack }: { onBack: () => void }) {
  return <div className="glass-panel rounded-[28px] p-9 text-center"><PackageOpen className="mx-auto size-8 text-[#7783b3]" /><h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.04em] text-slate-900">Restaurant not found</h2><p className="mt-2 text-sm text-slate-500">It may belong to another account or no longer be available.</p><Button onClick={onBack} className="mt-5 rounded-xl bg-slate-900 text-white">Back to restaurants</Button></div>;
}

function WorkspaceSkeleton({ compact = false }: { compact?: boolean }) {
  return <div className={cn("grid gap-4", compact ? "grid-cols-1" : "sm:grid-cols-2")}><Skeleton className="h-40 rounded-[24px]" /><Skeleton className="h-40 rounded-[24px]" />{!compact && <Skeleton className="h-40 rounded-[24px]" />}</div>;
}
