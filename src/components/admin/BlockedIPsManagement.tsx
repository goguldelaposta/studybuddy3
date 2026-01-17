import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ShieldOff, Search, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

interface BlockedIP {
  id: string;
  ip_address: string;
  blocked_at: string;
  blocked_until: string;
  reason: string;
  attempt_count: number;
  is_active: boolean;
  unblocked_at: string | null;
  unblocked_by: string | null;
}

export const BlockedIPsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blockedIPs, isLoading, refetch } = useQuery({
    queryKey: ["blocked-ips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_ips")
        .select("*")
        .order("blocked_at", { ascending: false });

      if (error) throw error;
      return data as BlockedIP[];
    },
  });

  const unblockMutation = useMutation({
    mutationFn: async (ipId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("blocked_ips")
        .update({ 
          is_active: false, 
          unblocked_at: new Date().toISOString(),
          unblocked_by: user?.id 
        })
        .eq("id", ipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-ips"] });
      toast({
        title: "IP deblocat",
        description: "Adresa IP a fost deblocată cu succes.",
      });
    },
    onError: (error) => {
      console.error("Error unblocking IP:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut debloca adresa IP.",
        variant: "destructive",
      });
    },
  });

  const filteredIPs = blockedIPs?.filter((ip) =>
    ip.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ip.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeBlocks = blockedIPs?.filter(ip => ip.is_active && new Date(ip.blocked_until) > new Date()).length || 0;
  const expiredBlocks = blockedIPs?.filter(ip => !ip.is_active || new Date(ip.blocked_until) <= new Date()).length || 0;

  const isStillBlocked = (ip: BlockedIP) => {
    return ip.is_active && new Date(ip.blocked_until) > new Date();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IP-uri Blocate Activ</CardTitle>
            <Shield className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{activeBlocks}</div>
            <p className="text-xs text-muted-foreground">Blocări în vigoare</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocări Expirate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredBlocks}</div>
            <p className="text-xs text-muted-foreground">Au expirat sau deblocate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blocări</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedIPs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Din toate timpurile</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                IP-uri Blocate
              </CardTitle>
              <CardDescription>
                Gestionează adresele IP blocate automat după 10 tentative eșuate în 1 oră
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reîmprospătează
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută după IP sau motiv..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Se încarcă...
            </div>
          ) : filteredIPs && filteredIPs.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Adresă IP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Motiv</TableHead>
                    <TableHead>Încercări</TableHead>
                    <TableHead>Blocat la</TableHead>
                    <TableHead>Expiră</TableHead>
                    <TableHead>Acțiuni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIPs.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell className="font-mono font-medium">
                        {ip.ip_address}
                      </TableCell>
                      <TableCell>
                        {isStillBlocked(ip) ? (
                          <Badge variant="destructive">
                            <Shield className="h-3 w-3 mr-1" />
                            Blocat
                          </Badge>
                        ) : ip.unblocked_at ? (
                          <Badge variant="secondary">
                            <ShieldOff className="h-3 w-3 mr-1" />
                            Deblocat
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Expirat
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={ip.reason}>
                        {ip.reason}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ip.attempt_count}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(ip.blocked_at), "dd MMM yyyy, HH:mm", { locale: ro })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {isStillBlocked(ip) ? (
                          <span className="text-destructive">
                            {formatDistanceToNow(new Date(ip.blocked_until), { 
                              addSuffix: true, 
                              locale: ro 
                            })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {format(new Date(ip.blocked_until), "dd MMM yyyy, HH:mm", { locale: ro })}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isStillBlocked(ip) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unblockMutation.mutate(ip.id)}
                            disabled={unblockMutation.isPending}
                          >
                            <ShieldOff className="h-4 w-4 mr-1" />
                            Deblochează
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Nicio adresă IP găsită pentru căutarea ta." : "Nicio adresă IP blocată."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
