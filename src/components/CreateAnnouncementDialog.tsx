import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CreateAnnouncementData, AnnouncementCategory, CATEGORY_LABELS, CATEGORY_ICONS, uploadAnnouncementImage } from "@/hooks/useAnnouncements";
import { useAuth } from "@/hooks/useAuth";

interface CreateAnnouncementDialogProps {
  onCreateAnnouncement: (data: CreateAnnouncementData) => Promise<string | null>;
}

interface University {
  id: string;
  name: string;
  short_name: string;
}

export function CreateAnnouncementDialog({ onCreateAnnouncement }: CreateAnnouncementDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("other");
  const [price, setPrice] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [universityId, setUniversityId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch universities
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("universities")
        .select("*")
        .order("name");

      if (data) setUniversities(data);
    };

    fetchData();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Imaginea trebuie să fie mai mică de 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !user) return;

    setLoading(true);
    
    let imageUrl: string | undefined;
    
    // Upload image if selected
    if (imageFile) {
      setUploadingImage(true);
      const uploadedUrl = await uploadAnnouncementImage(imageFile, user.id);
      setUploadingImage(false);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const result = await onCreateAnnouncement({
      title: title.trim(),
      description: description.trim(),
      category,
      price: price ? parseFloat(price) : undefined,
      contact_info: contactInfo.trim() || undefined,
      university_id: universityId || undefined,
      image_url: imageUrl,
    });

    setLoading(false);

    if (result) {
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("other");
      setPrice("");
      setContactInfo("");
      setUniversityId("");
      setImageFile(null);
      setImagePreview(null);
      setOpen(false);
    }
  };

  const categories = Object.entries(CATEGORY_LABELS) as [AnnouncementCategory, string][];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          Publică Anunț
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Publică un anunț</DialogTitle>
            <DialogDescription>
              Postează un anunț pentru meditații, cărți, coleg de cameră sau altele.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Categorie *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as AnnouncementCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        <span>{CATEGORY_ICONS[value]}</span>
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Titlu *</Label>
              <Input
                id="title"
                placeholder="ex: Ofer meditații la Matematică"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descriere *</Label>
              <Textarea
                id="description"
                placeholder="Descrie anunțul în detaliu..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Preț (opțional)</Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    RON
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="university">Universitate</Label>
                <Select value={universityId} onValueChange={setUniversityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează..." />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.id}>
                        {uni.short_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contact">Email de contact (opțional)</Label>
              <Input
                id="contact"
                type="email"
                placeholder="email@exemplu.com"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Imagine (opțional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-40 border-dashed flex flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Adaugă imagine (max 5MB)
                  </span>
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              className="gradient-primary text-primary-foreground"
              disabled={loading || !title.trim() || !description.trim()}
            >
              {loading ? (uploadingImage ? "Se încarcă imaginea..." : "Se publică...") : "Publică Anunț"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
