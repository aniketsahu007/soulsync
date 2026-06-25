import React, { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Navigation, Phone, Heart, Search, X } from "lucide-react";
import { Button } from "./ui/button";

interface Place {
  name: string;
  vicinity: string;
  lat: number;
  lng: number;
}

interface OverpassElement {
  tags: {
    name?: string;
    "addr:full"?: string;
    "addr:street"?: string;
  };
  lat: number;
  lng: number;
}

export const CrisisMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Geocode function to get lat/lng from city name
  const geocodeCity = async (city: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (err) {
      console.error("Geocoding failed:", err);
      return null;
    }
  };

  const fetchSupportPlaces = async (lat: number, lng: number, mapInstance: any) => {
    const query = `[out:json];
      (
        node["amenity"="hospital"](around:20000, ${lat}, ${lng});
        node["amenity"="clinic"](around:20000, ${lat}, ${lng});
        node["healthcare"="doctor"](around:20000, ${lat}, ${lng});
        node["healthcare"="clinic"](around:20000, ${lat}, ${lng});
        node["healthcare"="hospital"](around:20000, ${lat}, ${lng});
        node["healthcare"="mental_health"](around:20000, ${lat}, ${lng});
        node["healthcare"="psychotherapist"](around:20000, ${lat}, ${lng});
        node["healthcare"="psychiatrist"](around:20000, ${lat}, ${lng});
      );
      out body;`;

    try {
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      const L = window.L;
      const results: Place[] = data.elements.slice(0, 10).map((el: OverpassElement) => ({
        name: el.tags.name || "Support Center",
        vicinity: el.tags["addr:full"] || el.tags["addr:street"] || "📍 Nearby",
        lat: el.lat,
        lng: el.lng,
      }));

      setPlaces(results);

      // Clear previous markers (except user marker)
      mapInstance.eachLayer((layer: any) => {
        if (layer instanceof L.Marker && !layer._popup?.getContent()?.includes("You are here")) {
          mapInstance.removeLayer(layer);
        }
      });

      results.forEach((place) => {
        L.marker([place.lat, place.lng]).addTo(mapInstance).bindPopup(`
          <b>${place.name}</b><br>${place.vicinity}
        `);
      });

      if (results.length === 0) {
        setError("No support centers found in this area.");
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("Failed to fetch places:", err);
      setError("Could not load nearby centers.");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const initMap = () => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    setMapInstance(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: [number, number] = [position.coords.latitude, position.coords.longitude];
          map.setView(userPos, 14);

          L.circleMarker(userPos, {
            radius: 10,
            fillColor: "#4285F4",
            fillOpacity: 0.9,
            color: "#ffffff",
            weight: 3,
          }).addTo(map).bindPopup("📍 You are here");

          fetchSupportPlaces(userPos[0], userPos[1], map);
        },
        () => {
          setError("📍 Location access denied. Showing default view.");
          setLoading(false);
          fetchSupportPlaces(20.5937, 78.9629, map);
        }
      );
    } else {
      setLoading(false);
      fetchSupportPlaces(20.5937, 78.9629, map);
    }
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => initMap();
    document.head.appendChild(script);

    return () => {
      // Cleanup
    };
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setLoading(true);
    setError(null);

    const location = await geocodeCity(searchQuery.trim());
    if (location && mapInstance) {
      mapInstance.setView([location.lat, location.lng], 14);
      fetchSupportPlaces(location.lat, location.lng, mapInstance);
    } else {
      setError("City not found. Please try again.");
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 🔍 Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for a city (e.g., Mumbai, Delhi, Bangalore)"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={isSearching}
          />
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="rounded-xl bg-primary text-white hover:bg-primary/90 px-4 h-11"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setError(null);
              // Reload with user location
              if (mapInstance && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const userPos = [position.coords.latitude, position.coords.longitude];
                    mapInstance.setView(userPos, 14);
                    fetchSupportPlaces(userPos[0], userPos[1], mapInstance);
                  },
                  () => {
                    fetchSupportPlaces(20.5937, 78.9629, mapInstance);
                  }
                );
              }
            }}
            className="rounded-xl h-11 px-3"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="h-64 md:h-72 w-full rounded-2xl bg-slate-100 shadow-inner overflow-hidden border-2 border-slate-50 relative"
      >
        {loading && (
          <div className="flex h-full w-full items-center justify-center bg-slate-50/50 backdrop-blur-sm absolute inset-0 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />
          </div>
        )}
        {error && !places.length && (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <MapPin className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500 font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* ✅ Helpline Section - Always Visible */}
      <div className="p-4 bg-gradient-to-r from-red-50 to-red-100/70 rounded-xl border border-red-200 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          <p className="font-bold text-red-700">Immediate Help Available</p>
        </div>
        <a
          href="tel:9152987821"
          className="text-2xl font-bold text-red-600 block hover:text-red-800 hover:scale-105 transition-all duration-200"
        >
          📞 9152987821
        </a>
        <p className="text-xs text-red-500 mt-1 font-medium">24/7 Mental Health Helpline</p>
        <p className="text-[10px] text-red-400">Free · Confidential · Professional Counseling</p>
      </div>

      {/* Places List */}
      {!loading && places.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            Nearby Support Centers ({places.length})
          </p>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            {places.map((place) => (
              <div
                key={`${place.name}-${place.lat}`}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-sm text-slate-800 truncate">{place.name}</p>
                  <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3 inline" />
                    {place.vicinity}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-8 w-8 p-0 text-primary hover:bg-primary/10 hover:scale-110 transition-transform"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
                    window.open(url, "_blank");
                  }}
                  title="Get Directions"
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback when no places found */}
      {!loading && places.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center p-4 text-center bg-slate-50 rounded-xl border border-slate-200">
          <MapPin className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm text-slate-500 font-medium">No nearby centers found.</p>
          <p className="text-xs text-slate-400">Please call the helpline above for immediate support.</p>
        </div>
      )}
    </div>
  );
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}
