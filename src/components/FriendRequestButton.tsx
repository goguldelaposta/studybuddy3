import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Clock, UserMinus, Loader2 } from "lucide-react";
import { useFriendships } from "@/hooks/useFriendships";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FriendRequestButtonProps {
  targetUserId: string;
  variant?: "default" | "compact";
}

export const FriendRequestButton = ({ targetUserId, variant = "default" }: FriendRequestButtonProps) => {
  const { 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getFriendshipStatus,
    pendingRequests,
    sentRequests
  } = useFriendships();
  
  const [loading, setLoading] = useState(false);
  const status = getFriendshipStatus(targetUserId);

  const handleSendRequest = async () => {
    setLoading(true);
    await sendFriendRequest(targetUserId);
    setLoading(false);
  };

  const handleAccept = async () => {
    const request = pendingRequests.find(p => p.requester_id === targetUserId);
    if (request) {
      setLoading(true);
      await acceptFriendRequest(request.id);
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const request = pendingRequests.find(p => p.requester_id === targetUserId);
    if (request) {
      setLoading(true);
      await rejectFriendRequest(request.id);
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const request = sentRequests.find(s => s.addressee_id === targetUserId);
    if (request) {
      setLoading(true);
      await cancelFriendRequest(request.id);
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    await removeFriend(targetUserId);
    setLoading(false);
  };

  if (loading) {
    return (
      <Button variant="outline" size={variant === "compact" ? "sm" : "default"} disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  switch (status) {
    case 'accepted':
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size={variant === "compact" ? "sm" : "default"}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Prieteni
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleRemove} className="text-destructive">
              <UserMinus className="w-4 h-4 mr-2" />
              Elimină prieten
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

    case 'pending_sent':
      return (
        <Button 
          variant="outline" 
          size={variant === "compact" ? "sm" : "default"}
          onClick={handleCancel}
          className="text-muted-foreground"
        >
          <Clock className="w-4 h-4 mr-2" />
          Cerere trimisă
        </Button>
      );

    case 'pending_received':
      return (
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size={variant === "compact" ? "sm" : "default"}
            onClick={handleAccept}
            className="gradient-primary text-primary-foreground"
          >
            Acceptă
          </Button>
          <Button 
            variant="outline" 
            size={variant === "compact" ? "sm" : "default"}
            onClick={handleReject}
          >
            Respinge
          </Button>
        </div>
      );

    default:
      return (
        <Button 
          variant="default" 
          size={variant === "compact" ? "sm" : "default"}
          onClick={handleSendRequest}
          className="gradient-primary text-primary-foreground"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {variant === "compact" ? "" : "Adaugă prieten"}
        </Button>
      );
  }
};
