import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { cn } from '@/lib/utils';

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (error || isSubscribed) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, isSubscribed]);

  if (!isSupported) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Push notifications are not supported on this device
        </AlertDescription>
      </Alert>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-green-500" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              {isSubscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
            </p>
            <p className="text-sm text-muted-foreground">
              {permission === 'granted'
                ? 'You will receive notifications for new messages'
                : permission === 'denied'
                ? 'You have blocked notifications'
                : 'You have not granted notification permission'}
            </p>
          </div>
        </div>

        <Button
          onClick={handleToggle}
          disabled={isLoading || permission === 'denied'}
          variant={isSubscribed ? 'destructive' : 'default'}
          className="rounded-lg gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isSubscribed ? 'Disabling...' : 'Enabling...'}
            </>
          ) : isSubscribed ? (
            <>
              <BellOff className="w-4 h-4" />
              Disable
            </>
          ) : (
            <>
              <Bell className="w-4 h-4" />
              Enable
            </>
          )}
        </Button>
      </div>

      {error && showMessage && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {permission === 'denied' && (
        <Alert className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Notifications are blocked. Please enable them in your browser settings to receive messages when the app is closed.
          </AlertDescription>
        </Alert>
      )}

      {!isSubscribed && permission !== 'denied' && (
        <Alert className="bg-accent/10 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Enable notifications to stay updated when new messages arrive while the app is in the background.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
        <p>• Notifications require permission from your browser</p>
        <p>• Service Worker will run in the background</p>
        <p>• Works when the app is closed or in background</p>
        <p>• Your device must be connected to internet</p>
      </div>
    </div>
  );
}
