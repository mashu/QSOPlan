// src/components/map-component.tsx
'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41]
});

// Function to convert lat/lon to grid square
function toGridSquare(lat: number, lon: number): string {
  // Ensure longitude is between -180 and 180
  lon = lon > 180 ? lon - 360 : lon;
  
  // First pair (field)
  const field1 = String.fromCharCode(65 + Math.floor((lon + 180) / 20));
  const field2 = String.fromCharCode(65 + Math.floor((lat + 90) / 10));
  
  // Second pair (square)
  const square1 = Math.floor(((lon + 180) % 20) / 2);
  const square2 = Math.floor(((lat + 90) % 10));
  
  // Third pair (subsquare)
  const subsq1 = String.fromCharCode(97 + Math.floor(((lon + 180) % 2) * 12));
  const subsq2 = String.fromCharCode(97 + Math.floor(((lat + 90) % 1) * 24));
  
  return `${field1}${field2}${square1}${square2}${subsq1}${subsq2}`.toUpperCase();
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapComponentProps {
  onLocationSelect: (gridSquare: string, lat: number, lon: number) => void;
  initialCenter: [number, number];
}

const MapComponent = ({ onLocationSelect, initialCenter }: MapComponentProps) => {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  const handleMapClick = (lat: number, lon: number) => {
    const position: [number, number] = [lat, lon];
    setSelectedPosition(position);
    const gridSquare = toGridSquare(lat, lon);
    onLocationSelect(gridSquare, lat, lon);
  };

  return (
    <MapContainer
      center={initialCenter}
      zoom={13}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents onLocationSelect={handleMapClick} />
      {selectedPosition && (
        <Marker position={selectedPosition} icon={icon} />
      )}
    </MapContainer>
  );
};

export default MapComponent;
