'use client';

import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Icon, Style, Text, Stroke, Fill } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { getDistance } from 'ol/sphere';
import { Plus, Minus, Plane, Car, Info, Globe, Map as MapIcon, CarFront } from 'lucide-react';

interface MapWrapperProps {
  homeAirportCoords: [number, number];
  awayAirportCoords: [number, number];
  routePath: [number, number][];
  homeAirport: { id: string; name: string; latitude: number; longitude: number; iata_code?: string };
  awayAirport: { id: string; name: string; latitude: number; longitude: number; iata_code?: string };
  matchDetails?: { homeTeam: string; awayTeam: string; date: string; country: string } | null;
  GEOAPIFY_API_KEY: string;
  routeMode: 'air' | 'road';
  setRouteMode: (mode: 'air' | 'road') => void;
  mapId?: string;
  isLoading?: boolean;
}

const MapWrapper: React.FC<MapWrapperProps> = ({
  homeAirportCoords,
  awayAirportCoords,
  routePath,
  homeAirport,
  awayAirport,
  matchDetails,
  GEOAPIFY_API_KEY,
  routeMode,
  setRouteMode,
  mapId = 'default-map',
  isLoading = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const tileLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const [isInfoBoxVisible, setIsInfoBoxVisible] = useState(false);
  const [mapStyle, setMapStyle] = useState<'default' | 'satellite'>('default');

  const areValidCoords = (coords: [number, number] | null): boolean => {
    return (
      Array.isArray(coords) &&
      coords.length === 2 &&
      !isNaN(coords[0]) &&
      !isNaN(coords[1]) &&
      coords[0] >= -90 &&
      coords[0] <= 90 &&
      coords[1] >= -180 &&
      coords[1] <= 180
    );
  };

  const getTileSource = () => {
    if (mapStyle === 'satellite') {
      return new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: '© Esri, Maxar, Earthstar Geographics, and the GIS User Community',
        tileSize: 256,
        maxZoom: 19,
      });
    }
    return new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attributions: '© Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, (c) OpenStreetMap contributors, and the GIS User Community',
      tileSize: 256,
      maxZoom: 19,
    });
  };

  useEffect(() => {
    if (!mapRef.current || !tooltipRef.current) return;

    const mapTargetId = `map-${mapId}`;
    mapRef.current.id = mapTargetId;

    if (!areValidCoords(homeAirportCoords) || !areValidCoords(awayAirportCoords)) {
      console.error('Invalid coordinates:', { homeAirportCoords, awayAirportCoords });
      return;
    }

    const homeCoords = fromLonLat([homeAirportCoords[1], homeAirportCoords[0]]);
    const awayCoords = fromLonLat([awayAirportCoords[1], awayAirportCoords[0]]);

    const airDistanceKm = getDistance(
      [homeAirportCoords[1], homeAirportCoords[0]],
      [awayAirportCoords[1], awayAirportCoords[0]]
    ) / 1000;

    let roadDistanceKm = airDistanceKm;
    if (routeMode === 'road' && routePath && routePath.length >= 2) {
      roadDistanceKm = 0;
      for (let i = 1; i < routePath.length; i++) {
        const prev = routePath[i - 1];
        const curr = routePath[i];
        roadDistanceKm += getDistance(
          [prev[1], prev[0]],
          [curr[1], curr[0]]
        ) / 1000;
      }
    }

    const distanceKm = routeMode === 'air' ? airDistanceKm : roadDistanceKm;

    const airTravelTimeHours = airDistanceKm / 800;
    const roadTravelTimeHours = roadDistanceKm / 80;
    const travelTimeHours = routeMode === 'air' ? airTravelTimeHours : roadTravelTimeHours;
    const travelTimeFormatted = `${Math.floor(travelTimeHours)}h ${Math.round((travelTimeHours % 1) * 60)}m`;

    const airFuelConsumptionTons = airDistanceKm * 0.1;
    const roadFuelConsumptionTons = roadDistanceKm * 0.01;
    const fuelConsumptionTons = routeMode === 'air' ? airFuelConsumptionTons : roadFuelConsumptionTons;

    const homeFeature = new Feature({
      geometry: new Point(homeCoords),
      name: `Home: ${homeAirport.name} ${homeAirport.iata_code ? `(${homeAirport.iata_code})` : ''}`,
      type: 'airport',
      details: `Latitude: ${homeAirport.latitude}, Longitude: ${homeAirport.longitude}`,
    });
    homeFeature.setStyle(
      new Style({
        image: new Icon({
          src: routeMode === 'air'
            ? 'https://img.icons8.com/color/48/000000/airplane-take-off.png'
            : 'https://img.icons8.com/color/48/000000/car.png',
          scale: 0.5,
          color: '#1E90FF',
        }),
        text: new Text({
          text: `Home: ${homeAirport.name}`,
          offsetY: -25,
          fill: new Fill({ color: '#000' }),
          backgroundFill: new Fill({ color: 'rgba(255, 255, 255, 0.7)' }),
          padding: [2, 2, 2, 2],
        }),
      })
    );

    const awayFeature = new Feature({
      geometry: new Point(awayCoords),
      name: `Away: ${awayAirport.name} ${awayAirport.iata_code ? `(${awayAirport.iata_code})` : ''}`,
      type: 'airport',
      details: `Latitude: ${awayAirport.latitude}, Longitude: ${awayAirport.longitude}`,
    });
    awayFeature.setStyle(
      new Style({
        image: new Icon({
          src: routeMode === 'air'
            ? 'https://img.icons8.com/color/48/000000/airplane-take-off.png'
            : 'https://img.icons8.com/color/48/000000/car.png',
          scale: 0.5,
          color: '#FF5555',
        }),
        text: new Text({
          text: `Away: ${awayAirport.name}`,
          offsetY: -25,
          fill: new Fill({ color: '#000' }),
          backgroundFill: new Fill({ color: 'rgba(255, 255, 255, 0.7)' }),
          padding: [2, 2, 2, 2],
        }),
      })
    );

    const features: Feature[] = [homeFeature, awayFeature];

    let routeFeature: Feature | null = null;
    if (routePath && routePath.length >= 2 && routePath.every(coord => areValidCoords(coord as [number, number]))) {
      const routeGeometry = new LineString(routePath.map(coord => fromLonLat([coord[1], coord[0]])));
      routeFeature = new Feature({
        geometry: routeGeometry,
        name: routeMode === 'air' ? 'Air Route' : 'Road Route',
        type: 'route',
        details: `Distance: ${distanceKm.toFixed(2)} km\nTravel Time: ${travelTimeFormatted}\nFuel: ${fuelConsumptionTons.toFixed(2)} tons`,
      });
      routeFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: routeMode === 'air' ? '#FF5555' : '#1E90FF',
            width: 3,
            lineDash: routeMode === 'air' ? [5, 10] : undefined,
          }),
        })
      );
      features.push(routeFeature);
    }

    const vectorSource = new VectorSource({
      features,
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    vectorLayerRef.current = vectorLayer;

    const tileLayer = new TileLayer({
      source: getTileSource(),
      preload: Infinity,
    });
    tileLayerRef.current = tileLayer;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setTarget(undefined);
    }

    const map = new Map({
      target: mapTargetId,
      layers: [tileLayer, vectorLayer],
      view: new View({
        center: homeCoords,
        zoom: 5,
        minZoom: 3,
        maxZoom: 19,
        constrainResolution: true,
      }),
      controls: [],
    });

    mapInstanceRef.current = map;

    const extent = vectorSource.getExtent();
    if (extent.every(coord => isFinite(coord))) {
      map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
    } else {
      map.getView().setCenter([0, 0]);
      map.getView().setZoom(2);
    }

    const tooltip = tooltipRef.current;
    map.on('pointermove', (evt) => {
      if (!tooltip) return;
      const pixel = map.getEventPixel(evt.originalEvent);
      const feature = map.forEachFeatureAtPixel(pixel, (feat) => feat);
      tooltip.style.display = 'none';
      if (feature) {
        tooltip.style.left = `${evt.originalEvent.pageX + 10}px`;
        tooltip.style.top = `${evt.originalEvent.pageY - 10}px`;
        tooltip.style.display = 'block';
        if (feature.get('type') === 'route') {
          tooltip.innerHTML = `<strong>${feature.get('name')}</strong><br/>${feature.get('details').replace('\n', '<br/>')}`;
        } else if (feature.get('type') === 'airport') {
          tooltip.innerHTML = `<strong>${feature.get('name')}</strong><br/>${feature.get('details') || ''}`;
        }
      }
    });

    map.on('rendercomplete', () => {
      map.renderSync();
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [homeAirportCoords, awayAirportCoords, routePath, homeAirport, awayAirport, routeMode, mapId]);

  // Update features when routeMode changes to reflect icon changes
  useEffect(() => {
    if (vectorLayerRef.current) {
      const vectorSource = vectorLayerRef.current.getSource();
      if (vectorSource) {
        const features = vectorSource.getFeatures();
        features.forEach((feature) => {
          if (feature.get('type') === 'airport') {
            const isHome = feature.get('name').includes('Home');
            feature.setStyle(
              new Style({
                image: new Icon({
                  src: routeMode === 'air'
                    ? 'https://img.icons8.com/color/48/000000/airplane-take-off.png'
                    : 'https://img.icons8.com/color/48/000000/car.png',
                  scale: 0.5,
                  color: isHome ? '#1E90FF' : '#FF5555',
                }),
                text: new Text({
                  text: feature.get('name'),
                  offsetY: -25,
                  fill: new Fill({ color: '#000' }),
                  backgroundFill: new Fill({ color: 'rgba(255, 255, 255, 0.7)' }),
                  padding: [2, 2, 2, 2],
                }),
              })
            );
          }
        });
      }
    }
  }, [routeMode]);

  // Update tile source when mapStyle changes
  useEffect(() => {
    if (tileLayerRef.current && mapInstanceRef.current) {
      const newSource = getTileSource();
      tileLayerRef.current.setSource(newSource);
      newSource.once('tileloadend', () => {
        if (mapInstanceRef.current) mapInstanceRef.current.renderSync();
      });
    }
  }, [mapStyle]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      view.animate({ zoom: view.getZoom()! + 1, duration: 250 });
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      view.animate({ zoom: view.getZoom()! - 1, duration: 250 });
    }
  };

  const airDistanceKm = getDistance(
    [homeAirportCoords[1], homeAirportCoords[0]],
    [awayAirportCoords[1], awayAirportCoords[0]]
  ) / 1000;

  let roadDistanceKm = airDistanceKm;
  if (routeMode === 'road' && routePath && routePath.length >= 2) {
    roadDistanceKm = 0;
    for (let i = 1; i < routePath.length; i++) {
      const prev = routePath[i - 1];
      const curr = routePath[i];
      roadDistanceKm += getDistance(
        [prev[1], prev[0]],
        [curr[1], curr[0]]
      ) / 1000;
    }
  }

  const distanceKm = routeMode === 'air' ? airDistanceKm : roadDistanceKm;
  const airTravelTimeHours = airDistanceKm / 800;
  const roadTravelTimeHours = roadDistanceKm / 80;
  const travelTimeHours = routeMode === 'air' ? airTravelTimeHours : roadTravelTimeHours;
  const travelTimeFormatted = `${Math.floor(travelTimeHours)}h ${Math.round((travelTimeHours % 1) * 60)}m`;
  const airFuelConsumptionTons = airDistanceKm * 0.1;
  const roadFuelConsumptionTons = roadDistanceKm * 0.01;
  const fuelConsumptionTons = routeMode === 'air' ? airFuelConsumptionTons : roadFuelConsumptionTons;

  return (
    <div className="relative h-full w-full shadow-lg border border-gray-200 rounded-lg">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-500 border-solid"></div>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" style={{ minHeight: '400px' }} />
      <div className="absolute top-2 right-2 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-lg z-20"
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-lg z-20"
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => setIsInfoBoxVisible(!isInfoBoxVisible)}
          className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-lg z-20"
          title={isInfoBoxVisible ? "Hide Route Info" : "Show Route Info"}
        >
          <Info size={16} />
        </button>
      </div>
      <div className="absolute top-2 left-2 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setRouteMode('air')}
            className={`p-2 rounded-lg flex items-center gap-1 transition-all shadow-lg ${routeMode === 'air' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
              } hover:bg-emerald-700 hover:text-white`}
            title="Switch to Air Route"
          >
            <Plane size={16} /> Air
          </button>
          <button
            onClick={() => setRouteMode('road')}
            className={`p-2 rounded-lg flex items-center gap-1 transition-all shadow-lg ${routeMode === 'road' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
              } hover:bg-emerald-700 hover:text-white`}
            title="Switch to Road Route"
          >
            <CarFront size={16} /> Road
          </button>
        </div>
        <div className="gap-2">
          <button
            onClick={() => setMapStyle('default')}
            className={`p-2 rounded-lg transition-all shadow-lg block my-2 ${mapStyle === 'default' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
              } hover:bg-emerald-700 hover:text-white`}
            title="Default Map View"
          >
            <MapIcon size={16} />
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`p-2 rounded-lg transition-all shadow-lg block my-2 ${mapStyle === 'satellite' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
              } hover:bg-emerald-700 hover:text-white`}
            title="Satellite Map View"
          >
            <Globe size={16} />
          </button>
        </div>
      </div>
      {isInfoBoxVisible && (
        <div className="absolute bottom-2 left-2 right-2 bg-gray-800 bg-opacity-80 text-white p-3 rounded-lg shadow-lg z-10 text-sm">
          <div className="flex flex-col gap-1">
            {matchDetails && (
              <>
                <span><strong>Match:</strong> {matchDetails.homeTeam} vs {matchDetails.awayTeam}</span>
                <span><strong>Date:</strong> {new Date(matchDetails.date).toLocaleDateString()}</span>
                <span><strong>Country:</strong> {matchDetails.country}</span>
              </>
            )}
            <span><strong>Route Type:</strong> {routeMode === 'air' ? 'Air' : 'Road'}</span>
            <span><strong>Distance:</strong> {distanceKm.toFixed(2)} km</span>
            <span><strong>Travel Time:</strong> {travelTimeFormatted}</span>
            <span><strong>Est. Fuel Consumption:</strong> {fuelConsumptionTons.toFixed(2)} tons</span>
            <span><strong>Home Airport:</strong> {homeAirport.name} ({homeAirport.iata_code || 'N/A'})</span>
            <span><strong>Away Airport:</strong> {awayAirport.name} ({awayAirport.iata_code || 'N/A'})</span>
          </div>
        </div>
      )}
      <div
        ref={tooltipRef}
        className="absolute bg-gray-800 text-white p-2 rounded-lg shadow-lg pointer-events-none z-10 text-sm"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default MapWrapper;