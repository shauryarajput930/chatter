import { useState, useEffect } from "react";
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
  Loader2,
  Lock,
  Phone,
  Key,
  Smartphone,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";
import { use2FAStatus } from "@/hooks/use2FAStatus";
import { NotificationSettings } from "@/components/chat/NotificationSettings";

export default function Settings() {
  const navigate = useNavigate();
  const { signOut, profile, user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { is2FAEnabled, loading: twoFALoading } = use2FAStatus();
  const [notifications, setNotifications] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
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
        {
          icon: Phone,
          label: "Call History",
          onClick: () => navigate("/call-history"),
          showArrow: true,
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          icon: Lock,
          label: "Change Password",
          onClick: () => navigate("/change-password"),
          showArrow: true,
        },
        {
          icon: is2FAEnabled ? ShieldCheck : Key,
          label: "Two-Factor Authentication",
          onClick: () => navigate(is2FAEnabled ? "/2fa-disable" : "/2fa-setup"),
          showArrow: true,
          subtitle: twoFALoading ? "Loading..." : is2FAEnabled ? "Enabled" : "Not enabled",
          statusColor: is2FAEnabled ? "text-green-500" : undefined,
        },
        {
          icon: Smartphone,
          label: "Active Sessions",
          onClick: () => {},
          showArrow: true,
          subtitle: "Coming soon",
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

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

        {/* Preferences Section with Notifications */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground px-2">
            Notifications
          </h2>
          <div className="bg-card rounded-2xl shadow-soft overflow-hidden p-4">
            <NotificationSettings />
          </div>
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
                    <item.icon className={`w-5 h-5 ${"statusColor" in item && item.statusColor ? item.statusColor : "text-muted-foreground"}`} />
                    <div>
                      <span>{item.label}</span>
                      {"subtitle" in item && item.subtitle && (
                        <p className={`text-xs ${"statusColor" in item && item.statusColor ? item.statusColor : "text-muted-foreground"}`}>{item.subtitle}</p>
                      )}
                    </div>
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
          disabled={loggingOut}
          className="flex items-center justify-center gap-2 w-full p-4 bg-destructive/10 text-destructive rounded-2xl font-medium hover:bg-destructive/20 transition-colors disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          {loggingOut ? "Logging out..." : "Log Out"}
        </button>
      </main>
    </div>
  );
}
