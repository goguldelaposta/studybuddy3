import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Flag, Loader2 } from "lucide-react";

interface ReportButtonProps {
  contentType: "user" | "announcement" | "group" | "message";
  contentId: string;
  reportedUserId?: string;
  variant?: "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg" | "icon";
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam sau conținut fals" },
  { value: "harassment", label: "Hărțuire sau bullying" },
  { value: "inappropriate", label: "Conținut inadecvat" },
  { value: "hate_speech", label: "Discurs instigator la ură" },
  { value: "violence", label: "Violență sau amenințări" },
  { value: "impersonation", label: "Fraudă de identitate" },
  { value: "other", label: "Altceva" },
];

export const ReportButton = ({
  contentType,
  contentId,
  reportedUserId,
  variant = "ghost",
  size = "sm",
}: ReportButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId || null,
        reported_content_type: contentType,
        reported_content_id: contentId,
        reason: REPORT_REASONS.find((r) => r.value === reason)?.label || reason,
        description: description || null,
      });

      if (error) throw error;

      toast({
        title: "Raport trimis",
        description: "Mulțumim! Vom revizui raportul tău cât mai curând.",
      });
      setOpen(false);
      setReason("");
      setDescription("");
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: "Eroare",
        description: error.message || "Nu s-a putut trimite raportul.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="text-muted-foreground hover:text-destructive">
          <Flag className="w-4 h-4" />
          {size !== "icon" && <span className="ml-1">Raportează</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Raportează conținut</DialogTitle>
          <DialogDescription>
            Ajută-ne să menținem comunitatea sigură raportând conținutul problematic.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Motiv raportare *</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selectează un motiv" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Detalii suplimentare (opțional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrie problema în detaliu..."
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anulează
          </Button>
          <Button onClick={handleSubmit} disabled={!reason || loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Flag className="w-4 h-4 mr-2" />
                Trimite raport
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
