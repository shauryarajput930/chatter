import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Moon,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

export default function Settings() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Edit Profile",
          onClick: () => navigate("/profile"),
          showArrow: true,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Moon,
          label: "Dark Mode",
          action: (
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          ),
        },
        {
          icon: Bell,
          label: "Notifications",
          action: (
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          ),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: Shield,
          label: "Privacy Policy",
          onClick: () => {},
          showArrow: true,
        },
        {
          icon: HelpCircle,
          label: "Help & Support",
          onClick: () => {},
          showArrow: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* User Info Card */}
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center gap-4 p-4 bg-card rounded-2xl shadow-soft cursor-pointer hover:shadow-card transition-shadow"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            {profile?.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{profile?.name || "User"}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-2">
              {section.title}
            </h2>
            <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
              {section.items.map((item, index) => (
                <div
                  key={item.label}
                  onClick={item.onClick}
                  className={`flex items-center justify-between p-4 ${
                    item.onClick ? "cursor-pointer hover:bg-muted/50" : ""
                  } ${index > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                  {item.action || (item.showArrow && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full p-4 bg-destructive/10 text-destructive rounded-2xl font-medium hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </main>
    </div>
  );
}
