import { AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ConfigurationNeeded() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full neumorphic">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Configuration Needed</CardTitle>
          <CardDescription>
            This application requires Supabase environment variables to function properly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Required Environment Variables:</h4>
            <code className="block text-xs bg-background p-2 rounded border">
              VITE_SUPABASE_URL=https://your-project-id.supabase.co
            </code>
            <code className="block text-xs bg-background p-2 rounded border">
              VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
            </code>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>To get these values:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Create a Supabase project at supabase.com</li>
              <li>Go to Settings → API in your project</li>
              <li>Copy the Project URL and Public Anon Key</li>
              <li>Create a `.env` file in the frontend directory</li>
              <li>Add the variables with your actual values</li>
            </ol>
          </div>

          <Button 
            className="w-full" 
            onClick={() => window.open('https://supabase.com', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Go to Supabase
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
