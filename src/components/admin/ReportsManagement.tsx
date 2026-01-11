import { useState
} from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useModeration, Report } from "@/hooks/useModeration";
import { 
  Flag, Search, Loader2, Eye, CheckCircle, XCircle, 
  Clock, AlertTriangle, MessageSquare, Users, Megaphone, User
} from "lucide-react";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
          <Clock className="w-3 h-3 mr-1" />
          În așteptare
        </Badge>
      );
    case "reviewed":
      return (
        <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
          <Eye className="w-3 h-3 mr-1" />
          Revizuit
        </Badge>
      );
    case "resolved":
      return (
        <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Rezolvat
        </Badge>
      );
    case "dismissed":
      return (
        <Badge className="bg-muted text-muted-foreground">
          <XCircle className="w-3 h-3 mr-1" />
          Respins
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getContentTypeIcon = (type: string) => {
  switch (type) {
    case "user":
      return <User className="w-4 h-4" />;
    case "announcement":
      return <Megaphone className="w-4 h-4" />;
    case "group":
      return <Users className="w-4 h-4" />;
    case "message":
      return <MessageSquare className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};

const getContentTypeLabel = (type: string) => {
  switch (type) {
    case "user":
      return "Utilizator";
    case "announcement":
      return "Anunț";
    case "group":
      return "Grup";
    case "message":
      return "Mesaj";
    default:
      return type;
  }
};

export const ReportsManagement = () => {
  const { reports, loading, updateReportStatus } = useModeration();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedReport) return;

    setActionLoading(true);
    const result = await updateReportStatus(selectedReport.id, status, resolutionNotes);
    
    if (result.success) {
      toast({
        title: "Raport actualizat",
        description: `Raportul a fost marcat ca "${status}".`,
      });
      setSelectedReport(null);
      setResolutionNotes("");
    } else {
      toast({
        title: "Eroare",
        description: result.error || "Nu s-a putut actualiza raportul.",
        variant: "destructive",
      });
    }
    setActionLoading(false);
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reporter?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reported_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5" />
          Rapoarte
          {pendingCount > 0 && (
            <Badge className="ml-2 bg-destructive text-destructive-foreground">
              {pendingCount} în așteptare
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Caută rapoarte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrează după status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate</SelectItem>
              <SelectItem value="pending">În așteptare</SelectItem>
              <SelectItem value="reviewed">Revizuit</SelectItem>
              <SelectItem value="resolved">Rezolvat</SelectItem>
              <SelectItem value="dismissed">Respins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nu există rapoarte</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tip</TableHead>
                  <TableHead>Motiv</TableHead>
                  <TableHead>Raportat de</TableHead>
                  <TableHead>Utilizator raportat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getContentTypeIcon(report.reported_content_type)}
                        <span className="text-sm">
                          {getContentTypeLabel(report.reported_content_type)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {report.reason}
                    </TableCell>
                    <TableCell>
                      {report.reporter?.full_name || "Necunoscut"}
                    </TableCell>
                    <TableCell>
                      {report.reported_user?.full_name || "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString("ro-RO")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Detalii Raport</DialogTitle>
                            <DialogDescription>
                              Revizuiește și ia o decizie pentru acest raport
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Tip conținut</p>
                                <p className="font-medium">
                                  {getContentTypeLabel(report.reported_content_type)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Status</p>
                                {getStatusBadge(report.status)}
                              </div>
                              <div>
                                <p className="text-muted-foreground">Raportat de</p>
                                <p className="font-medium">
                                  {report.reporter?.full_name}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Utilizator raportat</p>
                                <p className="font-medium">
                                  {report.reported_user?.full_name || "-"}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-sm">Motiv</p>
                              <p className="font-medium">{report.reason}</p>
                            </div>
                            {report.description && (
                              <div>
                                <p className="text-muted-foreground text-sm">Descriere</p>
                                <p className="text-sm">{report.description}</p>
                              </div>
                            )}
                            {report.status === "pending" && (
                              <div>
                                <p className="text-muted-foreground text-sm mb-2">
                                  Note rezoluție (opțional)
                                </p>
                                <Textarea
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  placeholder="Adaugă note despre decizia ta..."
                                />
                              </div>
                            )}
                          </div>
                          {report.status === "pending" && (
                            <DialogFooter className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => handleUpdateStatus("dismissed")}
                                disabled={actionLoading}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Respinge
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleUpdateStatus("reviewed")}
                                disabled={actionLoading}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Marchează revizuit
                              </Button>
                              <Button
                                onClick={() => handleUpdateStatus("resolved")}
                                disabled={actionLoading}
                              >
                                {actionLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Rezolvă
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
