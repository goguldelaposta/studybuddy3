import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { Ban, UserX, Loader2 } from "lucide-react";

export const BlockedUsersManagement = () => {
  const { blockedUsers, loading, unblockUser } = useBlockedUsers();
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  const handleUnblock = async (userId: string) => {
    setUnblockingId(userId);
    await unblockUser(userId);
    setUnblockingId(null);
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Ban className="w-5 h-5 text-destructive" />
          Utilizatori Blocați
        </CardTitle>
        <CardDescription>
          Gestionează utilizatorii pe care i-ai blocat. Aceștia nu îți pot trimite mesaje.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserX className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nu ai blocat niciun utilizator</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {blockedUsers.map((blocked) => (
                <div
                  key={blocked.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={blocked.profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {blocked.profile?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {blocked.profile?.full_name || "Utilizator necunoscut"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {blocked.profile?.faculty || "Facultate necunoscută"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblock(blocked.blocked_id)}
                    disabled={unblockingId === blocked.blocked_id}
                    className="text-primary hover:text-primary"
                  >
                    {unblockingId === blocked.blocked_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Deblochează"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
