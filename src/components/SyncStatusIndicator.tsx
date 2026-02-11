import { useEffect, useState } from 'react';
import { syncService, SyncStatus } from '@/services/syncService';
import { WifiOff, Wifi, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SyncStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Listen to online/offline status
    const unsubscribeStatus = syncService.onStatusChange((online) => {
      setIsOnline(online);
      if (!online) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    });

    // Listen to sync status
    const unsubscribeSync = syncService.onSyncStatusChange((status, message) => {
      setSyncStatus(status);
      setSyncMessage(message || '');
      
      if (status === 'success' || status === 'error') {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeSync();
    };
  }, []);

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="w-4 h-4" />;
    }

    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Wifi className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-gray-500 bg-gray-100';
    
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-600 bg-blue-50';
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Sync Failed';
      default:
        return 'Online';
    }
  };

  return (
    <>
      {/* Status Badge - Always visible in bottom right */}
      <div className="fixed bottom-20 right-4 z-40">
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all duration-300',
            getStatusColor()
          )}
        >
          {getStatusIcon()}
          <span className="text-xs font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* Notification Toast - Shows temporarily */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
          <div
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl max-w-sm',
              !isOnline 
                ? 'bg-gray-900 text-white' 
                : syncStatus === 'error'
                ? 'bg-red-50 text-red-900 border border-red-200'
                : syncStatus === 'success'
                ? 'bg-green-50 text-green-900 border border-green-200'
                : 'bg-blue-50 text-blue-900 border border-blue-200'
            )}
          >
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {!isOnline ? 'You are offline' : syncMessage || getStatusText()}
              </p>
              {!isOnline && (
                <p className="text-xs mt-1 opacity-80">
                  Changes will sync when you're back online
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
