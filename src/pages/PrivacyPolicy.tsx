import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Database, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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
            <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 prose prose-neutral dark:prose-invert max-w-none">
          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Our Commitment to Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              At Chatter, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our chat application.
            </p>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name and email address</li>
                  <li>Profile photo and bio</li>
                  <li>Username and display name</li>
                  <li>Online status and last seen</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Communication Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Messages you send and receive</li>
                  <li>Call logs and duration</li>
                  <li>File attachments and media</li>
                  <li>Typing indicators and read receipts</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Technical Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser and operating system</li>
                  <li>App usage statistics</li>
                  <li>Crash reports and performance data</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              How We Use Your Information
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain our chat service</li>
                <li>Process and deliver your messages</li>
                <li>Enable real-time communication features</li>
                <li>Personalize your user experience</li>
                <li>Ensure security and prevent fraud</li>
                <li>Improve our services and develop new features</li>
                <li>Communicate with you about service updates</li>
                <li>Respond to your inquiries and support requests</li>
              </ul>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Data Security and Encryption
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>End-to-End Encryption:</strong> Messages are encrypted end-to-end, meaning only you and the intended recipient can read them.</li>
                <li><strong>Secure Storage:</strong> Your data is stored in secure, encrypted databases.</li>
                <li><strong>Regular Security Audits:</strong> We conduct regular security assessments and updates.</li>
                <li><strong>Access Controls:</strong> Strict access controls limit who can view your information.</li>
                <li><strong>SSL/TLS Protection:</strong> All data transmissions are protected with SSL/TLS encryption.</li>
              </ul>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Information Sharing</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties, except:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our service</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Safety Purposes:</strong> To protect our rights, property, or safety, or that of our users</li>
              </ul>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Your Rights and Choices</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data</li>
                <li>Opt out of certain data collection</li>
                <li>Control your privacy settings</li>
                <li>Request information about how we use your data</li>
              </ul>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Cookies and Tracking</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                We use cookies and similar technologies to enhance your experience, analyze app usage, 
                and provide personalized content. You can control cookie settings through your browser preferences.
              </p>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Data Retention</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                We retain your information only as long as necessary to provide our services and comply 
                with legal obligations. You can request deletion of your account and data at any time.
              </p>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Children's Privacy</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If we become aware that we have 
                collected such information, we will delete it promptly.
              </p>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">International Data Transfers</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your data in accordance with 
                applicable data protection laws.
              </p>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Changes to This Policy</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>
          </div>

          <div className="neumorphic p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Contact Us
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
              <div className="mt-3 p-4 bg-accent/50 rounded-lg">
                <p className="font-mono text-sm">shauryarajput930@gmail.com</p>
              </div>
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
