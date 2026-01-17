import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, XCircle, RefreshCw, Search } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface SecurityLog {
  id: string;
  event_type: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  endpoint: string;
  request_details: Record<string, unknown> | null;
  created_at: string;
}

const eventTypeLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  unauthorized_access: { 
    label: "Acces Neautorizat", 
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: <XCircle className="w-4 h-4" />
  },
  failed_auth: { 
    label: "Autentificare Eșuată", 
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    icon: <AlertTriangle className="w-4 h-4" />
  },
  permission_denied: { 
    label: "Permisiune Refuzată", 
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: <Shield className="w-4 h-4" />
  },
};

export const SecurityLogs = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("security_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (filterType !== "all") {
        query = query.eq("event_type", filterType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data as SecurityLog[]) || []);
    } catch (error) {
      console.error("Error fetching security logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterType]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.endpoint.toLowerCase().includes(searchLower) ||
      log.ip_address?.toLowerCase().includes(searchLower) ||
      log.user_id?.toLowerCase().includes(searchLower) ||
      JSON.stringify(log.request_details).toLowerCase().includes(searchLower)
    );
  });

  const getEventBadge = (eventType: string) => {
    const config = eventTypeLabels[eventType] || { 
      label: eventType, 
      color: "bg-gray-100 text-gray-800",
      icon: <Shield className="w-4 h-4" />
    };
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const truncateUserAgent = (ua: string | null) => {
    if (!ua) return "N/A";
    return ua.length > 50 ? ua.substring(0, 50) + "..." : ua;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Jurnal Securitate
          </CardTitle>
          <Button onClick={fetchLogs} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Reîmprospătează
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Caută după IP, endpoint, utilizator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrează după tip" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate evenimentele</SelectItem>
              <SelectItem value="unauthorized_access">Acces Neautorizat</SelectItem>
              <SelectItem value="failed_auth">Autentificare Eșuată</SelectItem>
              <SelectItem value="permission_denied">Permisiune Refuzată</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nu există evenimente de securitate înregistrate.</p>
            <p className="text-sm">Aceasta este o veste bună! 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Ora</TableHead>
                  <TableHead>Tip Eveniment</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Detalii</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.created_at), "dd MMM yyyy, HH:mm:ss", { locale: ro })}
                    </TableCell>
                    <TableCell>{getEventBadge(log.event_type)}</TableCell>
                    <TableCell className="font-mono text-sm">{log.endpoint}</TableCell>
                    <TableCell className="font-mono text-sm">{log.ip_address || "N/A"}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {log.request_details && (
                          <details className="cursor-pointer">
                            <summary className="text-sm text-muted-foreground hover:text-foreground">
                              Vezi detalii
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.request_details, null, 2)}
                            </pre>
                          </details>
                        )}
                        <p className="text-xs text-muted-foreground mt-1" title={log.user_agent || ""}>
                          {truncateUserAgent(log.user_agent)}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          Afișând {filteredLogs.length} din {logs.length} înregistrări
        </div>
      </CardContent>
    </Card>
  );
};
