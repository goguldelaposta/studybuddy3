import { useNavigate } from "react-router-dom";
import { useFriendships } from "@/hooks/useFriendships";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserCheck, X, Users, Loader2 } from "lucide-react";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface PendingFriendRequestsProps {
  showTitle?: boolean;
  maxItems?: number;
  compact?: boolean;
}

export const PendingFriendRequests = ({
  showTitle = true,
  maxItems,
  compact = false,
}: PendingFriendRequestsProps) => {
  const navigate = useNavigate();
  const {
    pendingRequests,
    loading,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useFriendships();

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (pendingRequests.length === 0) {
    return null;
  }

  const displayedRequests = maxItems
    ? pendingRequests.slice(0, maxItems)
    : pendingRequests;
  const hasMore = maxItems && pendingRequests.length > maxItems;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-display">
              <UserPlus className="w-5 h-5 text-primary" />
              Cereri de Prietenie
              <Badge variant="destructive" className="ml-2">
                {pendingRequests.length}
              </Badge>
            </div>
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/friends")}
                className="text-primary hover:text-primary"
              >
                Vezi toate
              </Button>
            )}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "pt-0" : "pt-4"}>
        <div className={compact ? "space-y-2" : "space-y-3"}>
          {displayedRequests.map((request) => (
            <div
              key={request.id}
              className={`flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors ${
                compact ? "p-2" : "p-3"
              }`}
            >
              <Avatar
                className={`cursor-pointer ${compact ? "h-10 w-10" : "h-12 w-12"}`}
                onClick={() => navigate(`/user/${request.profile.user_id}`)}
              >
                <AvatarImage src={request.profile.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm">
                  {getInitials(request.profile.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h4
                  className={`font-semibold truncate cursor-pointer hover:text-primary transition-colors ${
                    compact ? "text-sm" : ""
                  }`}
                  onClick={() => navigate(`/user/${request.profile.user_id}`)}
                >
                  {request.profile.full_name}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {request.profile.faculty || "Student"}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  className="gradient-primary text-primary-foreground h-8 px-3"
                  onClick={() => acceptFriendRequest(request.id)}
                >
                  <UserCheck className="w-4 h-4" />
                  {!compact && <span className="ml-1 hidden sm:inline">Acceptă</span>}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-destructive hover:border-destructive"
                  onClick={() => rejectFriendRequest(request.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={() => navigate("/friends")}
          >
            <Users className="w-4 h-4 mr-2" />
            Vezi toate cererile ({pendingRequests.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
