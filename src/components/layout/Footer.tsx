import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-6 px-4 border-t border-border bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground text-sm">Chatter</span>
          </div>

          {/* Legal Links */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Chatter. All rights reserved.</span>
            <span>•</span>
            <Link to="/terms" className="hover:text-primary hover:underline transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-primary hover:underline transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
