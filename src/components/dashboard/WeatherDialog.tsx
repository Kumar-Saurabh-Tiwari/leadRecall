import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  Moon, 
  CloudSun,
  CloudMoon,
  CloudDrizzle,
  Zap,
  CloudFog,
  Droplets,
  Wind,
  Wifi,
  WifiOff,
  AlertCircle,
  Laptop,
  RefreshCw,
  History,
} from 'lucide-react';
import { Event } from '@/types';
import { weatherService, WeatherData } from '@/services/weatherService';
import { toast } from '@/hooks/use-toast';

interface WeatherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
}

export function WeatherDialog({ open, onOpenChange, event }: WeatherDialogProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (open && !weatherData) {
      fetchWeather();
    }
  }, [open]);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      const timestamp = new Date(event.date).getTime() / 1000;
      const data = await weatherService.getDetailedWeatherReport(event, timestamp);
      setWeatherData(data);
    } catch (err) {
      setError('Unable to fetch weather data');
      toast({
        title: 'Error',
        description: 'Failed to load weather information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconName: string, className: string = 'h-8 w-8') => {
    const icons: Record<string, any> = {
      sun: Sun,
      moon: Moon,
      cloud: Cloud,
      'cloud-sun': CloudSun,
      'cloud-moon': CloudMoon,
      'cloud-rain': CloudRain,
      'cloud-sun-rain': CloudDrizzle,
      'cloud-moon-rain': CloudDrizzle,
      'cloud-lightning': Zap,
      snowflake: CloudSnow,
      fog: CloudFog,
    };

    const IconComponent = icons[iconName] || Cloud;
    return <IconComponent className={className} />;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Europe/London',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      timeZone: 'Europe/London',
    });
    const timeStr = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Europe/London',
    });
    return `${dateStr} • ${timeStr}`;
  };

  const formatTemperature = (temp: number) => {
    return temp !== null && temp !== undefined ? `${Math.round(temp)}°C` : '--';
  };

  const formatCacheTime = (timestamp: number) => {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diff < 86400000) {
      const hrs = Math.floor(diff / 3600000);
      return `${hrs} ${hrs === 1 ? 'hour' : 'hours'} ago`;
    }
    
    return new Date(timestamp).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-500" />
            Weather Details
          </DialogTitle>
          <DialogDescription>
            Weather information for {event.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <RefreshCw className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading weather data...</p>
            </div>
          )}

          {/* Offline State */}
          {!loading && !isOnline && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <WifiOff className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">You're offline</h3>
              <p className="text-muted-foreground text-center">
                Weather information requires an internet connection
              </p>
              <Button onClick={fetchWeather} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try again
              </Button>
            </div>
          )}

          {/* Error State */}
          {!loading && error && isOnline && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={fetchWeather} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Virtual Event */}
          {!loading && !error && weatherData?.virtual && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Laptop className="h-16 w-16 text-primary" />
              <h3 className="text-xl font-semibold">Virtual Event</h3>
              <p className="text-muted-foreground text-center">{weatherData.summary}</p>
            </div>
          )}

          {/* Weather Data */}
          {!loading && !error && weatherData && !weatherData.virtual && (
            <div className="space-y-4">
              {/* Header */}
              <div className="text-center pb-2 border-b">
                <h3 className="text-lg font-semibold">Weather Detail</h3>
                <p className="text-sm text-muted-foreground">
                  Prompt weather update from live event
                </p>
              </div>

              {/* Current Weather Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0">
                    {weatherData.current.iconUrl ? (
                      <img
                        src={weatherData.current.iconUrl}
                        alt="Weather icon"
                        className="h-20 w-20"
                      />
                    ) : (
                      <div className="h-20 w-20 flex items-center justify-center text-blue-500">
                        {getWeatherIcon(weatherData.current.icon, 'h-16 w-16')}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Current Weather
                    </h4>
                    <div className="text-4xl font-bold">
                      {formatTemperature(weatherData.current.temperature)}
                    </div>
                    {weatherData.current.feelsLike && (
                      <div className="text-sm text-muted-foreground">
                        Feels like {formatTemperature(weatherData.current.feelsLike)}
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground capitalize mt-1">
                      {weatherData.current.description}
                    </div>
                  </div>
                </div>

                {/* Weather Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  {weatherData.current.humidity !== null && (
                    <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 rounded-md p-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-semibold text-sm">
                          {weatherData.current.humidity}%
                        </div>
                        <div className="text-xs text-muted-foreground">Humidity</div>
                      </div>
                    </div>
                  )}
                  {weatherData.current.windSpeed !== null && (
                    <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 rounded-md p-2">
                      <Wind className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-semibold text-sm">
                          {weatherData.current.windSpeed} m/s
                        </div>
                        <div className="text-xs text-muted-foreground">Wind</div>
                      </div>
                    </div>
                  )}
                  {weatherData.current.precipitation !== null && (
                    <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 rounded-md p-2">
                      <CloudRain className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-semibold text-sm">
                          {weatherData.current.precipitation} mm
                        </div>
                        <div className="text-xs text-muted-foreground">Rain</div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Summary */}
              {weatherData.summary && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-center">
                  {weatherData.summary}
                </div>
              )}

              {/* Event Timing */}
              {weatherData.isEventSoon !== undefined && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <History className="h-4 w-4" />
                  <span className={weatherData.isEventSoon ? 'text-orange-600 font-semibold' : ''}>
                    {weatherData.isEventSoon ? 'Event starting soon' : 'Event scheduled'}
                  </span>
                </div>
              )}

              {/* Recent Hours */}
              {weatherData.relevantHours && weatherData.relevantHours.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Recent Hours</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {weatherData.relevantHours.map((hour, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-muted rounded-lg p-3 text-center"
                      >
                        <div className="text-xs text-muted-foreground mb-2">
                          {formatDateTime(hour.time)}
                        </div>
                        <div className="flex justify-center mb-2">
                          {hour.iconUrl ? (
                            <img src={hour.iconUrl} alt="Weather" className="h-10 w-10" />
                          ) : (
                            getWeatherIcon(hour.icon, 'h-10 w-10')
                          )}
                        </div>
                        <div className="font-semibold">{formatTemperature(hour.temperature)}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {hour.description}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Forecast */}
              {weatherData.forecast && weatherData.forecast.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Forecast</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {weatherData.forecast.slice(0, 8).map((hour, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-muted rounded-lg p-3 text-center"
                      >
                        <div className="text-xs text-muted-foreground mb-2">
                          {formatDateTime(hour.time)}
                        </div>
                        <div className="flex justify-center mb-2">
                          {hour.iconUrl ? (
                            <img src={hour.iconUrl} alt="Weather" className="h-10 w-10" />
                          ) : (
                            getWeatherIcon(hour.icon, 'h-10 w-10')
                          )}
                        </div>
                        <div className="font-semibold">{formatTemperature(hour.temperature)}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {hour.description}
                        </div>
                        {hour.feelsLike && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Feels {formatTemperature(hour.feelsLike)}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!loading && !error && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <p className="text-xs text-muted-foreground flex-1">
              Weather data provided by OpenWeatherMap
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
