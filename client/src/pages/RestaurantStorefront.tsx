import { useNotebook } from "@/hooks/useNotebook";
import { notebookItemCount, notebookTotal, type NotebookItem } from "@/lib/notebook";
import {
  previewRestaurant,
  RESTAURANT_IMAGES,
  type StorefrontData,
  type StorefrontMenuItem,
} from "@/lib/restaurantPreview";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  ChefHat,
  Clock3,
  Facebook,
  Globe2,
  Instagram,
  MapPin,
  Menu,
  Minus,
  NotebookPen,
  Phone,
  Plus,
  Star,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useRoute } from "wouter";

type RestaurantStorefrontProps = {
  preview?: boolean;
};

function amount(value: number | string) {
  const valueAsNumber = Number(value);
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number.isFinite(valueAsNumber) ? valueAsNumber : 0,
  );
}

function socialLinks(value: string) {
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

function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2.5 text-left">
      <span className="grid size-9 place-items-center rounded-[14px] bg-[linear-gradient(145deg,#b4e3d7,#7a90da)] text-white shadow-[0_8px_18px_rgba(87,108,182,.25)]">
        <ChefHat className="size-[18px]" strokeWidth={1.8} />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[15px] font-semibold tracking-[-0.03em] text-slate-900">Luma</span>
          <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-500">Table</span>
        </span>
      )}
    </div>
  );
}

function StorefrontLoading() {
  return (
    <main className="min-h-screen bg-[#f4f4fa] px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Skeleton className="h-16 rounded-[24px] bg-white/60" />
        <Skeleton className="mt-5 h-[360px] rounded-[32px] bg-white/60" />
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map(index => <Skeleton key={index} className="h-80 rounded-[28px] bg-white/60" />)}
        </div>
      </div>
    </main>
  );
}

export default function RestaurantStorefront({ preview = false }: RestaurantStorefrontProps) {
  const [, params] = useRoute("/r/:restaurantSlug");
  const restaurantSlug = params?.restaurantSlug;
  const query = trpc.restaurant.public.getBySlug.useQuery(
    { slug: restaurantSlug ?? "" },
    { enabled: Boolean(restaurantSlug) && !preview },
  );

  if (!preview && restaurantSlug && query.isLoading) return <StorefrontLoading />;
  if (!preview && restaurantSlug && !query.data) return <RestaurantUnavailable />;

  const data: StorefrontData = preview || !restaurantSlug
    ? previewRestaurant
    : {
        restaurant: query.data!.restaurant,
        categories: query.data!.categories,
        menuItems: query.data!.menuItems,
      };

  return <Storefront data={data} isPreview={preview || !restaurantSlug} />;
}

function RestaurantUnavailable() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f4fa] p-6">
      <section className="glass-panel max-w-md rounded-[32px] p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-slate-700 shadow-sm">
          <UtensilsCrossed className="size-6" />
        </span>
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-[-0.04em] text-slate-900">This menu is not available</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">The restaurant may still be preparing its menu or the address may be incorrect.</p>
        <Link href="/">
          <Button className="mt-6 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800">
            <ArrowLeft className="mr-2 size-4" /> View the preview
          </Button>
        </Link>
      </section>
    </main>
  );
}

function Storefront({ data, isPreview }: { data: StorefrontData; isPreview: boolean }) {
  const [location, setLocation] = useLocation();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<StorefrontMenuItem | null>(null);
  const { notebook, addItem, setQuantity, clear } = useNotebook(data.restaurant.id);
  const links = socialLinks(data.restaurant.socialLinks);

  useEffect(() => {
    setSelectedCategory("all");
    setSelectedItem(null);
  }, [data.restaurant.id]);

  const menuItems = useMemo(
    () => data.menuItems.filter(item => selectedCategory === "all" || item.categoryId === selectedCategory),
    [data.menuItems, selectedCategory],
  );

  const handleAdd = (item: StorefrontMenuItem) => {
    const notebookItem: Omit<NotebookItem, "quantity"> = {
      menuItemId: item.id,
      title: item.title,
      price: Number(item.price),
      imageUrl: item.imageUrl,
    };
    addItem(notebookItem);
    toast.success(`${item.title} added to Notebook`, { duration: 1800 });
  };

  const notebookCount = notebookItemCount(notebook);
  const heroImage = data.restaurant.bannerImageUrl || RESTAURANT_IMAGES.hero;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f5fb] text-slate-900 selection:bg-[#bbd5f1]">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-24 size-[30rem] rounded-full bg-[#d9e7ff]/70 blur-3xl" />
        <div className="absolute -right-24 top-[22rem] size-[28rem] rounded-full bg-[#e6d9ff]/55 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[24%] size-[36rem] rounded-full bg-[#d1f4e8]/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-6 sm:pt-6">
        <header className="glass-panel sticky top-3 z-30 grid grid-cols-[44px_1fr_44px] items-center rounded-[22px] px-2 py-2.5 sm:top-5 sm:rounded-[24px]">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-[14px] text-slate-700 hover:bg-white/75"
            onClick={() => setNavigationOpen(true)}
            aria-label="Open restaurant menu"
          >
            <Menu className="size-[19px]" />
          </Button>
          <div className="justify-self-center">
            <Mark compact />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="relative size-10 rounded-[14px] text-slate-700 hover:bg-white/75"
            onClick={() => setNotebookOpen(true)}
            aria-label={`Open Notebook with ${notebookCount} item${notebookCount === 1 ? "" : "s"}`}
          >
            <NotebookPen className="size-[18px]" />
            {notebookCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-slate-900 px-1 text-[10px] font-bold leading-5 text-white">
                {notebookCount}
              </span>
            )}
          </Button>
        </header>

        <section className="relative mt-5 min-h-[390px] overflow-hidden rounded-[30px] shadow-[0_24px_65px_rgba(72,68,116,.18)] sm:min-h-[430px] sm:rounded-[34px]">
          <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(12,18,32,.78)_0%,rgba(15,23,42,.47)_42%,rgba(15,23,42,.04)_76%)]" />
          <div className="relative flex min-h-[390px] max-w-xl flex-col justify-end p-6 sm:min-h-[430px] sm:p-10">
            {isPreview && <Badge className="mb-auto w-fit border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">Live style preview</Badge>}
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/65">Today at {data.restaurant.name}</p>
            <h1 className="mt-3 max-w-[14ch] font-display text-4xl font-semibold leading-[.96] tracking-[-0.055em] text-white sm:text-6xl">
              Made for lingering.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/78 sm:text-base">{data.restaurant.description || "Discover a menu built around seasonal ingredients and relaxed conversation."}</p>
            <div className="mt-7 flex flex-wrap gap-2.5 text-xs text-white/85">
              {data.restaurant.hours && <span className="glass-on-dark inline-flex items-center gap-2 rounded-full px-3 py-2"><Clock3 className="size-3.5" /> {data.restaurant.hours}</span>}
              {data.restaurant.address && <span className="glass-on-dark inline-flex items-center gap-2 rounded-full px-3 py-2"><MapPin className="size-3.5" /> {data.restaurant.address}</span>}
            </div>
          </div>
        </section>

        <section className="mt-9" aria-labelledby="menu-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6774a6]">The menu</p>
              <h2 id="menu-heading" className="mt-1.5 font-display text-3xl font-semibold tracking-[-0.045em] text-slate-900">Choose your mood</h2>
            </div>
            <span className="hidden text-sm text-slate-500 sm:block">{data.menuItems.length} plates</span>
          </div>
          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-6 sm:px-6" aria-label="Menu category filters">
            <CategoryPill active={selectedCategory === "all"} onClick={() => setSelectedCategory("all")}>All plates</CategoryPill>
            {data.categories.map(category => (
              <CategoryPill key={category.id} active={selectedCategory === category.id} onClick={() => setSelectedCategory(category.id)}>
                {category.name}
              </CategoryPill>
            ))}
          </div>

          {menuItems.length ? (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {menuItems.map(item => (
                <MenuItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} onAdd={() => handleAdd(item)} />
              ))}
            </div>
          ) : (
            <div className="glass-panel mt-5 rounded-[26px] p-9 text-center text-sm text-slate-500">There are no plates in this category yet.</div>
          )}
        </section>

        <footer className="glass-panel mt-10 rounded-[30px] px-6 py-8 sm:mt-14 sm:px-9 sm:py-10">
          <div className="grid gap-8 sm:grid-cols-[1.3fr_.8fr_.8fr] sm:gap-6">
            <div>
              <Mark />
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">{data.restaurant.description || "A place for food, conversation, and a little more time at the table."}</p>
              <div className="mt-5 flex gap-2">
                {links.instagram && <FooterLink href={links.instagram} label="Instagram"><Instagram className="size-4" /></FooterLink>}
                {links.facebook && <FooterLink href={links.facebook} label="Facebook"><Facebook className="size-4" /></FooterLink>}
                {links.website && <FooterLink href={links.website} label="Website"><Globe2 className="size-4" /></FooterLink>}
              </div>
            </div>
            <FooterInfo icon={<Phone className="size-4" />} label="Call us" value={data.restaurant.phone || "Contact details coming soon"} href={data.restaurant.phone ? `tel:${data.restaurant.phone}` : undefined} />
            <FooterInfo icon={<MapPin className="size-4" />} label="Find us" value={data.restaurant.address || "Address coming soon"} />
          </div>
          <Separator className="my-7 bg-slate-200/70" />
          <div className="flex flex-col justify-between gap-3 text-xs text-slate-400 sm:flex-row sm:items-center">
            <span>© {new Date().getFullYear()} {data.restaurant.name}. A calmer way to browse a menu.</span>
            <button onClick={() => setLocation("/owner/login")} className="w-fit font-medium text-slate-500 transition-colors hover:text-slate-900">Owner login</button>
          </div>
        </footer>
      </div>

      <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
        <SheetContent side="left" className="flex w-[min(88vw,375px)] flex-col border-r border-white/65 bg-[#f4f5fb]/92 p-0 backdrop-blur-2xl">
          <SheetHeader className="border-b border-slate-200/70 px-6 py-6 text-left">
            <Mark />
            <SheetTitle className="sr-only">Restaurant navigation</SheetTitle>
            <p className="pt-3 text-sm leading-6 text-slate-500">{data.restaurant.description || "Restaurant information and menu categories."}</p>
          </SheetHeader>
          <nav className="flex-1 px-4 py-5" aria-label="Restaurant categories">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Browse menu</p>
            <button className="nav-row mt-3" onClick={() => { setSelectedCategory("all"); setNavigationOpen(false); }}>All plates <span>{data.menuItems.length}</span></button>
            {data.categories.map(category => (
              <button key={category.id} className="nav-row" onClick={() => { setSelectedCategory(category.id); setNavigationOpen(false); }}>
                {category.name}
                <span>{data.menuItems.filter(item => item.categoryId === category.id).length}</span>
              </button>
            ))}
          </nav>
          <div className="border-t border-slate-200/70 p-4">
            <Button onClick={() => setLocation("/owner/login")} className="h-12 w-full rounded-2xl bg-slate-900 text-white shadow-[0_10px_20px_rgba(15,23,42,.2)] hover:bg-slate-800">Owner login</Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={notebookOpen} onOpenChange={setNotebookOpen}>
        <SheetContent side="right" className="flex w-[min(95vw,420px)] flex-col border-l border-white/65 bg-[#f7f7fc]/96 p-0 backdrop-blur-2xl">
          <SheetHeader className="border-b border-slate-200/70 px-6 py-6 text-left">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6774a6]">Saved for later</p>
                <SheetTitle className="mt-1.5 font-display text-2xl font-semibold tracking-[-0.04em] text-slate-900">Your Notebook</SheetTitle>
              </div>
              {notebookCount > 0 && <Badge className="rounded-full bg-slate-900 px-2.5 py-1 text-xs text-white">{notebookCount} saved</Badge>}
            </div>
          </SheetHeader>
          {notebook?.items.length ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
                {notebook.items.map(item => (
                  <NotebookRow key={item.menuItemId} item={item} onQuantity={quantity => setQuantity(item.menuItemId, quantity)} />
                ))}
              </div>
              <div className="border-t border-slate-200/70 bg-white/35 p-5">
                <div className="flex items-center justify-between text-sm text-slate-500"><span>Notebook total</span><strong className="font-display text-xl font-semibold tracking-[-0.03em] text-slate-900">{amount(notebookTotal(notebook))}</strong></div>
                <p className="mt-2 text-xs leading-5 text-slate-400">Your Notebook is saved only in this browser. It is not an order.</p>
                <Button variant="ghost" onClick={clear} className="mt-4 h-10 w-full rounded-xl text-slate-500 hover:bg-white hover:text-rose-600"><Trash2 className="mr-2 size-4" /> Clear Notebook</Button>
              </div>
            </div>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-[20px] bg-white text-slate-500 shadow-sm"><NotebookPen className="size-6" /></span>
                <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.04em] text-slate-900">A blank page, for now</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">Save a plate to your Notebook and it will stay here in this browser.</p>
                <Button onClick={() => setNotebookOpen(false)} variant="outline" className="mt-5 rounded-xl border-white bg-white/70">Browse the menu</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <MenuItemDetail item={selectedItem} open={Boolean(selectedItem)} onOpenChange={open => !open && setSelectedItem(null)} onAdd={handleAdd} />
    </main>
  );
}

function CategoryPill({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200", active ? "bg-slate-900 text-white shadow-[0_8px_16px_rgba(15,23,42,.16)]" : "glass-chip text-slate-600 hover:bg-white/90")}>{children}</button>
  );
}

function MenuItemCard({ item, onClick, onAdd }: { item: StorefrontMenuItem; onClick: () => void; onAdd: () => void }) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="group relative overflow-hidden rounded-[26px] border border-white/70 bg-white/72 p-2.5 text-left shadow-[0_12px_35px_rgba(75,73,114,.09)] backdrop-blur-md transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(75,73,114,.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7182c4]"
    >
      <div className="relative aspect-[1.25/1] overflow-hidden rounded-[19px] bg-slate-100">
        {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" /> : <span className="grid size-full place-items-center text-slate-400"><UtensilsCrossed className="size-7" /></span>}
        <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-slate-950/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-white backdrop-blur-md">{item.rating === null ? "No rating yet" : <><Star className="mr-1 inline size-3 fill-current" /> {Number(item.rating).toFixed(1)}</>}</span>
      </div>
      <div className="px-2 pb-2 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[19px] font-semibold leading-5 tracking-[-0.035em] text-slate-900">{item.title}</h3>
          <span className="shrink-0 text-sm font-semibold text-slate-900">{amount(item.price)}</span>
        </div>
        <p className="mt-2 line-clamp-2 min-h-10 text-[13px] leading-5 text-slate-500">{item.description || "A beautiful plate, waiting for its story."}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700"><Check className="size-3.5" /> Available now</span>
          <Button
            size="sm"
            onClick={event => { event.stopPropagation(); onAdd(); }}
            className="h-9 rounded-xl bg-[#ebefff] px-3 text-xs font-semibold text-[#3f4b80] shadow-none hover:bg-[#dfe6ff]"
          >
            <Plus className="mr-1 size-3.5" /> Notebook
          </Button>
        </div>
      </div>
    </article>
  );
}

function MenuItemDetail({ item, open, onOpenChange, onAdd }: { item: StorefrontMenuItem | null; open: boolean; onOpenChange: (open: boolean) => void; onAdd: (item: StorefrontMenuItem) => void }) {
  if (!item) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border border-white/70 bg-[#f9f9fd]/95 p-0 shadow-2xl backdrop-blur-2xl sm:rounded-[30px]">
        <div className="relative aspect-[1.38/1] overflow-hidden bg-slate-100">
          {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover" /> : <span className="grid size-full place-items-center text-slate-400"><UtensilsCrossed className="size-8" /></span>}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/40 to-transparent" />
          <Badge className="absolute bottom-4 left-5 rounded-full border border-white/25 bg-slate-950/40 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white backdrop-blur-md">{item.rating === null ? "No rating yet" : `Rating ${Number(item.rating).toFixed(1)}`}</Badge>
        </div>
        <div className="p-6 pt-5 sm:p-7 sm:pt-6">
          <DialogHeader className="text-left">
            <div className="flex items-start justify-between gap-5">
              <DialogTitle className="font-display text-3xl font-semibold tracking-[-0.055em] text-slate-900">{item.title}</DialogTitle>
              <span className="mt-1 shrink-0 font-display text-xl font-semibold tracking-[-0.03em] text-slate-900">{amount(item.price)}</span>
            </div>
            <DialogDescription className="mt-3 text-sm leading-6 text-slate-500">{item.description || "A carefully prepared plate."}</DialogDescription>
          </DialogHeader>
          {item.ingredients && (
            <div className="mt-6 rounded-2xl bg-white/75 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6774a6]">Ingredients</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.ingredients}</p>
            </div>
          )}
          <Button onClick={() => onAdd(item)} className="mt-6 h-12 w-full rounded-2xl bg-slate-900 text-sm text-white shadow-[0_12px_24px_rgba(15,23,42,.2)] hover:bg-slate-800"><Plus className="mr-2 size-4" /> Add to Notebook · {amount(item.price)}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NotebookRow({ item, onQuantity }: { item: NotebookItem; onQuantity: (quantity: number) => void }) {
  return (
    <div className="flex gap-3 rounded-[20px] bg-white/70 p-3 shadow-[0_6px_20px_rgba(75,73,114,.06)]">
      <div className="size-16 shrink-0 overflow-hidden rounded-[15px] bg-slate-100">
        {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover" /> : <UtensilsCrossed className="m-5 size-6 text-slate-400" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-3"><p className="truncate font-display text-[15px] font-semibold tracking-[-0.025em] text-slate-900">{item.title}</p><p className="text-sm font-semibold text-slate-900">{amount(item.price * item.quantity)}</p></div>
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center rounded-xl border border-slate-200/80 bg-white p-0.5">
            <button className="grid size-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => onQuantity(item.quantity - 1)} aria-label={`Decrease ${item.title}`}><Minus className="size-3.5" /></button>
            <span className="w-7 text-center text-xs font-semibold text-slate-700">{item.quantity}</span>
            <button className="grid size-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => onQuantity(item.quantity + 1)} aria-label={`Increase ${item.title}`}><Plus className="size-3.5" /></button>
          </div>
          <button className="grid size-7 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" onClick={() => onQuantity(0)} aria-label={`Remove ${item.title}`}><X className="size-4" /></button>
        </div>
      </div>
    </div>
  );
}

function FooterInfo({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = <span className="mt-2 block max-w-[22ch] text-sm leading-6 text-slate-600">{value}</span>;
  return (
    <div>
      <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{icon} {label}</span>
      {href ? <a href={href} className="transition-colors hover:text-slate-900">{content}</a> : content}
    </div>
  );
}

function FooterLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-9 place-items-center rounded-xl bg-white/70 text-slate-500 shadow-sm transition-[transform,background] hover:-translate-y-0.5 hover:bg-white hover:text-slate-900">{children}</a>;
}
