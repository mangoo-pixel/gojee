"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

type Spot = {
  id: string;
  name: string | null;
  lat?: number;
  lng?: number;
};

// Fix for default Leaflet marker icons (they break in Next.js)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function SpotMap({ spots }: { spots: Spot[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Center map on first spot or default (Tokyo)
    const firstSpot = spots.find(s => s.lat && s.lng);
    const center: L.LatLngExpression = firstSpot
      ? [firstSpot.lat!, firstSpot.lng!]
      : [35.6895, 139.6917]; // Tokyo

    const map = L.map(mapRef.current).setView(center, 12);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    // Add markers for each spot with geolocation
    spots.forEach((spot) => {
      if (spot.lat && spot.lng) {
        L.marker([spot.lat, spot.lng])
          .bindPopup(spot.name || "Unnamed spot")
          .addTo(map);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [spots]);

  return <div ref={mapRef} style={{ width: "100%", height: "400px", borderRadius: "24px", marginBottom: "1.5rem" }} />;
}