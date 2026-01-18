import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Send, Calendar, Clock, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { format, isPast, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

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
  
  // Schedule state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState("09:00");

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
  }, [fetchScheduledNewsletters]);

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
            <Label htmlFor="newsletter-message">Mesaj</Label>
            <Textarea
              id="newsletter-message"
              placeholder="Conținutul email-ului..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              disabled={sending || scheduling}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Poți folosi text simplu. Semnătura StudyBuddy va fi adăugată automat.
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
                <Label htmlFor="schedule-time">Ora</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="pl-10"
                    disabled={sending || scheduling}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
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
    </div>
  );
};
