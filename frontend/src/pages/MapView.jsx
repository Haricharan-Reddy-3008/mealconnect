import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";
import socket from "../socket/socket";
import MapFoodModal from "../components/MapFoodModal";
import { getNearbyFoods } from "../api/food";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";
import { Search } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapView = () => {
  const { user } = useAuth();
  const mapRef = useRef(null);
  const map = useRef(null);
  const markersRef = useRef(new Map());
  const ngoMarkerRef = useRef(null);
  const ngoLocationRef = useRef(null);

  const [radius, setRadius] = useState(5);
  const [selectedFood, setSelectedFood] = useState(null);
  const [noResults, setNoResults] = useState(false);

  const RADIUS_SOURCE_ID = "ngo-radius";

  const drawRadiusCircle = (lng, lat, km) => {
    if (!map.current) return;

    const center = turf.point([lng, lat]);
    const circle = turf.circle(center, km, { units: "kilometers" });

    if (map.current.getLayer(RADIUS_SOURCE_ID)) {
      map.current.removeLayer(RADIUS_SOURCE_ID);
    }
    if (map.current.getSource(RADIUS_SOURCE_ID)) {
      map.current.removeSource(RADIUS_SOURCE_ID);
    }

    map.current.addSource(RADIUS_SOURCE_ID, {
      type: "geojson",
      data: circle,
    });

    map.current.addLayer({
      id: RADIUS_SOURCE_ID,
      type: "fill",
      source: RADIUS_SOURCE_ID,
      paint: {
        "fill-color": "#0ea5e9",
        "fill-opacity": 0.1,
      },
    });
  };

  const getZoomFromRadius = (km) => {
    if (km <= 2) return 15;
    if (km <= 5) return 14;
    if (km <= 10) return 13;
    if (km <= 20) return 12;
    return 11;
  };

  const createMarkerEl = () => {
    const el = document.createElement("div");
    el.className = "pulse-marker cursor-pointer";
    return el;
  };

  const removeMarker = (foodId) => {
    const marker = markersRef.current.get(foodId);
    if (!marker) return;
    marker.remove();
    markersRef.current.delete(foodId);
  };

  const addOrUpdateMarker = (food) => {
    if (food.status !== "available") {
      removeMarker(food._id);
      return;
    }

    if (markersRef.current.has(food._id)) {
      markersRef.current.get(food._id).setLngLat(food.location.coordinates);
      return;
    }

    const el = createMarkerEl();
    el.onclick = () => {
      map.current.flyTo({
        center: food.location.coordinates,
        zoom: Math.max(14, getZoomFromRadius(radius)),
        speed: 0.7,
        curve: 1.6,
        easing: (t) => t,
        essential: true,
      });
      setSelectedFood(food);
    };

    const marker = new mapboxgl.Marker(el)
      .setLngLat(food.location.coordinates)
      .addTo(map.current);

    markersRef.current.set(food._id, marker);
  };

  const fetchFoods = async () => {
    try {
      const data = await getNearbyFoods(radius);
      if (!data.success) return;

      setNoResults(data.foods.length === 0);

      const serverIds = new Set(data.foods.map((f) => f._id));
      data.foods.forEach(addOrUpdateMarker);

      markersRef.current.forEach((_, id) => {
        if (!serverIds.has(id)) removeMarker(id);
      });

      if (data.foods.length > 0 && ngoLocationRef.current) {
        const { lng, lat } = ngoLocationRef.current;

        map.current.flyTo({
          center: [lng, lat],
          zoom: getZoomFromRadius(radius),
          speed: 0.6,
          curve: 1.4,
          easing: (t) => t,
          essential: true,
        });
      }
    } catch (err) {
      console.error("Fetch nearby foods error:", err);
    }
  };

  const initializeMap = async () => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [88.4345, 22.5726],
      zoom: 12,
    });

    map.current.on("load", async () => {
      try {
        const res = await api.get("/users/me");
        const [lng, lat] = res.data.location.coordinates;
        ngoLocationRef.current = { lng, lat };

        map.current.flyTo({
          center: [lng, lat],
          zoom: getZoomFromRadius(radius),
          speed: 0.8,
          curve: 1.5,
          easing: (t) => t,
          essential: true,
        });

        drawRadiusCircle(lng, lat, radius);
        await fetchFoods();

        const el = document.createElement("div");
        el.className =
          "w-4 h-4 rounded-full bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.3)] border-2 border-white";

        ngoMarkerRef.current = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map.current);
      } catch {
        console.error("Failed to load user location for map");
      }
    });
  };

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (!ngoLocationRef.current) return;
    const { lng, lat } = ngoLocationRef.current;
    drawRadiusCircle(lng, lat, radius);
    const refreshFoodMarkers = async () => {
      await fetchFoods();
    };
    void refreshFoodMarkers();
  }, [radius]);

  useEffect(() => {
    const onNewFood = (food) => {
      if (!user?.city || !food.city) return;
      if (food.city.toLowerCase() === user.city.toLowerCase()) {
        addOrUpdateMarker(food);
      }
    };
    const onPostUpdated = (food) => {
      if (!user?.city || !food.city) return;
      if (food.city.toLowerCase() === user.city.toLowerCase()) {
        addOrUpdateMarker(food);
      } else {
        removeMarker(food._id);
      }
    };
    const onPostDeleted = ({ foodId }) => removeMarker(foodId);
    const onFoodUnavailable = ({ foodId }) => removeMarker(foodId);
    const onFoodExpired = ({ ids }) => {
      if (!ids?.length) return;
      ids.forEach(removeMarker);
    };

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
  }, [user?.city]);

  return (
    <>
      <div className="absolute z-10 top-24 right-5 mc-glass p-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 text-white">
        <label className="text-sm font-semibold tracking-wide flex items-center pl-1">
          Radius (km)
        </label>
        <input
          type="number"
          min={1}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="bg-[#0f172a]/80 border border-white/10 px-3 py-1.5 rounded-xl w-20 text-sm outline-none focus:border-orange-500/60"
        />
        <button
          onClick={fetchFoods}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all cursor-pointer"
        >
          <Search size={18} />
        </button>
      </div>

      <div className="relative w-full h-screen bg-[#0f172a]">
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {noResults && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#1e293b] text-white px-6 py-3 rounded-xl shadow-xl border border-white/10 mx-1 text-sm text-center">
          No available food posts within{" "}
          <span className="text-orange-400 font-bold">{radius} km</span>
        </div>
      )}

      {selectedFood && (
        <MapFoodModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
          refresh={fetchFoods}
        />
      )}
    </>
  );
};

export default MapView;
