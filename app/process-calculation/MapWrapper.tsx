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
import { Icon, Style, Text, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
interface MapWrapperProps {
  homeAirportCoords: [number, number];
  awayAirportCoords: [number, number];
  routePath: [number, number][];
  homeAirport: { id: string; name: string; latitude: number; longitude: number; iata_code?: string };
  awayAirport: { id: string; name: string; latitude: number; longitude: number; iata_code?: string };
  GEOAPIFY_API_KEY: string;
}
const MapWrapper: React.FC<MapWrapperProps> = ({
  homeAirportCoords,
  awayAirportCoords,
  routePath,
  homeAirport,
  awayAirport,
  GEOAPIFY_API_KEY,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  useEffect(() => {
    if (!isMounted || !mapRef.current) return;
    const homeCoords = fromLonLat([homeAirportCoords[1], homeAirportCoords[0]]);
    const awayCoords = fromLonLat([awayAirportCoords[1], awayAirportCoords[0]]);
    const homeFeature = new Feature({
      geometry: new Point(homeCoords),
      name: `Home: ${homeAirport.name} ${homeAirport.iata_code ? `(${homeAirport.iata_code})` : ''}`,
    });
    homeFeature.setStyle(
      new Style({
        image: new Icon({
          src: 'https://openlayers.org/en/latest/examples/data/icon.png',
          scale: 0.5,
        }),
        text: new Text({
          text: `Home: ${homeAirport.name}`,
          offsetY: -25,
          fill: new Stroke({ color: 'black' }),
        }),
      })
    );
    const awayFeature = new Feature({
      geometry: new Point(awayCoords),
      name: `Away: ${awayAirport.name} ${awayAirport.iata_code ? `(${awayAirport.iata_code})` : ''}`,
    });
    awayFeature.setStyle(
      new Style({
        image: new Icon({
          src: 'https://openlayers.org/en/latest/examples/data/icon.png',
          scale: 0.5,
        }),
        text: new Text({
          text: `Away: ${awayAirport.name}`,
          offsetY: -25,
          fill: new Stroke({ color: 'black' }),
        }),
      })
    );
    const routeFeature = new Feature({
      geometry: new LineString(routePath.map(coord => fromLonLat([coord[1], coord[0]]))),
    });
    routeFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 2,
        }),
      })
    );
    const vectorSource = new VectorSource({
      features: [homeFeature, awayFeature, routeFeature],
    });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
          }),
        }),
        vectorLayer,
      ],
      view: new View({
        center: homeCoords,
        zoom: 5,
      }),
    });
    const extent = vectorSource.getExtent();
    map.getView().fit(extent, { padding: [50, 50, 50, 50] });
    return () => map.setTarget(undefined);
  }, [isMounted, homeAirportCoords, awayAirportCoords, routePath, homeAirport, awayAirport, GEOAPIFY_API_KEY]);
  if (!isMounted) {
    return <div className="text-gray-300">Loading map...</div>;
  }
  return <div ref={mapRef} className="h-full w-full" />;
};
export default MapWrapper;