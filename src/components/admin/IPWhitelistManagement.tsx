import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Plus, Trash2, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface WhitelistedIP {
  id: string;
  ip_address: string;
  description: string | null;
  added_by: string | null;
  created_at: string;
}

export const IPWhitelistManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newIP, setNewIP] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: whitelistedIPs, isLoading, refetch } = useQuery({
    queryKey: ["ip-whitelist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ip_whitelist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WhitelistedIP[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async ({ ip, description }: { ip: string; description: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("ip_whitelist")
        .insert({ 
          ip_address: ip.trim(),
          description: description.trim() || null,
          added_by: user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-whitelist"] });
      toast({
        title: "IP adăugat în whitelist",
        description: "Adresa IP a fost adăugată cu succes.",
      });
      setIsAddDialogOpen(false);
      setNewIP("");
      setNewDescription("");
    },
    onError: (error: any) => {
      console.error("Error adding IP to whitelist:", error);
      toast({
        title: "Eroare",
        description: error.message?.includes("duplicate") 
          ? "Această adresă IP există deja în whitelist."
          : "Nu s-a putut adăuga adresa IP.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ipId: string) => {
      const { error } = await supabase
        .from("ip_whitelist")
        .delete()
        .eq("id", ipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-whitelist"] });
      toast({
        title: "IP eliminat",
        description: "Adresa IP a fost eliminată din whitelist.",
      });
    },
    onError: (error) => {
      console.error("Error removing IP from whitelist:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut elimina adresa IP.",
        variant: "destructive",
      });
    },
  });

  const filteredIPs = whitelistedIPs?.filter((ip) =>
    ip.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ip.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateIP = (ip: string): boolean => {
    // Basic IP validation (IPv4 and IPv6)
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    const ipv4CIDRRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ipv4CIDRRegex.test(ip);
  };

  const handleAddIP = () => {
    if (!newIP.trim()) {
      toast({
        title: "Eroare",
        description: "Introdu o adresă IP validă.",
        variant: "destructive",
      });
      return;
    }

    if (!validateIP(newIP.trim())) {
      toast({
        title: "Eroare",
        description: "Formatul adresei IP nu este valid.",
        variant: "destructive",
      });
      return;
    }

    addMutation.mutate({ ip: newIP, description: newDescription });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              IP-uri Whitelist
            </CardTitle>
            <CardDescription>
              Adresele IP din whitelist nu vor fi blocate automat
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reîmprospătează
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adaugă IP
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adaugă IP în Whitelist</DialogTitle>
                  <DialogDescription>
                    Adresele IP din whitelist sunt excluse de la blocarea automată.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip-address">Adresă IP *</Label>
                    <Input
                      id="ip-address"
                      placeholder="192.168.1.1 sau 10.0.0.0/24"
                      value={newIP}
                      onChange={(e) => setNewIP(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descriere (opțional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Ex: Server de backup, IP-ul biroului..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Anulează
                  </Button>
                  <Button 
                    onClick={handleAddIP}
                    disabled={addMutation.isPending}
                  >
                    {addMutation.isPending ? "Se adaugă..." : "Adaugă"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută după IP sau descriere..."
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
                  <TableHead>Descriere</TableHead>
                  <TableHead>Data adăugării</TableHead>
                  <TableHead className="w-[80px]">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIPs.map((ip) => (
                  <TableRow key={ip.id}>
                    <TableCell className="font-mono font-medium">
                      {ip.ip_address}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {ip.description || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(ip.created_at), "dd MMM yyyy, HH:mm", { locale: ro })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate(ip.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "Nicio adresă IP găsită pentru căutarea ta." : "Nicio adresă IP în whitelist."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
