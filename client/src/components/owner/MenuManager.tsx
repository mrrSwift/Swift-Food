import { api, type Category, type MenuItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
const API_BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");
import { CirclePlus, Pencil, Trash2 } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";
const glass =
  "rounded-[26px] border border-white/70 bg-white/70 shadow-[0_16px_45px_rgba(74,71,113,.10)] backdrop-blur-xl";

export default function MenuManager({
  restaurantId,
  categories,
  items,
  refresh,
}: {
  restaurantId: string;
  categories: Category[];
  items: MenuItem[];
  refresh: () => Promise<void>;
}) {
  // ----- Add state -----
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    discountPrice: "",
    ingredients: "",
    allergens: "",
    isVegetarian: false,
    isVegan: false,
    preparationTime: "",
    isGlutenFree: false,
    spiceLevel: "",
    isAvailable: true,
  });
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { t } = useLocale();

  // ----- Edit state -----
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    discountPrice: "",
    ingredients: "",
    allergens: "",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    preparationTime: "",
    spiceLevel: "",
    isAvailable: true,
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [keepExistingImage, setKeepExistingImage] = useState(true);

  function price(price: number) {
    return (
      new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price) + " Toman"
    );
  }

  // File change for add
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('owner.menu.errValidImage'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('owner.menu.errSizeImage'));
      return;
    }
    setImageFile(file);
  };

  // ----- Add new item -----
  async function add(event: FormEvent) {
    event.preventDefault();
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
        formData.append("kind", "menu");
        api
          .uploadImage(formData)
          .then(async data => {
            await api.createMenuItem(restaurantId, {
              ...form,
              image: data.url,
              price: Number(form.price),
              preparationTime: Number(form.preparationTime) || undefined,
              order: items.length,
              discountPrice: Number(form.discountPrice) || undefined,
              isVegetarian: Boolean(form.isVegetarian),
              isVegan: Boolean(form.isVegan),
              isGlutenFree: Boolean(form.isGlutenFree),
            });
            // Reset form
            setForm({
              name: "",
              description: "",
              price: "",
              category: "",
              discountPrice: "",
              ingredients: "",
              allergens: "",
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: false,
              preparationTime: "",
              spiceLevel: "",
              isAvailable: true,
            });
            setImageFile(null);
            await refresh();
          })
          .catch(e => console.log(e));
      } else {
        // If no image
        await api.createMenuItem(restaurantId, {
          ...form,
          price: Number(form.price),
          preparationTime: Number(form.preparationTime) || undefined,
          order: items.length,
          discountPrice: Number(form.discountPrice) || undefined,
          isVegetarian: Boolean(form.isVegetarian),
          isVegan: Boolean(form.isVegan),
          isGlutenFree: Boolean(form.isGlutenFree),
        });
        setForm({
          name: "",
          description: "",
          price: "",
          category: "",
          discountPrice: "",
          ingredients: "",
          allergens: "",
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          preparationTime: "",
          spiceLevel: "",
          isAvailable: true,
        });
        await refresh();
      }
    } catch (error) {
      setError(errorMessage(error));
    }
  }

  // ----- Start edit (fill edit form) -----
  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category:
        typeof item.category === "string"
          ? item.category
          : item.category?._id || "",
      discountPrice: item.discountPrice ? String(item.discountPrice) : "",
      ingredients: item.ingredients || "",
      allergens: item.allergens || "",
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      preparationTime: item.preparationTime ? String(item.preparationTime) : "",
      spiceLevel: item.spiceLevel || "",
      isAvailable: item.isAvailable,
    });
    setEditImageFile(null);
    setKeepExistingImage(true);
  };

  // ----- Submit edit -----
  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      let imageUrl = editingItem.image;
      if (!keepExistingImage && editImageFile) {
        const formData = new FormData();
        formData.append("image", editImageFile);
        formData.append("kind", "menu");
        const uploadRes = await api.uploadImage(formData);
        imageUrl = uploadRes.url;
      }

      const payload = {
        name: editForm.name,
        description: editForm.description,
        price: Number(editForm.price),
        category: editForm.category,
        discountPrice: editForm.discountPrice
          ? Number(editForm.discountPrice)
          : undefined,
        ingredients: editForm.ingredients,
        allergens: editForm.allergens,
        isVegetarian: editForm.isVegetarian,
        isVegan: editForm.isVegan,
        isGlutenFree: editForm.isGlutenFree,
        preparationTime: editForm.preparationTime
          ? Number(editForm.preparationTime)
          : undefined,
        spiceLevel: editForm.spiceLevel,
        isAvailable: editForm.isAvailable,
        image: imageUrl,
        order: editingItem.order,
      };

      if (editingItem._id) {
        await api.updateMenuItem(restaurantId, editingItem._id, payload);
      }
      toast.success(t('owner.menu.menuUpdated'));
      setEditingItem(null);
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <section className={`${glass} mt-5 p-6`}>
      <h2 className="font-display text-2xl font-semibold">{t('owner.menu.title')}</h2>

      {/* ----- Add form ----- */}
      <form onSubmit={add} className="mt-5 grid gap-3 md:grid-cols-4">
        <Input
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder={t('owner.menu.itemName')}
          required
        />
        <Input
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          type="number"
          min="0"
          placeholder={t('owner.menu.price')}
          required
        />
        <Input
          value={form.discountPrice}
          onChange={e => setForm({ ...form, discountPrice: e.target.value })}
          type="number"
          max={form.price}
          min="0"
          placeholder={t('owner.menu.discountPrice')}
        />
        <Input
          value={form.ingredients}
          onChange={e => setForm({ ...form, ingredients: e.target.value })}
          placeholder={t('owner.menu.ingredients')}
        />
        <Input
          value={form.allergens}
          onChange={e => setForm({ ...form, allergens: e.target.value })}
          placeholder={t('owner.menu.allergens')}
        />
        <Input
          value={form.preparationTime}
          onChange={e => setForm({ ...form, preparationTime: e.target.value })}
          type="number"
          min="10"
          placeholder={t('owner.menu.prepTime')}
        />

        <select
          value={form.spiceLevel}
          onChange={e => setForm({ ...form, spiceLevel: e.target.value })}
          className="h-10 rounded-md border bg-white px-3"
        >
          <option value="">{t('owner.menu.spiceLevel')}</option>
          <option value="mild">{t('owner.menu.mild')}</option>
          <option value="medium">{t('owner.menu.medium')}</option>
          <option value="hot">{t('owner.menu.hot')}</option>
          <option value="extra_hot">{t('owner.menu.extra_hot')}</option>
        </select>

        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="h-10 rounded-md border bg-white px-3"
          required
        >
          <option value="">{t('owner.menu.category')}</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Checkboxes */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isGlutenFree}
            onChange={e => setForm({ ...form, isGlutenFree: e.target.checked })}
            id="add-gluten"
          />
          <label htmlFor="add-gluten" className="text-sm">
            {t('owner.menu.glutenFree')}
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isVegan}
            onChange={e => setForm({ ...form, isVegan: e.target.checked })}
            id="add-vegan"
          />
          <label htmlFor="add-vegan" className="text-sm">
            {t('owner.menu.vegan')}
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isVegetarian}
            onChange={e => setForm({ ...form, isVegetarian: e.target.checked })}
            id="add-vegetarian"
          />
          <label htmlFor="add-vegetarian" className="text-sm">
            {t('owner.menu.vegetarian')}
          </label>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="rounded-md border p-3 md:col-span-2"
        />

        <Button className="md:col-span-4" type="submit">
          <CirclePlus className="mr-2 size-4" />
          {t('owner.menu.addItem')}
        </Button>

        <Textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="min-h-20 md:col-span-4"
          placeholder={t('owner.menu.description')}
          required
        />
      </form>

      {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}

      {/* ----- Items grid ----- */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <article className="rounded-2xl bg-white/70 p-4" key={item._id}>
            <img
              src={API_BASE_URL + item.image}
              alt={item.name}
              className="relative rounded-2xl mb-3 z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
            />
            <div className="flex gap-3">
              <strong className="flex-1">{item.name}</strong>
              <div className="flex flex-col gap-1">
                {item.discountPrice ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 line-through">
                        {price(item.price)}
                      </span>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        {Math.round(
                          (1 - item.discountPrice / item.price) * 100
                        )}
                        % OFF
                      </span>
                    </div>
                    <strong className="text-xl text-black-600">
                      {price(item.discountPrice)}
                    </strong>
                  </>
                ) : (
                  <strong className="text-xl">{price(item.price)}</strong>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (item._id) {
                    await api.toggleMenuItem(item._id);
                    await refresh();
                  }
                }}
              >
                {item.isAvailable ? t('owner.menu.show') : t('owner.menu.Hide')}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => startEdit(item)}
              >
                <Pencil className="size-4 text-blue-600" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={async () => {
                  if (item._id) {
                    await api.deleteMenuItem(restaurantId, item._id);
                    await refresh();
                  }
                }}
              >
                <Trash2 className="size-4 text-rose-600" />
              </Button>
            </div>
          </article>
        ))}
      </div>

      {/* ----- Edit Modal ----- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div
            className={`${glass} w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto`}
          >
            <h3 className="text-lg font-semibold mb-4">{t('owner.menu.edit')}</h3>
            <form
              onSubmit={handleEditSubmit}
              className="grid gap-3 md:grid-cols-4"
            >
              <Input
                value={editForm.name}
                onChange={e =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder={t('owner.menu.itemName')}
                required
              />
              <Input
                value={editForm.price}
                onChange={e =>
                  setEditForm({ ...editForm, price: e.target.value })
                }
                type="number"
                min="0"
                placeholder={t('owner.menu.price')}
                required
              />
              <Input
                value={editForm.discountPrice}
                onChange={e =>
                  setEditForm({ ...editForm, discountPrice: e.target.value })
                }
                type="number"
                min="0"
                placeholder={t('owner.menu.discountPrice')}
              />
              <Input
                value={editForm.ingredients}
                onChange={e =>
                  setEditForm({ ...editForm, ingredients: e.target.value })
                }
                placeholder={t('owner.menu.ingredients')}
              />
              <Input
                value={editForm.allergens}
                onChange={e =>
                  setEditForm({ ...editForm, allergens: e.target.value })
                }
                placeholder={t('owner.menu.allergens')}
              />
              <Input
                value={editForm.preparationTime}
                onChange={e =>
                  setEditForm({ ...editForm, preparationTime: e.target.value })
                }
                type="number"
                min="10"
                placeholder={t('owner.menu.prepTime')}
              />
              <select
                value={editForm.spiceLevel}
                onChange={e =>
                  setEditForm({ ...editForm, spiceLevel: e.target.value })
                }
                className="h-10 rounded-md border bg-white px-3"
              >
                <option value="">{t('owner.menu.spiceLevel')}</option>
                <option value="mild">{t('owner.menu.mild')}</option>
                <option value="medium">{t('owner.menu.medium')}</option>
                <option value="hot">{t('owner.menu.hot')}</option>
                <option value="extra_hot">{t('owner.menu.extra_hot')}</option>
              </select>
              <select
                value={editForm.category}
                onChange={e =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
                className="h-10 rounded-md border bg-white px-3"
                required
              >
                <option value="">{t('owner.menu.category')}</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Checkboxes */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isGlutenFree}
                  onChange={e =>
                    setEditForm({ ...editForm, isGlutenFree: e.target.checked })
                  }
                  id="edit-gluten"
                />
                <label htmlFor="edit-gluten" className="text-sm">
                  {t('owner.menu.glutenFree')}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isVegan}
                  onChange={e =>
                    setEditForm({ ...editForm, isVegan: e.target.checked })
                  }
                  id="edit-vegan"
                />
                <label htmlFor="edit-vegan" className="text-sm">
                  {t('owner.menu.vegan')}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isVegetarian}
                  onChange={e =>
                    setEditForm({ ...editForm, isVegetarian: e.target.checked })
                  }
                  id="edit-vegetarian"
                />
                <label htmlFor="edit-vegetarian" className="text-sm">
                  {t('owner.menu.vegetarian')}
                </label>
              </div>

              {/* Keep existing image toggle */}
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  checked={keepExistingImage}
                  onChange={e => setKeepExistingImage(e.target.checked)}
                  id="keep-img"
                />
                <label htmlFor="keep-img" className="text-sm">
                  {t('owner.menu.keepImage')}
                </label>
              </div>
              {!keepExistingImage && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setEditImageFile(e.target.files?.[0] || null)}
                  className="rounded-md border p-2 md:col-span-2"
                />
              )}

              <Textarea
                value={editForm.description}
                onChange={e =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="min-h-20 md:col-span-4"
                placeholder={t('owner.menu.description')}
                required
              />

              <div className="md:col-span-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  {t('owner.menu.cancel')}
                </Button>
                <Button type="submit">{t('owner.menu.update')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
