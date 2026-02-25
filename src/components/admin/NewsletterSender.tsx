import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Send, Calendar, Clock, Trash2, AlertCircle, CheckCircle2, Eye, FileText, Plus, Save } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { RichTextEditor } from "./RichTextEditor";
import DOMPurify from "dompurify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduledNewsletter {
  id: string;
  subject: string;
  message: string;
  status: string;
  send_at: string;
  sent_at: string | null;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

interface NewsletterTemplate {
  id: string;
  name: string;
  subject: string;
  message: string;
  created_at: string;
}

export const NewsletterSender = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduledNewsletters, setScheduledNewsletters] = useState<ScheduledNewsletter[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewNewsletter, setPreviewNewsletter] = useState<{ subject: string; message: string } | null>(null);

  // Schedule state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState("09:00");

  // Templates state
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);

  const handlePreview = (subjectText: string, messageText: string) => {
    setPreviewNewsletter({ subject: subjectText, message: messageText });
    setPreviewOpen(true);
  };

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("newsletter_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates((data as NewsletterTemplate[]) || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  const fetchScheduledNewsletters = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("newsletter_queue")
        .select("*")
        .order("send_at", { ascending: true });

      if (error) throw error;
      setScheduledNewsletters((data as ScheduledNewsletter[]) || []);
    } catch (error) {
      console.error("Error fetching scheduled newsletters:", error);
    } finally {
      setLoadingScheduled(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduledNewsletters();
    fetchTemplates();
  }, [fetchScheduledNewsletters, fetchTemplates]);

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || !subject.trim() || !message.trim()) {
      toast({
        title: "Câmpuri obligatorii",
        description: "Te rugăm să completezi numele template-ului, subiectul și mesajul.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Eroare",
        description: "Nu ești autentificat.",
        variant: "destructive",
      });
      return;
    }

    setSavingTemplate(true);

    try {
      const { error } = await supabase.from("newsletter_templates").insert({
        name: templateName.trim(),
        subject,
        message,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Template salvat!",
        description: `Template-ul "${templateName}" a fost salvat cu succes.`,
      });

      setTemplateName("");
      setSaveTemplateOpen(false);
      fetchTemplates();
    } catch (error: unknown) {
      console.error("Error saving template:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare necunoscută";
      toast({
        title: "Eroare",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleLoadTemplate = (template: NewsletterTemplate) => {
    setSubject(template.subject);
    setMessage(template.message);
    toast({
      title: "Template încărcat",
      description: `Template-ul "${template.name}" a fost încărcat.`,
    });
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("newsletter_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Template șters",
        description: "Template-ul a fost șters cu succes.",
      });
      fetchTemplates();
    } catch (error: unknown) {
      console.error("Error deleting template:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare necunoscută";
      toast({
        title: "Eroare",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

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

  const handleScheduleNewsletter = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Câmpuri obligatorii",
        description: "Te rugăm să completezi subiectul și mesajul.",
        variant: "destructive",
      });
      return;
    }

    if (!scheduleDate) {
      toast({
        title: "Data obligatorie",
        description: "Te rugăm să selectezi o dată pentru programare.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Eroare",
        description: "Nu ești autentificat.",
        variant: "destructive",
      });
      return;
    }

    setScheduling(true);

    try {
      // Combine date and time
      const [hours, minutes] = scheduleTime.split(":").map(Number);
      const sendAt = new Date(scheduleDate);
      sendAt.setHours(hours, minutes, 0, 0);

      if (isPast(sendAt)) {
        toast({
          title: "Dată invalidă",
          description: "Data și ora programată trebuie să fie în viitor.",
          variant: "destructive",
        });
        setScheduling(false);
        return;
      }

      const { error } = await supabase.from("newsletter_queue").insert({
        subject,
        message,
        send_at: sendAt.toISOString(),
        created_by: user.id,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Newsletter programat!",
        description: `Email-ul va fi trimis pe ${format(sendAt, "d MMMM yyyy 'la ora' HH:mm", { locale: ro })}.`,
      });

      setSubject("");
      setMessage("");
      setIsScheduled(false);
      setScheduleDate(undefined);
      setScheduleTime("09:00");
      fetchScheduledNewsletters();
    } catch (error: unknown) {
      console.error("Error scheduling newsletter:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare necunoscută";
      toast({
        title: "Eroare",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setScheduling(false);
    }
  };

  const handleSendScheduledNow = async (newsletter: ScheduledNewsletter) => {
    setSendingId(newsletter.id);

    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body: { subject: newsletter.subject, message: newsletter.message },
      });

      if (error) throw error;

      if (data?.success) {
        // Update the newsletter status
        await supabase
          .from("newsletter_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            sent_count: data.sentCount,
            failed_count: data.failedCount || 0,
          })
          .eq("id", newsletter.id);

        toast({
          title: "Newsletter trimis!",
          description: `Email-ul a fost trimis cu succes către ${data.sentCount} utilizatori.`,
        });
        fetchScheduledNewsletters();
      } else {
        throw new Error(data?.error || "Eroare la trimiterea newsletter-ului");
      }
    } catch (error: unknown) {
      console.error("Error sending scheduled newsletter:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare necunoscută";
      toast({
        title: "Eroare",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSendingId(null);
    }
  };

  const handleDeleteScheduled = async (id: string) => {
    try {
      const { error } = await supabase
        .from("newsletter_queue")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Newsletter șters",
        description: "Newsletter-ul programat a fost șters.",
      });
      fetchScheduledNewsletters();
    } catch (error: unknown) {
      console.error("Error deleting scheduled newsletter:", error);
      const errorMessage = error instanceof Error ? error.message : "Eroare necunoscută";
      toast({
        title: "Eroare",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const pendingNewsletters = scheduledNewsletters.filter(n => n.status === "pending");
  const sentNewsletters = scheduledNewsletters.filter(n => n.status === "sent");

  return (
    <div className="space-y-6">
      {/* Create Newsletter Card */}
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
          {/* Templates Section */}
          <div className="p-4 bg-muted/30 rounded-lg border space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Template-uri Salvate
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSaveTemplateOpen(true)}
                disabled={!subject.trim() || !message.trim() || sending || scheduling}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvează ca Template
              </Button>
            </div>

            {loadingTemplates ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : templates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                Nu ai template-uri salvate. Creează un newsletter și salvează-l ca template.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="group flex items-center gap-1 bg-background border rounded-lg px-3 py-1.5 text-sm hover:border-primary/50 transition-colors"
                  >
                    <button
                      onClick={() => handleLoadTemplate(template)}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {template.name}
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="newsletter-subject">Subiect</Label>
            <Input
              id="newsletter-subject"
              placeholder="Subiectul email-ului..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending || scheduling}
            />
          </div>

          <div className="space-y-2">
            <Label>Mesaj</Label>
            <RichTextEditor
              content={message}
              onChange={setMessage}
              placeholder="Conținutul email-ului..."
              disabled={sending || scheduling}
            />
            <p className="text-xs text-muted-foreground">
              Folosește toolbar-ul pentru formatare. Semnătura StudyBuddy va fi adăugată automat.
            </p>
          </div>

          {/* Schedule Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="schedule-toggle"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="h-4 w-4 rounded border-border"
              disabled={sending || scheduling}
            />
            <Label htmlFor="schedule-toggle" className="cursor-pointer flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Programează trimiterea
            </Label>
          </div>

          {/* Schedule Options */}
          {isScheduled && (
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex-1 space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduleDate && "text-muted-foreground"
                      )}
                      disabled={sending || scheduling}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, "d MMMM yyyy", { locale: ro }) : "Selectează data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      disabled={(date) => isPast(date) && date.toDateString() !== new Date().toDateString()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1 space-y-2">
                <Label>Ora</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduleTime && "text-muted-foreground"
                      )}
                      disabled={sending || scheduling}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {scheduleTime || "Selectează ora"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="start">
                    <div className="grid grid-cols-4 gap-1 max-h-[200px] overflow-y-auto">
                      {Array.from({ length: 24 }, (_, hour) => {
                        const timeValue = `${hour.toString().padStart(2, '0')}:00`;
                        return (
                          <Button
                            key={timeValue}
                            variant={scheduleTime === timeValue ? "default" : "ghost"}
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setScheduleTime(timeValue)}
                          >
                            {timeValue}
                          </Button>
                        );
                      })}
                    </div>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-4 gap-1">
                      {['00', '15', '30', '45'].map((min) => {
                        const hour = scheduleTime.split(':')[0] || '09';
                        const timeValue = `${hour}:${min}`;
                        return (
                          <Button
                            key={min}
                            variant={scheduleTime.endsWith(`:${min}`) ? "default" : "ghost"}
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setScheduleTime(timeValue)}
                          >
                            :{min}
                          </Button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => handlePreview(subject, message)}
              disabled={!subject.trim() || !message.trim()}
              className="sm:w-auto"
            >
              <Eye className="w-4 h-4 mr-2" />
              Previzualizare
            </Button>

            {isScheduled ? (
              <Button
                onClick={handleScheduleNewsletter}
                disabled={scheduling || !subject.trim() || !message.trim() || !scheduleDate}
                className="flex-1"
              >
                {scheduling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Se programează...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Programează Newsletter
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSendNewsletter}
                disabled={sending || !subject.trim() || !message.trim()}
                className="flex-1"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Se trimite...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Trimite Acum
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Newsletters Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <CardTitle>Emailuri Programate</CardTitle>
              <CardDescription>Newslettere programate pentru trimitere</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingScheduled ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendingNewsletters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nu există newslettere programate.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingNewsletters.map((newsletter) => {
                const sendDate = parseISO(newsletter.send_at);
                const isOverdue = isPast(sendDate);

                return (
                  <div
                    key={newsletter.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      isOverdue ? "bg-destructive/5 border-destructive/30" : "bg-card"
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h4 className="font-semibold truncate">{newsletter.subject}</h4>
                          {isOverdue && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Depășit
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {newsletter.message}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Programat pentru: {format(sendDate, "d MMMM yyyy 'la ora' HH:mm", { locale: ro })}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {isOverdue && (
                          <Button
                            size="sm"
                            onClick={() => handleSendScheduledNow(newsletter)}
                            disabled={sendingId === newsletter.id}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {sendingId === newsletter.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-1" />
                                TRIMITE ACUM
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteScheduled(newsletter.id)}
                          disabled={sendingId === newsletter.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent Newsletters History */}
      {sentNewsletters.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle>Istoric Trimiteri</CardTitle>
                <CardDescription>Newslettere trimise recent</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentNewsletters.slice(0, 5).map((newsletter) => (
                <div
                  key={newsletter.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate text-sm">{newsletter.subject}</h4>
                    <p className="text-xs text-muted-foreground">
                      Trimis pe {format(parseISO(newsletter.sent_at!), "d MMM yyyy, HH:mm", { locale: ro })} •
                      {newsletter.sent_count} destinatari
                      {newsletter.failed_count > 0 && ` • ${newsletter.failed_count} eșuate`}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 shrink-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Trimis
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Template Modal */}
      <Dialog open={saveTemplateOpen} onOpenChange={setSaveTemplateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Salvează Template
            </DialogTitle>
            <DialogDescription>
              Salvează acest newsletter ca template pentru reutilizare rapidă
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Numele Template-ului</Label>
              <Input
                id="template-name"
                placeholder="ex: Anunț Important, Newsletter Săptămânal..."
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                disabled={savingTemplate}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <p className="text-muted-foreground">
                <strong>Subiect:</strong> {subject}
              </p>
              <p className="text-muted-foreground truncate">
                <strong>Mesaj:</strong> {message.replace(/<[^>]*>/g, '').slice(0, 100)}...
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSaveTemplateOpen(false)}>
                Anulează
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={savingTemplate || !templateName.trim()}
              >
                {savingTemplate ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Se salvează...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvează
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Previzualizare Email
            </DialogTitle>
            <DialogDescription>
              Așa va arăta email-ul trimis către utilizatori
            </DialogDescription>
          </DialogHeader>

          {previewNewsletter && (
            <div className="mt-4 space-y-4">
              {/* Email Header Preview */}
              <div className="bg-muted/50 rounded-lg p-4 border">
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-medium text-muted-foreground min-w-[60px]">De la:</span>
                    <span>StudyBuddy &lt;noreply@studybuddy.ro&gt;</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-muted-foreground min-w-[60px]">Către:</span>
                    <span className="text-muted-foreground">toți utilizatorii</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-muted-foreground min-w-[60px]">Subiect:</span>
                    <span className="font-semibold">{previewNewsletter.subject}</span>
                  </div>
                </div>
              </div>

              {/* Email Body Preview - Full branded template */}
              <div className="border rounded-lg overflow-hidden text-sm">
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #0d9488 100%)', padding: '36px 32px 48px', textAlign: 'center' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>📚 StudyBuddy</span>
                  </div>
                  <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '100px', marginBottom: '16px' }}>✨ Noutăți din comunitate</div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.2 }}>{previewNewsletter.subject}</h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>Platforma de colaborare academică pentru studenții din România.</p>
                </div>

                {/* Body */}
                <div style={{ padding: '28px 32px 24px', background: '#fff' }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#1e2a4a', margin: '0 0 10px' }}>Salut! 👋</p>
                  <div
                    className="prose prose-sm max-w-none text-foreground leading-relaxed"
                    style={{ fontSize: '14px', color: '#4b5a7a', marginBottom: '24px', lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(previewNewsletter.message, {
                        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
                        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
                      })
                    }}
                  />

                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e2a4a', margin: '0 0 12px' }}>🚀 Ce poți face pe StudyBuddy</p>

                  {[
                    { icon: '👥', color: 'linear-gradient(135deg,#2563eb,#3b82f6)', title: 'Grupuri de studiu pe cursuri', desc: 'Găsește sau creează grupuri organizate pe facultate și materie.' },
                    { icon: '💬', color: 'linear-gradient(135deg,#0d9488,#14b8a6)', title: 'Mesagerie în timp real', desc: 'Comunică direct cu colegii din grup — tot în aplicație.' },
                    { icon: '🚧', color: 'linear-gradient(135deg,#f97316,#fb923c)', title: 'Aplicații native — în lucru!', desc: 'Lucrăm activ pentru iOS, Android și PC. Lansarea se apropie!' },
                    { icon: '🔒', color: 'linear-gradient(135deg,#7c3aed,#a855f7)', title: 'Autentificare sigură', desc: 'Cont securizat cu email. Datele tale sunt protejate.' },
                  ].map((f) => (
                    <div key={f.title} style={{ background: '#f8faff', border: '1px solid #e2e8f8', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '8px', background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{f.icon}</div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e2a4a', margin: '0 0 2px' }}>{f.title}</p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
                      </div>
                    </div>
                  ))}

                  {/* Tip */}
                  <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '0 10px 10px 0', padding: '12px 16px', margin: '20px 0' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', margin: '0 0 3px' }}>💡 Sfatul săptămânii</p>
                    <p style={{ fontSize: '12px', color: '#78350f', margin: 0, lineHeight: 1.5 }}>Grupurile de studiu cu 3-5 membri s-au dovedit a fi cele mai eficiente!</p>
                  </div>

                  {/* CTA */}
                  <div style={{ textAlign: 'center', margin: '24px 0' }}>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#1e2a4a', margin: '0 0 6px' }}>Ești gata să înveți mai bine?</p>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>Accesează acum platforma și alătură-te unui grup de studiu.</p>
                    <span style={{ display: 'inline-block', background: 'linear-gradient(135deg,#2563eb,#0d9488)', color: '#fff', fontSize: '13px', fontWeight: 700, padding: '12px 32px', borderRadius: '100px' }}>Deschide StudyBuddy →</span>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '10px 0 0' }}>Gratuit pentru toți studenții din România 🇷🇴</p>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ background: '#f8faff', borderTop: '1px solid #e2e8f8', padding: '20px 32px', textAlign: 'center' }}>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: '#2563eb', margin: '0 0 8px' }}>📚 StudyBuddy</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                    © {new Date().getFullYear()} StudyBuddy · Platformă de colaborare academică pentru România 🇷🇴
                  </p>
                </div>
              </div>


              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Închide
                </Button>
                <Button
                  onClick={() => {
                    setPreviewOpen(false);
                    if (isScheduled) {
                      handleScheduleNewsletter();
                    } else {
                      handleSendNewsletter();
                    }
                  }}
                  disabled={sending || scheduling}
                >
                  {isScheduled ? (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Programează
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Trimite Acum
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
