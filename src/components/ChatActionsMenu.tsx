import { useState } from "react";
import { MoreVertical, Ban, UserX, Trash2, MessageSquareX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChatActionsMenuProps {
  otherUserId: string;
  otherUserName: string;
  isBlocked: boolean;
  onBlock: () => void;
  onUnblock: () => void;
  onDeleteConversation: () => void;
  loading?: boolean;
}

export function ChatActionsMenu({
  otherUserId,
  otherUserName,
  isBlocked,
  onBlock,
  onUnblock,
  onDeleteConversation,
  loading,
}: ChatActionsMenuProps) {
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={loading}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {isBlocked ? (
            <DropdownMenuItem onClick={onUnblock} className="text-green-600">
              <UserX className="mr-2 h-4 w-4" />
              Deblochează
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem 
              onClick={() => setShowBlockDialog(true)}
              className="text-orange-600"
            >
              <Ban className="mr-2 h-4 w-4" />
              Blochează utilizator
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Șterge conversația
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Blochează utilizatorul?</AlertDialogTitle>
            <AlertDialogDescription>
              Dacă blochezi pe <strong>{otherUserName}</strong>, nu vei mai putea 
              primi sau trimite mesaje către această persoană. Poți debloca oricând.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onBlock();
                setShowBlockDialog(false);
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Ban className="mr-2 h-4 w-4" />
              Blochează
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Conversation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge conversația?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune va șterge toate mesajele din conversația cu{" "}
              <strong>{otherUserName}</strong>. Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteConversation();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
