// src/components/grid-map.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component with no SSR
const MapComponent = dynamic(
  () => import('./map-component'),
  { 
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-800">
        <p className="text-white">Loading map...</p>
      </div>
    ),
    ssr: false 
  }
);

interface GridMapSelectorProps {
  onLocationSelect: (gridSquare: string, lat: number, lon: number) => void;
  initialCenter?: [number, number];
}

const GridMapSelector = ({ onLocationSelect, initialCenter = [51.505, -0.09] }: GridMapSelectorProps) => {
  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden">
      <MapComponent
        onLocationSelect={onLocationSelect}
        initialCenter={initialCenter}
      />
    </div>
  );
};

export default GridMapSelector;
