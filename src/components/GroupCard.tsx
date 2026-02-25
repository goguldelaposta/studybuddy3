import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Users, Lock, Globe, BookOpen, Building2, Trash2 } from "lucide-react";
import { Group } from "@/hooks/useGroups";
import { Link } from "react-router-dom";
import { triggerHaptic } from "@/hooks/useHapticFeedback";

interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: string) => void;
  onLeave?: (groupId: string) => void;
  onDelete?: (groupId: string) => void;
  loading?: boolean;
}

export function GroupCard({ group, onJoin, onLeave, onDelete, loading }: GroupCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="hover-lift overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 rounded-xl">
            <AvatarImage src={group.avatar_url || undefined} />
            <AvatarFallback className="rounded-xl gradient-primary text-primary-foreground text-lg">
              {getInitials(group.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg truncate">{group.name}</h3>
              {group.is_public ? (
                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {group.memberCount} / {group.max_members || 20} membri
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {group.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {(group.course || group.subject) && (
            <Badge variant="secondary" className="gap-1">
              <BookOpen className="h-3 w-3" />
              {group.course?.name || group.subject?.name}
            </Badge>
          )}
          {group.university && (
            <Badge variant="outline" className="gap-1">
              <Building2 className="h-3 w-3" />
              {group.university.short_name}
            </Badge>
          )}
          {group.currentUserRole === "admin" && (
            <Badge className="gradient-primary text-primary-foreground">
              Admin
            </Badge>
          )}
          {group.currentUserRole === "moderator" && (
            <Badge className="bg-secondary text-secondary-foreground">
              Moderator
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link to={`/groups/${group.id}`}>Vezi Detalii</Link>
        </Button>

        {group.isCurrentUserMember ? (
          <>
            {group.currentUserRole !== "admin" && (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  triggerHaptic('medium');
                  onLeave?.(group.id);
                }}
                disabled={loading}
              >
                Părăsește
              </Button>
            )}
            {group.currentUserRole === "admin" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    disabled={loading}
                    onClick={() => triggerHaptic('light')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Șterge grupul?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Această acțiune este ireversibilă. Grupul "{group.name}" și toți membrii vor fi eliminați permanent.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anulează</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        triggerHaptic('heavy');
                        onDelete?.(group.id);
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Șterge
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        ) : (
          <Button
            className="gradient-primary text-primary-foreground"
            onClick={() => {
              triggerHaptic('success');
              onJoin?.(group.id);
            }}
            disabled={loading || (group.memberCount || 0) >= (group.max_members || 20)}
          >
            Alătură-te
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
