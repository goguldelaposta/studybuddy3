import { Home, Users, MessageCircle, User } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const MobileNav = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    // Hide Navbar when in a conversation (to prevent overlap with input)
    const isChatOpen = searchParams.get('with');
    if (isChatOpen) return null;

    const isActive = (path: string) => location.pathname === path;

    const navItemClass = (path: string) =>
        `flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90 ${isActive(path)
            ? 'text-primary'
            : 'text-muted-foreground hover:text-foreground'
        }`;

    if (!user) {
        return (
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
                <div className="grid grid-cols-3 h-full">
                    <Link to="/" className={navItemClass('/')}>
                        <Home className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Acasă</span>
                    </Link>
                    <Link to="/browse" className={navItemClass('/browse')}>
                        <Users className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Explorează</span>
                    </Link>
                    <Link to="/auth" className={navItemClass('/auth')}>
                        <User className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Cont</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t border-border z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-4 h-full">
                <Link to="/" className={navItemClass('/')}>
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Acasă</span>
                </Link>
                <Link to="/groups" className={navItemClass('/groups')}>
                    <Users className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Grupuri</span>
                </Link>
                <Link to="/messages" className={navItemClass('/messages')}>
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Mesaje</span>
                </Link>
                <Link to="/profile" className={navItemClass('/profile')}>
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Profil</span>
                </Link>
            </div>
        </div>
    );
};
