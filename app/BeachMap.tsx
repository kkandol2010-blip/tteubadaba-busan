"use client";

import { useEffect } from "react";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Position = { lat: number; lng: number } | null;

type Props = {
  beach: { name: string; coordinate: [number, number]; jellyfish: string; jellySpot: string; shadeSpots: { name: string }[] };
  userPosition: Position;
};

function FlyToBeach({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 14, { duration: 0.7 }); }, [center, map]);
  return null;
}

export default function BeachMap({ beach, userPosition }: Props) {
  const [lat, lng] = beach.coordinate;
  const shadePoints: [number, number][] = [[lat + 0.002, lng - 0.002], [lat - 0.0016, lng + 0.0025], [lat + 0.0006, lng + 0.0036]];
  const jellyCenter: [number, number] = [lat - 0.001, lng + 0.006];
  const jellyColor = beach.jellyfish === "위험" ? "#d85547" : beach.jellyfish === "주의" ? "#e7a12e" : "#3a9a77";
  return (
    <div className="real-map-wrap" aria-label={`${beach.name} 실제 지도와 안전 구역`}>
      <MapContainer center={beach.coordinate} zoom={14} scrollWheelZoom={false} className="real-map">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FlyToBeach center={beach.coordinate} />
        <Circle center={beach.coordinate} radius={330} pathOptions={{ color: "#2f879b", fillColor: "#76c8d3", fillOpacity: 0.18, weight: 1 }}>
          <Popup><b>{beach.name} 해변 구역</b><br />안전요원 안내를 우선 확인하세요.</Popup>
        </Circle>
        {shadePoints.map((point, index) => <CircleMarker key={index} center={point} radius={10} pathOptions={{ color: "#fff", fillColor: "#24795b", fillOpacity: 1, weight: 3 }}><Popup><b>그늘 {index + 1}</b><br />{beach.shadeSpots[index]?.name}</Popup></CircleMarker>)}
        {beach.jellyfish !== "좋음" && <Circle center={jellyCenter} radius={170} pathOptions={{ color: jellyColor, fillColor: jellyColor, fillOpacity: 0.25, weight: 2, dashArray: "5 5" }}><Popup><b>해파리 {beach.jellyfish} 구역</b><br />{beach.jellySpot}</Popup></Circle>}
        {userPosition && <CircleMarker center={[userPosition.lat, userPosition.lng]} radius={9} pathOptions={{ color: "#fff", fillColor: "#2867db", fillOpacity: 1, weight: 3 }}><Popup>현재 위치</Popup></CircleMarker>}
      </MapContainer>
      <div className="map-legend"><span><i className="legend-shade" />그늘</span><span><i className="legend-jelly" />해파리 주의</span><span><i className="legend-me" />내 위치</span></div>
    </div>
  );
}
