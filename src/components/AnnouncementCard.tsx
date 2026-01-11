import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Building2, Calendar, MessageCircle, Trash2, Eye, EyeOff } from "lucide-react";
import { Announcement, CATEGORY_LABELS, CATEGORY_ICONS } from "@/hooks/useAnnouncements";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { Link } from "react-router-dom";

interface AnnouncementCardProps {
  announcement: Announcement;
  isOwner?: boolean;
  onToggleStatus?: (id: string, isActive: boolean) => void;
  onDelete?: (id: string) => void;
  onContact?: (userId: string) => void;
}

export function AnnouncementCard({
  announcement,
  isOwner = false,
  onToggleStatus,
  onDelete,
  onContact,
}: AnnouncementCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price) return null;
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: currency || "RON",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className={`hover-lift overflow-hidden ${!announcement.is_active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{CATEGORY_ICONS[announcement.category]}</span>
            <Badge variant="secondary">{CATEGORY_LABELS[announcement.category]}</Badge>
          </div>
          {announcement.price && (
            <span className="font-bold text-lg text-primary">
              {formatPrice(announcement.price, announcement.currency)}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-lg mt-2 line-clamp-2">{announcement.title}</h3>
      </CardHeader>

      {announcement.image_url && (
        <div className="px-6">
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <img
              src={announcement.image_url}
              alt={announcement.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <CardContent className="pb-3 pt-3">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {announcement.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {announcement.university && (
            <Badge variant="outline" className="gap-1">
              <Building2 className="h-3 w-3" />
              {announcement.university.short_name}
            </Badge>
          )}
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {formatDistanceToNow(new Date(announcement.created_at), {
              addSuffix: true,
              locale: ro,
            })}
          </Badge>
        </div>

        {announcement.author && (
          <div className="flex items-center gap-3 pt-3 border-t">
            <Avatar className="h-8 w-8">
              <AvatarImage src={announcement.author.avatar_url || undefined} />
              <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                {getInitials(announcement.author.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {announcement.author.full_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {announcement.author.faculty}
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t gap-2">
        {isOwner ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onToggleStatus?.(announcement.id, !announcement.is_active)}
            >
              {announcement.is_active ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Dezactivează
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Activează
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete?.(announcement.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            className="flex-1 gradient-primary text-primary-foreground gap-2"
            onClick={() => onContact?.(announcement.user_id)}
          >
            <MessageCircle className="h-4 w-4" />
            Contactează
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
