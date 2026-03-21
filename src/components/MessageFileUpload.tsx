import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Image, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageFileUploadProps {
  userId: string;
  conversationId: string;
  onFileUploaded: (fileUrl: string, fileType: "image" | "file") => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function MessageFileUpload({ userId, conversationId, onFileUploaded }: MessageFileUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const ALLOWED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];

  const uploadFile = async (file: File, type: "image" | "file") => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Fișier prea mare",
        description: "Dimensiunea maximă este 10MB.",
        variant: "destructive",
      });
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (type === 'image' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({ title: "Tip nepermis", description: "Sunt permise doar JPG, PNG, GIF, WebP.", variant: "destructive" });
      return;
    }
    if (type === 'file' && !ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_FILE_EXTENSIONS.includes(ext)) {
      toast({ title: "Tip nepermis", description: "Sunt permise doar PDF, DOC, DOCX, TXT.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${conversationId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("message-attachments")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("message-attachments")
        .getPublicUrl(fileName);

      onFileUploaded(urlData.publicUrl, type);

      toast({
        title: "Fișier încărcat",
        description: "Fișierul a fost trimis cu succes.",
      });
    } catch (error: any) {
      toast({
        title: "Eroare",
        description: "Nu am putut încărca fișierul.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file, "image");
    }
    e.target.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file, "file");
    }
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileSelect}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={uploading}>
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="bg-popover border-border">
          <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
            <Image className="h-4 w-4 mr-2" />
            Imagine
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4 mr-2" />
            Fișier
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
