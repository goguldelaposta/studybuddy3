import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";

interface BlockedIPPayload {
  id: string;
  ip_address: string;
  blocked_at: string;
  blocked_until: string;
  reason: string;
  attempt_count: number;
  is_active: boolean;
}

export const useBlockedIPsNotifications = () => {
  const { toast } = useToast();
  const { isAdmin, isModerator } = useUserRoles();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Only subscribe if user is admin or moderator
    if (!isAdmin && !isModerator) return;

    // Create audio element for notification sound
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVNJNnXI0LVxLB4KZbru8puJbVxYdZiiqoZfPi4wWo/O2LVwNBcFRJjR3bGDUTkxTKLV27d/SjEdFVOe3eiuiVs7MFuXz9mxcTAZCz+Q1d+xi1c5M1ST0dy2fkQrGxVIl9vorYZSOzlZmtPYsXQzGws+kNTgsYlSOjlYmdPbs30/JRoRQpDY5q+JUzo2VpbR27J4NRwMQ5LU4bCKUjk4V5fS27J3MxwJQpLU4rKKVTg4VpbS27N3NBsKQpHT4bGLVDc2VZXR27R6NRsKQZDT4bKLVDY1VJTR27R6NBsJP4/T4bKMVDY0U5PQ3LV7NRsKP47R4LKMVDUyUpHQ3LZ8NhoKP43P37OMVDQxUZDP3bd9NxoJPozO3rOMVjQvT4/O3bh+OBoJPYzN3bSNVzMuTo7N3LiAORoIPIvM3LSNWDItTI3M27mBOhsIPIrL27SOWTEsTIzL2rmCOxsIPInK2rSOWjAsS4vK2bmCPBsIO4jI2bSOWy8rSorJ2bmDPRsHOojI2LSPXi4qSYjI2LqEPhsHOYfH17SQXy4pSIjH17qFPxsGOIbG1rSQYC4oRofG1rqGQBsGN4XF1bSRYi4nRYXE1buHQRsGNoTE1LSSYy0mRIXE1byIQhsGNoPD07OTZCwlQ4PD1LyJRBsFNYLC0rOUZSwkQoLC07yKRRsFNIHB0bKVZisjQYHA0r2LRhsFNIDArLOWZysifYG/0r6MRxsFM4C/q7SYaCshfIC+0b6NSBsEM3++qrSZaioffn+9z7+OSRsEMn69qbOaaykfen690L+QShsEMn69qLOcbCkdeniuzsCRSxoEMX28p7SdbSkce3esz8CSTBoEMHu7prWfbyocfHeqzsCUThoEMHq6pbWhcCocfnepzcGVTxoEL3m5pLaicysdgHaozcGWURoEL3m4o7ajdSsdhHemzMKXUhkELni3oreneCwegHalzMKZVBkDLXe2oLmofCwggnajy8OaVhkDLXa1n7qpfywhhXahysOcWBkDLHW0n7uqgS0ihnafycSdWhkDLHSzn7ysgS0ih3aeysSfXBoDK3OynryugS0jiHadyMWhXhoDK3KxnL2wgy0jinabyMajYBoDKnGwm762hi4ji3aby8elYxoDKnGvm7+3iC4kjHaZyseoZRoDKXCumu+2iS8ljXWYysinZxoDKHCumdC4iy8mj3SWyMmqaRoCJ2+smd+4jDAokHOVx8mtbBoCJ26rmd+5jjEpkXKTxsquiHMBJ26pmN+6kDIqknGSxcuwiXUBJm2omOC7kzMrlHCRxMuzjHcBJmynl+G8lTQsl2+Qw8y1jnkBJWullOK9mDYtmW6PwM23kHoBJWukk+O/mjgtmm2NwM65k3wBJGqjkuPAnzounasPv8+6lH0BI2mikuTCoTswn6sOwM+8ln8BI2mhkeTDozwxoqoPv9C+mIEBImigkOXEpT4ypaoPvtHAmoMBImef");

    const channel = supabase
      .channel("blocked-ips-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "blocked_ips",
        },
        (payload) => {
          const blockedIP = payload.new as BlockedIPPayload;
          
          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(() => {
              // Ignore audio play errors (browser autoplay restrictions)
            });
          }

          // Show toast notification
          toast({
            title: "🚨 IP Blocat Automat",
            description: `Adresa ${blockedIP.ip_address} a fost blocată după ${blockedIP.attempt_count} tentative eșuate.`,
            variant: "destructive",
            duration: 10000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, isModerator, toast]);
};
