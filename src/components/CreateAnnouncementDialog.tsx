import { useState, useEffect } from "react";
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
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CreateAnnouncementData, AnnouncementCategory, CATEGORY_LABELS, CATEGORY_ICONS } from "@/hooks/useAnnouncements";

interface CreateAnnouncementDialogProps {
  onCreateAnnouncement: (data: CreateAnnouncementData) => Promise<string | null>;
}

interface University {
  id: string;
  name: string;
  short_name: string;
}

export function CreateAnnouncementDialog({ onCreateAnnouncement }: CreateAnnouncementDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("other");
  const [price, setPrice] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [universityId, setUniversityId] = useState<string>("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    const result = await onCreateAnnouncement({
      title: title.trim(),
      description: description.trim(),
      category,
      price: price ? parseFloat(price) : undefined,
      contact_info: contactInfo.trim() || undefined,
      university_id: universityId || undefined,
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
              {loading ? "Se publică..." : "Publică Anunț"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
