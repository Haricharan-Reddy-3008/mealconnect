import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import socket from "../socket/socket";
import MapFoodModal from "../components/MapFoodModal";
import { getNearbyFoods } from "../api/food";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";
import { Search, MapPin, Compass, Navigation, RefreshCw } from "lucide-react";

// Default city coordinates fallback in case user coordinates are [0,0]
const CITY_COORDS = {
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
  bangalore: [12.9716, 77.5946],
  hyderabad: [17.385, 78.4867],
  ahmedabad: [23.0225, 72.5714],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  surat: [21.1702, 72.8311],
  pune: [18.5204, 73.8567],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  kanpur: [26.4499, 80.3319],
  nagpur: [21.1458, 79.0882],
  indore: [22.7196, 75.8577],
  thane: [19.2183, 72.9781],
  bhopal: [23.2599, 77.4126],
  visakhapatnam: [17.6868, 83.2185],
  patna: [25.5941, 85.1376],
  vadodara: [22.3072, 73.1812],
};

const MapView = () => {
  const { user } = useAuth();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userCoordsRef = useRef([17.385, 78.4867]); // [lat, lng]

  const [radius, setRadius] = useState(10);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodsList, setFoodsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  // Helper to create food custom marker icon
  const createFoodIcon = (food) => {
    return L.divIcon({
      className: "custom-food-marker-container",
      html: `
        <div class="relative flex items-center justify-center group cursor-pointer" style="transform: translate(-50%, -50%);">
          <div class="absolute -inset-2 rounded-full bg-orange-500/30 animate-ping"></div>
          <div class="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/50 border-2 border-white transform hover:scale-110 transition-transform">
            <span style="font-size: 16px;">🍲</span>
          </div>
          <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md border border-white/10 shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            ${food.food_name || "Food"}
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  // Helper to create user NGO marker icon
  const createUserIcon = () => {
    return L.divIcon({
      className: "custom-user-marker-container",
      html: `
        <div class="relative flex items-center justify-center" style="transform: translate(-50%, -50%);">
          <div class="absolute -inset-3 rounded-full bg-sky-500/30 animate-pulse"></div>
          <div class="w-6 h-6 rounded-full bg-sky-500 border-2 border-white shadow-lg shadow-sky-500/50 flex items-center justify-center text-white">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Determine user's initial center coordinates
  const resolveUserCoords = (profile) => {
    const rawCoords = profile?.location?.coordinates;
    if (rawCoords && Array.isArray(rawCoords) && rawCoords.length === 2) {
      const [lng, lat] = rawCoords;
      if (lng !== 0 || lat !== 0) {
        return [lat, lng];
      }
    }
    const cityKey = profile?.city?.toLowerCase()?.trim();
    if (cityKey && CITY_COORDS[cityKey]) {
      return CITY_COORDS[cityKey];
    }
    return [17.385, 78.4867]; // Hyderabad default
  };

  // Fetch foods and update markers
  const fetchFoods = async (searchRadius = radius) => {
    setLoading(true);
    try {
      const data = await getNearbyFoods(searchRadius);
      const foods = data?.foods || [];
      setFoodsList(foods);
      setNoResults(foods.length === 0);

      // Clear existing food markers
      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();
      }

      // Add marker for each food
      foods.forEach((food) => {
        if (food.status !== "available") return;
        let coords = null;
        if (food.location?.coordinates && (food.location.coordinates[0] !== 0 || food.location.coordinates[1] !== 0)) {
          const [lng, lat] = food.location.coordinates;
          coords = [lat, lng];
        } else if (food.city) {
          const cityKey = food.city.toLowerCase().trim();
          if (CITY_COORDS[cityKey]) {
            // slight random jitter so multiple items in same city don't stack completely
            const [baseLat, baseLng] = CITY_COORDS[cityKey];
            coords = [baseLat + (Math.random() - 0.5) * 0.03, baseLng + (Math.random() - 0.5) * 0.03];
          }
        }

        if (coords && markersGroupRef.current) {
          const marker = L.marker(coords, { icon: createFoodIcon(food) });
          marker.on("click", () => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo(coords, 14, { duration: 0.8 });
            }
            setSelectedFood(food);
          });
          markersGroupRef.current.addLayer(marker);
        }
      });
    } catch (err) {
      console.error("Fetch nearby foods error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update radius circle
  const updateRadiusCircle = (latLng, km) => {
    if (!mapInstanceRef.current) return;
    const meters = km * 1000;

    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng(latLng);
      radiusCircleRef.current.setRadius(meters);
    } else {
      radiusCircleRef.current = L.circle(latLng, {
        radius: meters,
        color: "#f97316",
        weight: 1.5,
        opacity: 0.7,
        fillColor: "#0ea5e9",
        fillOpacity: 0.1,
      }).addTo(mapInstanceRef.current);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    const initialCoords = resolveUserCoords(user);
    userCoordsRef.current = initialCoords;

    const map = L.map(mapContainerRef.current, {
      center: initialCoords,
      zoom: 12,
      zoomControl: false,
    });

    // Dark sleek CartoDB tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://openstreetmap.org">OSM</a>',
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // Zoom controls bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Food markers layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    // User marker
    const userMarker = L.marker(initialCoords, { icon: createUserIcon() })
      .bindPopup(`<div style="color:#0f172a;font-weight:600;font-size:13px;">📍 Your Location (${user?.name || "NGO"})</div>`)
      .addTo(map);
    userMarkerRef.current = userMarker;

    mapInstanceRef.current = map;

    // Radius circle
    updateRadiusCircle(initialCoords, radius);

    // Initial fetch
    fetchFoods(radius);

    // Load profile location asynchronously to sync coordinates if updated
    api.get("/users/me").then((res) => {
      if (res.data) {
        const accurateCoords = resolveUserCoords(res.data);
        userCoordsRef.current = accurateCoords;
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(accurateCoords);
        }
        updateRadiusCircle(accurateCoords, radius);
        map.flyTo(accurateCoords, 12, { duration: 1 });
      }
    }).catch(() => {});

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update radius when slider changes
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (userCoordsRef.current) {
      updateRadiusCircle(userCoordsRef.current, newRadius);
    }
  };

  // Re-center on user
  const handleRecenter = () => {
    if (mapInstanceRef.current && userCoordsRef.current) {
      mapInstanceRef.current.flyTo(userCoordsRef.current, 13, { duration: 0.8 });
    }
  };

  // Real-time socket listeners
  useEffect(() => {
    const onNewFood = () => fetchFoods(radius);
    const onPostUpdated = () => fetchFoods(radius);
    const onPostDeleted = () => fetchFoods(radius);
    const onFoodUnavailable = () => fetchFoods(radius);
    const onFoodExpired = () => fetchFoods(radius);

    socket.on("new_food_post", onNewFood);
    socket.on("post_updated", onPostUpdated);
    socket.on("post_deleted", onPostDeleted);
    socket.on("food_unavailable", onFoodUnavailable);
    socket.on("food_expired", onFoodExpired);

    return () => {
      socket.off("new_food_post", onNewFood);
      socket.off("post_updated", onPostUpdated);
      socket.off("post_deleted", onPostDeleted);
      socket.off("food_unavailable", onFoodUnavailable);
      socket.off("food_expired", onFoodExpired);
    };
  }, [radius]);

  return (
    <div className="relative w-full h-screen bg-[#0f172a] overflow-hidden">
      {/* Top Floating Control Bar */}
      <div className="absolute z-[1000] top-24 left-4 right-4 sm:left-auto sm:right-6 flex flex-wrap items-center gap-3 bg-[#1e293b]/90 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-white/10 text-white max-w-lg">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Compass size={18} className="text-orange-400" />
          <span>Radius:</span>
          <span className="text-orange-400 font-bold text-base">{radius} km</span>
        </div>

        <input
          type="range"
          min="1"
          max="50"
          value={radius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          className="flex-1 accent-orange-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchFoods(radius)}
            disabled={loading}
            title="Refresh Food Pins"
            className="flex items-center justify-center p-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition-all shadow-md shadow-orange-500/30 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleRecenter}
            title="Recenter Map"
            className="flex items-center justify-center p-2 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-sky-400 transition-all border border-white/10 cursor-pointer"
          >
            <Navigation size={16} />
          </button>
        </div>
      </div>

      {/* Floating Info Stats Badge */}
      <div className="absolute z-[1000] top-24 left-6 hidden md:flex items-center gap-3 bg-[#1e293b]/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white/10 text-white">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold">
          {foodsList.length} Donation{foodsList.length === 1 ? "" : "s"} Available Nearby
        </span>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* No Results Floating Notification */}
      {noResults && !loading && (
        <div className="absolute z-[1000] bottom-10 left-1/2 -translate-x-1/2 bg-[#1e293b]/95 backdrop-blur-md text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-white/10 text-sm text-center max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-1 text-amber-400 font-semibold">
            <MapPin size={16} /> No donations within {radius} km
          </div>
          <p className="text-slate-400 text-xs">
            Try expanding the search radius slider above to discover posts farther away.
          </p>
        </div>
      )}

      {/* Selected Food Detail Modal */}
      {selectedFood && (
        <MapFoodModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
          refresh={() => fetchFoods(radius)}
        />
      )}
    </div>
  );
};

export default MapView;
