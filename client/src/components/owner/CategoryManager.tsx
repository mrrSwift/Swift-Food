import { api, type Category } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const API_BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");
import { CirclePlus, Pencil, Trash2 } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { IconPicker } from "@/components/owner/IconPicker";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";
const glass =
  "rounded-[26px] border border-white/70 bg-white/70 shadow-[0_16px_45px_rgba(74,71,113,.10)] backdrop-blur-xl";

export default function CategoryManager({
  restaurantId,
  categories,
  refresh,
}: {
  restaurantId: string;
  categories: Category[];
  refresh: () => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedIcon, setSelectedIcon] = useState("UtensilsCrossed");

  // Edit modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIcon, setEditIcon] = useState("UtensilsCrossed");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editKeepImage, setEditKeepImage] = useState(true);

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

  async function add(event: FormEvent) {
    event.preventDefault();
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
        formData.append("kind", "category");
        api
          .uploadImage(formData)
          .then(async url => {
            await api.createCategory(restaurantId, {
              name,
              description,
              image: url.url,
              icon: selectedIcon,
              order: categories.length,
            });
            setName("");
            setDescription("");
            setSelectedIcon("UtensilsCrossed");
            setImageFile(null);
            await refresh();
          })
          .catch(e => console.log(e));
      }
    } catch (error) {
      setError(errorMessage(error));
    }
  }

  // Open edit modal
  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || "");
    setEditIcon(category.icon || "UtensilsCrossed");
    setEditImageFile(null);
    setEditKeepImage(true);
  };

  // Submit edit
  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      let imageUrl = editingCategory.image; // keep existing by default
      if (!editKeepImage && editImageFile) {
        const formData = new FormData();
        formData.append("image", editImageFile);
        formData.append("kind", "category");
        const uploadRes = await api.uploadImage(formData);
        imageUrl = uploadRes.url;
      }

      if (editingCategory._id) {
        await api.updateCategory(restaurantId, editingCategory._id, {
          name: editName,
          description: editDescription || undefined,
          icon: editIcon,
          image: imageUrl || undefined,
        });
      }
      toast.success("Category updated!");
      setEditingCategory(null);
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <section className={`${glass} mt-auto max-w-7xl p-6`}>
      <h2 className="font-display text-2xl font-semibold">Menu categories</h2>
      <form onSubmit={add} className="mt-5 grid grid-cols-2 gap-4">
        <Input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="e.g. Hot drink"
          required
        />
        <Input
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="e.g. Hot milk"
          required
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="rounded-md border p-3"
          required
        />
        <div className="col-span-2">
          <IconPicker
            value={selectedIcon}
            onChange={iconName => setSelectedIcon(iconName)}
          />
        </div>
        <Button className="p-6">
          <CirclePlus className=" " />
          Add
        </Button>
      </form>
      {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
      <div className="mt-5 space-y-2 grid grid-cols-2 gap-4">
        {categories.map(category => (
          <div
            className="grid grid-cols-2 gap-4 justify-items-center rounded-2xl bg-white/70 p-4"
            key={category._id}
          >
            <img
              width="100"
              className="col-span-2"
              src={API_BASE_URL + category.image}
              alt="not load"
            />
            <strong>{category.name}</strong>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => startEdit(category)}
              >
                <Pencil className="size-4 text-blue-600" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={async () => {
                  try {
                    if (category?._id) {
                      await api.deleteCategory(restaurantId, category._id);
                      await refresh();
                    }
                  } catch (error) {
                    setError(errorMessage(error));
                  }
                }}
              >
                <Trash2 className="size-4 text-rose-600" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className={`${glass} w-full max-w-md p-6`}>
            <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Category name"
                required
              />
              <Input
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                placeholder="Description"
              />
              <IconPicker
                value={editIcon}
                onChange={iconName => setEditIcon(iconName)}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editKeepImage}
                  onChange={e => setEditKeepImage(e.target.checked)}
                  id="keep-image"
                />
                <label htmlFor="keep-image" className="text-sm">
                  Keep existing image
                </label>
              </div>
              {!editKeepImage && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setEditImageFile(e.target.files?.[0] || null)}
                  className="rounded-md border p-2 w-full"
                />
              )}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
