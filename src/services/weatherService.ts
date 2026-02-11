import { Event } from '@/types';

interface WeatherCurrent {
  temperature: number | null;
  feelsLike: number | null;
  description: string;
  icon: string;
  iconUrl?: string;
  humidity: number | null;
  windSpeed: number | null;
  precipitation: number;
  time?: string;
}

interface WeatherHour {
  time: string;
  temperature: number | null;
  feelsLike?: number | null;
  description: string;
  icon: string;
  iconUrl?: string;
  humidity?: number | null;
  windSpeed?: number | null;
  precipitation?: number;
}

export interface WeatherData {
  current: WeatherCurrent;
  forecast: WeatherHour[];
  relevantHours: WeatherHour[];
  summary: string;
  isEventSoon: boolean;
  virtual: boolean;
  timestamp: number;
  location?: { lat: number; lng: number };
  error?: boolean;
  message?: string;
}

class WeatherService {
  private readonly API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'c5700728a919f885a982683238c82f06';
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';

  /**
   * Check if event is virtual
   */
  private isVirtualEvent(event: Event | string): boolean {
    let location = '';

    if (typeof event === 'string') {
      location = event.toLowerCase();
    } else if (event && typeof event === 'object') {
      location = (event.location || '').toLowerCase();
    }

    return (
      location.includes('virtual') ||
      location.includes('online') ||
      location.includes('zoom') ||
      location.includes('teams') ||
      location.includes('google meet') ||
      location.includes('microsoft teams')
    );
  }

  /**
   * Get detailed weather report for an event
   */
  async getDetailedWeatherReport(event: Event, timestamp?: number): Promise<WeatherData> {
    try {
      // Check if event is virtual
      if (this.isVirtualEvent(event)) {
        return {
          current: {} as WeatherCurrent,
          forecast: [],
          relevantHours: [],
          summary: 'This is a virtual event with no physical location.',
          isEventSoon: false,
          virtual: true,
          timestamp: Date.now(),
        };
      }

      // Validate event has a location
      if (!event.location || event.location.trim() === '') {
        return {
          current: {} as WeatherCurrent,
          forecast: [],
          relevantHours: [],
          summary: 'No location information available for this event. Cannot fetch weather data.',
          isEventSoon: false,
          virtual: false,
          timestamp: Date.now(),
          error: true,
          message: 'No location provided',
        };
      }

      // Get coordinates from event location
      const coords = await this.getCoordinates(event.location);

      const eventTime = timestamp || Math.floor(new Date(event.date).getTime() / 1000);
      const currentTime = Math.floor(Date.now() / 1000);

      // Determine which weather data to fetch
      let weatherData: WeatherData;

      if (eventTime <= currentTime + 432000) {
        // Event is within 5 days - use forecast
        weatherData = await this.getEventWeatherData(coords.lat, coords.lng, eventTime, event.date);
      } else {
        // Event is further out - use climate averages
        weatherData = await this.getClimateAverage(coords.lat, coords.lng, new Date(event.date));
      }

      // Calculate if event is soon (within 24 hours)
      const hoursUntilEvent = (new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60);
      weatherData.isEventSoon = hoursUntilEvent >= 0 && hoursUntilEvent <= 24;
      weatherData.location = { lat: coords.lat, lng: coords.lng };
      weatherData.timestamp = Date.now();

      return weatherData;
    } catch (error) {
      console.error('Error in getDetailedWeatherReport:', error);
      return {
        current: {} as WeatherCurrent,
        forecast: [],
        relevantHours: [],
        summary: '',
        isEventSoon: false,
        virtual: false,
        timestamp: Date.now(),
        error: true,
        message: error instanceof Error ? error.message : 'Unable to fetch weather data',
      };
    }
  }

  /**
   * Extract coordinates from location string using custom geocoding API
   */
  private async getCoordinates(location: string): Promise<{ lat: number; lng: number }> {
    if (!location || location.trim() === '') {
      throw new Error('Location is required to fetch weather data');
    }

    try {
      // Use custom geocoding API
      const encodedLocation = encodeURIComponent(location.trim());
      const geoUrl = `https://mirecall.ctoninja.tech/api/v1/media/search-location?query=${encodedLocation}`;
      
      console.log('Geocoding address:', location);
      const geoResponse = await fetch(geoUrl);
      
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        console.log('Geocoding response:', geoData);
        
        if (geoData && geoData.results && Array.isArray(geoData.results) && geoData.results.length > 0) {
          const location = geoData.results[0].geometry?.location;
          if (location && location.lat && location.lng) {
            return {
              lat: location.lat,
              lng: location.lng,
            };
          }
        }
      }

      // Fallback to OpenWeatherMap's weather API if custom API fails
      const encodedLocation2 = encodeURIComponent(location.trim());
      const url = `${this.BASE_URL}/weather?q=${encodedLocation2}&units=metric&appid=${this.API_KEY}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.coord && data.coord.lat && data.coord.lon) {
          return {
            lat: data.coord.lat,
            lng: data.coord.lon,
          };
        }
      }

      throw new Error(`Unable to determine coordinates for location: ${location}`);
    } catch (error) {
      console.error('Error geocoding location:', error);
      throw error;
    }
  }

  /**
   * Get weather data for an event
   */
  private async getEventWeatherData(
    lat: number,
    lng: number,
    timestamp: number,
    eventDate: string | Date
  ): Promise<WeatherData> {
    try {
      const url = `${this.BASE_URL}/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${this.API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch forecast data');
      }

      const data = await response.json();
      const now = new Date();
      const eventDateTime = new Date(eventDate);

      // Find forecast closest to event time
      let closestForecast = data.list[0];
      let minDiff = Math.abs(new Date(data.list[0].dt * 1000).getTime() - eventDateTime.getTime());

      data.list.forEach((item: any) => {
        const itemTime = Math.abs(new Date(item.dt * 1000).getTime() - eventDateTime.getTime());
        if (itemTime < minDiff) {
          minDiff = itemTime;
          closestForecast = item;
        }
      });

      // Process current weather
      const currentWeather = data.list.find((item: any) => {
        return new Date(item.dt * 1000).getTime() <= now.getTime();
      }) || data.list[0];

      // Get upcoming forecast (next 8 items)
      const upcomingForecast = data.list
        .slice(0, 8)
        .map((item: any) => this.processWeatherDataToHour(item));

      // Generate summary
      const summary = this.generateDetailedSummary(closestForecast, eventDateTime);

      return {
        current: this.processWeatherDataToCurrent(currentWeather),
        forecast: upcomingForecast,
        relevantHours: [],
        summary,
        isEventSoon: false,
        virtual: false,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error fetching event weather data:', error);
      throw error;
    }
  }

  /**
   * Get climate averages for distant events
   */
  private async getClimateAverage(lat: number, lng: number, date: Date): Promise<WeatherData> {
    const month = date.getMonth();
    let icon = 'cloud';
    let description = 'Seasonal forecast';
    let temperature = 15;
    let summary = 'Weather forecast unavailable. Check back closer to the event date.';

    if (month >= 11 || month <= 1) {
      // Winter
      icon = 'snowflake';
      description = 'Winter forecast';
      temperature = 5;
      summary = 'Typical winter conditions with temperatures around 5°C expected.';
    } else if (month >= 2 && month <= 4) {
      // Spring
      icon = 'cloud-sun';
      description = 'Spring forecast';
      temperature = 15;
      summary = 'Spring weather with mild temperatures around 15°C expected.';
    } else if (month >= 5 && month <= 7) {
      // Summer
      icon = 'sun';
      description = 'Summer forecast';
      temperature = 25;
      summary = 'Warm summer conditions with temperatures around 25°C expected.';
    } else if (month >= 8 && month <= 10) {
      // Fall
      icon = 'cloud-rain';
      description = 'Fall forecast';
      temperature = 18;
      summary = 'Fall weather with temperatures around 18°C and possible rainfall.';
    }

    return {
      current: {
        temperature,
        feelsLike: temperature,
        description,
        icon,
        humidity: null,
        windSpeed: null,
        precipitation: 0,
      },
      forecast: [],
      relevantHours: [],
      summary,
      isEventSoon: false,
      virtual: false,
      timestamp: Date.now(),
    };
  }

  /**
   * Process OpenWeatherMap data to current weather format
   */
  private processWeatherDataToCurrent(data: any): WeatherCurrent {
    return {
      temperature: data.main?.temp ?? null,
      feelsLike: data.main?.feels_like ?? null,
      description: data.weather?.[0]?.description || 'No data',
      icon: this.mapOpenWeatherIcon(data.weather?.[0]?.icon || 'question'),
      iconUrl: data.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png` : undefined,
      humidity: data.main?.humidity ?? null,
      windSpeed: data.wind?.speed ?? null,
      precipitation: data.rain?.['1h'] ?? 0,
      time: new Date(data.dt * 1000).toISOString(),
    };
  }

  /**
   * Process OpenWeatherMap data to hour format
   */
  private processWeatherDataToHour(data: any): WeatherHour {
    return {
      time: new Date(data.dt * 1000).toISOString(),
      temperature: data.main?.temp ?? null,
      feelsLike: data.main?.feels_like ?? null,
      description: data.weather?.[0]?.description || 'No data',
      icon: this.mapOpenWeatherIcon(data.weather?.[0]?.icon || 'question'),
      iconUrl: data.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png` : undefined,
      humidity: data.main?.humidity ?? null,
      windSpeed: data.wind?.speed ?? null,
      precipitation: data.rain?.['1h'] ?? 0,
    };
  }

  /**
   * Map OpenWeather icon codes to custom icon names
   */
  private mapOpenWeatherIcon(icon: string): string {
    const iconMap: Record<string, string> = {
      '01d': 'sun',
      '01n': 'moon',
      '02d': 'cloud-sun',
      '02n': 'cloud-moon',
      '03d': 'cloud',
      '03n': 'cloud',
      '04d': 'cloud',
      '04n': 'cloud',
      '09d': 'cloud-rain',
      '09n': 'cloud-rain',
      '10d': 'cloud-sun-rain',
      '10n': 'cloud-moon-rain',
      '11d': 'cloud-lightning',
      '11n': 'cloud-lightning',
      '13d': 'snowflake',
      '13n': 'snowflake',
      '50d': 'fog',
      '50n': 'fog',
    };

    return iconMap[icon] || 'cloud';
  }

  /**
   * Generate detailed weather summary
   */
  private generateDetailedSummary(weatherData: any, eventDate: Date): string {
    const temp = Math.round(weatherData.main?.temp || 0);
    const feelsLike = Math.round(weatherData.main?.feels_like || temp);
    const description = weatherData.weather?.[0]?.description || 'No data';
    const windSpeed = weatherData.wind?.speed || 0;
    const humidity = weatherData.main?.humidity || 0;

    let summary = `${description.charAt(0).toUpperCase()}${description.slice(1)}. Temperature ${temp}°C, feels like ${feelsLike}°C. `;

    if (windSpeed > 5) {
      summary += `Windy with wind speed ${Math.round(windSpeed)} m/s. `;
    }

    if (humidity > 80) {
      summary += `High humidity at ${humidity}%. `;
    }

    summary += this.getWeatherAdvice({
      temperature: temp,
      precipitation: weatherData.rain?.['1h'] ?? 0,
    } as WeatherCurrent);

    return summary;
  }

  /**
   * Get weather advice based on conditions
   */
  private getWeatherAdvice(current: Partial<WeatherCurrent>): string {
    if ((current.precipitation || 0) > 0) {
      return "Don't forget your umbrella!";
    }
    if ((current.temperature || 0) < 10) {
      return 'Dress warmly, it\'s quite cold.';
    }
    if ((current.temperature || 0) > 25) {
      return 'Stay hydrated in the warm weather.';
    }
    return 'Have a great event!';
  }
}

export const weatherService = new WeatherService();
