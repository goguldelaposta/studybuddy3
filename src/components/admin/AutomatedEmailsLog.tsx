import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Search, Mail, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface EmailLogEntry {
  id: string;
  user_id: string;
  email_type: string;
  sent_at: string;
  profile?: {
    full_name: string;
    email: string;
  } | null;
}

const emailTypeLabels: Record<string, { label: string; color: string; description: string }> = {
  welcome_day_3: { 
    label: "Welcome Day 3", 
    color: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    description: "Email de bun venit trimis la 3 zile după înregistrare"
  },
  welcome_day_7: { 
    label: "Welcome Day 7", 
    color: "bg-purple-500/20 text-purple-600 border-purple-500/30",
    description: "Email de încurajare pentru grupuri trimis la 7 zile"
  },
  reengagement_30: { 
    label: "Re-engagement 30", 
    color: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    description: "Email de re-angajare pentru utilizatori inactivi 30+ zile"
  },
};

export const AutomatedEmailsLog = () => {
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("automated_emails_log")
        .select(`
          id,
          user_id,
          email_type,
          sent_at,
          profile:profiles!automated_emails_log_user_id_fkey(full_name, email)
        `)
        .order("sent_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      // Transform data to handle the profile relationship
      const transformedData = (data || []).map(item => ({
        ...item,
        profile: Array.isArray(item.profile) ? item.profile[0] : item.profile
      }));

      setLogs(transformedData as EmailLogEntry[]);
    } catch (error) {
      console.error("Error fetching email logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || log.email_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getEmailTypeBadge = (type: string) => {
    const defaultConfig = { 
      label: type, 
      color: "bg-gray-500/20 text-gray-600 border-gray-500/30",
      description: "Tip email necunoscut"
    };
    const config = emailTypeLabels[type] || defaultConfig;
    return (
      <Badge className={config.color} title={config.description}>
        <Mail className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Calculate stats
  const stats = {
    total: logs.length,
    welcome_day_3: logs.filter(l => l.email_type === "welcome_day_3").length,
    welcome_day_7: logs.filter(l => l.email_type === "welcome_day_7").length,
    reengagement_30: logs.filter(l => l.email_type === "reengagement_30").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Trimise</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.welcome_day_3}</p>
            <p className="text-sm text-muted-foreground">Welcome Day 3</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.welcome_day_7}</p>
            <p className="text-sm text-muted-foreground">Welcome Day 7</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{stats.reengagement_30}</p>
            <p className="text-sm text-muted-foreground">Re-engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Log Emailuri Automate
              </CardTitle>
              <CardDescription>
                Istoricul emailurilor automate de retention trimise utilizatorilor
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Reîncarcă
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Caută după nume sau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Toate tipurile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate tipurile</SelectItem>
                <SelectItem value="welcome_day_3">Welcome Day 3</SelectItem>
                <SelectItem value="welcome_day_7">Welcome Day 7</SelectItem>
                <SelectItem value="reengagement_30">Re-engagement 30</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nu au fost găsite log-uri de email</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Utilizator
                      </div>
                    </TableHead>
                    <TableHead>Tip Email</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Data Trimiterii
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.profile?.full_name || "Utilizator șters"}</p>
                          <p className="text-xs text-muted-foreground">{log.profile?.email || log.user_id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getEmailTypeBadge(log.email_type)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(log.sent_at), "PPP 'la' HH:mm", { locale: ro })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Footer info */}
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Afișând {filteredLogs.length} din {logs.length} înregistrări
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
