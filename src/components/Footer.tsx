import { Link } from "react-router-dom";
import { Mail, FileText, Shield } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t bg-background" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      <div className="container py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg">StudyBuddy</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <Link 
              to="/contact" 
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors py-2 min-h-[44px]"
            >
              <Mail className="h-4 w-4" />
              Contact
            </Link>
            <Link 
              to="/terms" 
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors py-2 min-h-[44px]"
            >
              <FileText className="h-4 w-4" />
              Termeni
            </Link>
            <Link 
              to="/privacy-policy" 
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors py-2 min-h-[44px]"
            >
              <Shield className="h-4 w-4" />
              Confidențialitate
            </Link>
          </nav>
          
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} StudyBuddy
          </p>
        </div>
      </div>
    </footer>
  );
};
