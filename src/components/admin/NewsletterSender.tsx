import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Send, Users } from "lucide-react";

export const NewsletterSender = () => {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendNewsletter = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Câmpuri obligatorii",
        description: "Te rugăm să completezi subiectul și mesajul.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body: { subject, message },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Newsletter trimis!",
          description: `Email-ul a fost trimis cu succes către ${data.sentCount} utilizatori.`,
        });
        setSubject("");
        setMessage("");
      } else {
        throw new Error(data?.error || "Eroare la trimiterea newsletter-ului");
      }
    } catch (error: unknown) {
      console.error("Error sending newsletter:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare necunoscută";
      toast({
        title: "Eroare",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Trimite Newsletter</CardTitle>
            <CardDescription>Trimite un email către toți utilizatorii platformei</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="newsletter-subject">Subiect</Label>
          <Input
            id="newsletter-subject"
            placeholder="Subiectul email-ului..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={sending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newsletter-message">Mesaj</Label>
          <Textarea
            id="newsletter-message"
            placeholder="Conținutul email-ului..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            disabled={sending}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Poți folosi text simplu. Semnătura StudyBuddy va fi adăugată automat.
          </p>
        </div>

        <Button
          onClick={handleSendNewsletter}
          disabled={sending || !subject.trim() || !message.trim()}
          className="w-full sm:w-auto"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Se trimite...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Trimite Email la Toți Utilizatorii
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
