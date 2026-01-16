import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Shield, Zap } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20">
          {/* Header */}
          <header className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-soft">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">Chatter</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button onClick={() => navigate("/signup")}>Get Started</Button>
            </div>
          </header>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Connect with your team in{" "}
              <span className="text-primary">real-time</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              A beautiful, fast, and secure messaging platform designed for teams
              who value simplicity and efficiency.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/signup")}>
                Start Chatting Free
              </Button>
              <Button variant="neumorphic" size="lg" onClick={() => navigate("/login")}>
                Sign In
              </Button>
            </div>
          </div>

          {/* Preview Card */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="neumorphic p-6 rounded-3xl">
              <div className="aspect-video bg-muted rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center mx-auto mb-4 shadow-soft">
                    <MessageCircle className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Chat Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything you need for seamless communication
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="neumorphic p-8 rounded-2xl text-center card-hover">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Real-time Messaging
              </h3>
              <p className="text-muted-foreground">
                Messages are delivered instantly with typing indicators and read
                receipts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="neumorphic p-8 rounded-2xl text-center card-hover">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Group Channels
              </h3>
              <p className="text-muted-foreground">
                Create unlimited groups for teams, projects, or any topic you
                want to discuss.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="neumorphic p-8 rounded-2xl text-center card-hover">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Secure & Private
              </h3>
              <p className="text-muted-foreground">
                Your conversations are encrypted and your privacy is our top
                priority.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="neumorphic p-12 rounded-3xl">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of teams already using Chatter to communicate
              better.
            </p>
            <Button size="lg" onClick={() => navigate("/signup")}>
              Create Free Account
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Chatter</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Chatter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
