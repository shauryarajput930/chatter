import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Users, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 prose prose-neutral dark:prose-invert max-w-none">
          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Agreement to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Chatter ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you disagree with any part of these terms, then you may not access the Service.
            </p>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Use License</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Permission is granted to temporarily download one copy of Chatter for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You may not modify or copy the materials</li>
                <li>You may not use the materials for any commercial purpose</li>
                <li>You may not reverse engineer any aspect of the Service</li>
                <li>You may not use the Service to violate any laws</li>
              </ul>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Prohibited Activities
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Send spam, unsolicited messages, or bulk communications</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Share inappropriate, illegal, or harmful content</li>
                <li>Impersonate others or create false identities</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Use the Service for any fraudulent or unlawful purposes</li>
              </ul>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">User Content</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                You retain ownership of any content you post on Chatter. By posting content, you grant us 
                a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content 
                for the purpose of operating and improving the Service.
              </p>
              <p>
                You are responsible for the content you post. We reserve the right to remove any content 
                that violates these Terms.
              </p>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which also governs the 
              Service and explains how we collect, use, and protect your personal data.
            </p>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall Chatter, its directors, employees, partners, agents, suppliers, or affiliates 
              be liable for any indirect, incidental, special, consequential, or punitive damages, including 
              without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. If we make material changes, 
              we will notify you by email or by posting a notice on our Service prior to the effective date 
              of the changes.
            </p>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Contact Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-accent/50 rounded-lg">
              <p className="font-mono text-sm">shauryarajput930@gmail.com</p>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
