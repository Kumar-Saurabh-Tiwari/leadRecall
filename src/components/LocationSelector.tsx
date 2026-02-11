import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Declare google maps global variable
declare global {
  interface Window {
    google: typeof google;
  }
}

interface LocationSuggestion {
  name: string;
  formatted_address: string;
  place_id: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface AddressComponents {
  street?: string;
  city?: string;
  district?: string;
  postcode?: string;
  country?: string;
  venueName?: string;
}

interface LocationSelectorProps {
  value: string;
  onChange: (
    address: string,
    coordinates?: { lat: number; lng: number },
    addressComponents?: AddressComponents
  ) => void;
  onClear?: () => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  isSelected?: boolean;
}

export default function LocationSelector({
  value,
  onChange,
  onClear,
  placeholder = 'Enter event address',
  label = 'Address',
  required = true,
  isSelected = false,
}: LocationSelectorProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isAddressSelected, setIsAddressSelected] = useState(isSelected);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  // Initialize Google Places Autocomplete Service
  useEffect(() => {
    if (typeof google !== 'undefined' && (window as any).google) {
      const googleMaps = (window as any).google.maps;
      autocompleteServiceRef.current = new googleMaps.places.AutocompleteService();
      // Create a dummy map for PlacesService
      const dummyMap = document.createElement('div');
      placesServiceRef.current = new googleMaps.places.PlacesService(dummyMap);
    }
  }, []);

  // Handle location input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);
    onChange(query); // Update parent with partial input

    if (query.length > 2) {
      fetchLocationSuggestions(query);
    } else {
      setSuggestions([]);
    }
  };

  // Fetch location suggestions from Google Places
  const fetchLocationSuggestions = async (query: string) => {
    if (!autocompleteServiceRef.current) return;

    setIsLoading(true);
    try {
      const request = {
        input: query,
        // Removed 'types' restriction to allow addresses, venues, establishments, etc.
        // This allows searching for "Excel London", "Times Square", hotels, landmarks, etc.
      };

      const predictions = await new Promise<any[]>(
        (resolve, reject) => {
          autocompleteServiceRef.current!.getPlacePredictions(request, (predictions: any, status: any) => {
            if (status === 'OK' && predictions) {
              resolve(predictions);
            } else if (status === 'ZERO_RESULTS') {
              resolve([]);
            } else {
              reject(new Error(`Places API error: ${status}`));
            }
          });
        }
      );

      // Convert predictions to suggestions format
      const formattedSuggestions = predictions.map((pred) => ({
        name: pred.main_text,
        formatted_address: pred.description,
        place_id: pred.place_id,
      }));

      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get coordinates and address components for a selected place
  const getPlaceDetails = (
    placeId: string
  ): Promise<{
    coordinates: { lat: number; lng: number } | null;
    components: AddressComponents;
  }> => {
    return new Promise((resolve) => {
      if (!placesServiceRef.current) {
        resolve({ coordinates: null, components: {} });
        return;
      }

      placesServiceRef.current.getDetails(
        {
          placeId: placeId,
          fields: ['geometry', 'address_components', 'name', 'formatted_address'],
        },
        (place: any, status: any) => {
          const components: AddressComponents = {};
          let coordinates: { lat: number; lng: number } | null = null;

          if (status === 'OK' && place) {
            // Extract coordinates
            if (place.geometry?.location) {
              coordinates = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
            }

            // Extract address components
            if (place.address_components) {
              place.address_components.forEach((component: any) => {
                const types = component.types;

                if (types.includes('route')) {
                  components.street = component.long_name;
                } else if (types.includes('locality')) {
                  components.city = component.long_name;
                } else if (types.includes('administrative_area_level_2')) {
                  components.district = component.long_name;
                } else if (types.includes('postal_code')) {
                  components.postcode = component.long_name;
                } else if (types.includes('country')) {
                  components.country = component.long_name;
                }
              });
            }

            // Use place name as venue name if available
            if (place.name) {
              components.venueName = place.name;
            }
          }

          resolve({ coordinates, components });
        }
      );
    });
  };

  // Handle suggestion selection
  const selectSuggestion = async (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.formatted_address);
    setShowSuggestions(false);
    setIsAddressSelected(true);

    // Get coordinates and address components for the selected location
    const { coordinates, components } = await getPlaceDetails(suggestion.place_id);
    onChange(suggestion.formatted_address, coordinates ?? undefined, components);
    setSuggestions([]);
  };

  // Handle clear address
  const handleClear = () => {
    setInputValue('');
    setIsAddressSelected(false);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange('');
    onClear?.();
  };

  // Get current location
  const pinCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await reverseGeocodeLocation(latitude, longitude);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLoading(false);
      }
    );
  };

  // Reverse geocode coordinates to get address
  const reverseGeocodeLocation = async (lat: number, lng: number) => {
    if (typeof google === 'undefined') return;

    const geocoder = new (window.google as any).maps.Geocoder();
    try {
      const results = await new Promise<any[]>((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoder error: ${status}`));
          }
        });
      });

      if (results[0]) {
        const address = results[0].formatted_address;
        const components: AddressComponents = {};

        // Extract address components from geocoder results
        results[0].address_components.forEach((component: any) => {
          const types = component.types;

          if (types.includes('route')) {
            components.street = component.long_name;
          } else if (types.includes('locality')) {
            components.city = component.long_name;
          } else if (types.includes('administrative_area_level_2')) {
            components.district = component.long_name;
          } else if (types.includes('postal_code')) {
            components.postcode = component.long_name;
          } else if (types.includes('country')) {
            components.country = component.long_name;
          }
        });

        setInputValue(address);
        setIsAddressSelected(true);
        onChange(address, { lat, lng }, components);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  // Handle click outside to hide suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Label htmlFor="location" className="text-sm font-medium mb-2">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <div className="location-input-wrapper flex items-center gap-2 relative">
          <Input
            ref={inputRef}
            id="location"
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="bg-secondary/50 border-border/50 focus:ring-primary pr-20"
          />
          <div className="absolute right-3 flex items-center gap-2">
            {isAddressSelected && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 hover:bg-secondary rounded-md transition-colors"
                title="Clear address"
              >
                <X className="h-4 w-4 text-destructive hover:text-destructive/80" />
              </button>
            )}
            <button
              type="button"
              onClick={pinCurrentLocation}
              disabled={isLoading}
              className="p-2 hover:bg-secondary rounded-md transition-colors disabled:opacity-50"
              title="Get current location"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 text-dark animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 text-dark" />
              )}
            </button>
          </div>
        </div>

        {/* Location Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border/50 rounded-lg shadow-lg"
          >
            <div className="max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.place_id}-${index}`}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/30 last:border-b-0 flex items-start gap-3"
                >
                  <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {suggestion.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {suggestion.formatted_address}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results message */}
        {showSuggestions && inputValue.length > 2 && suggestions.length === 0 && !isLoading && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border/50 rounded-lg shadow-lg p-4">
            <p className="text-sm text-muted-foreground">No locations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
