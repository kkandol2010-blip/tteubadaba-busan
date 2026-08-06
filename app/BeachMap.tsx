"use client";

import { useEffect } from "react";
import L from "leaflet";
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Risk = "safe" | "caution" | "danger";
type InfoKind = "sand" | "wave" | "jelly" | "shade" | "timer" | "aid" | "plan";
type Beach = { id:string; ko:string; en:string; coordinate:[number,number]; sand:number; wave:number; jelly:Risk; jellyArea:string; shade:{name:string;detail:string;walk:number}[] };

type Props = { beach:Beach; beaches:Beach[]; activeInfo:InfoKind; onBeachSelect:(id:string)=>void; onInfoSelect:(kind:InfoKind)=>void };

function FlyToBeach({ center }:{center:[number,number]}) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 13.5, { duration: .65 }); }, [center, map]);
  return null;
}

function emojiIcon(emoji:string, active:boolean) {
  return L.divIcon({
    className: "map-emoji-wrap",
    html: `<span class="map-emoji ${active ? "chosen" : ""}">${emoji}</span>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

export default function BeachMap({ beach, beaches, activeInfo, onBeachSelect, onInfoSelect }:Props) {
  const [lat, lng] = beach.coordinate;
  const points:{kind:Extract<InfoKind,"sand"|"wave"|"jelly"|"shade"|"timer">; emoji:string; position:[number,number]; label:string}[] = [
    { kind:"sand", emoji:"🌡️", position:[lat + .0011, lng - .0011], label:`모래 온도 ${beach.sand}°C` },
    { kind:"wave", emoji:"🌊", position:[lat - .0008, lng + .0011], label:`파도 ${beach.wave}m` },
    { kind:"jelly", emoji:"\u{1FABC}", position:[lat - .0013, lng + .0028], label:`해파리 ${beach.jellyArea}` },
    { kind:"shade", emoji:"🌳", position:[lat + .0017, lng + .0018], label:`그늘 ${beach.shade[0].name}` },
    { kind:"timer", emoji:"☀️", position:[lat - .0020, lng - .0019], label:"햇빛 노출 타이머" },
  ];
  const color = beach.jelly === "danger" ? "#d6534b" : beach.jelly === "caution" ? "#d99c23" : "#1b8b6d";
  return <div className="real-map-wrap" aria-label={`${beach.ko} 실제 지도`}>
    <MapContainer center={beach.coordinate} zoom={13.5} scrollWheelZoom={true} className="real-map" zoomControl={false}>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FlyToBeach center={beach.coordinate} />
      {beaches.map(b => <CircleMarker key={b.id} center={b.coordinate} radius={b.id===beach.id?8:5} pathOptions={{ color:"#fff", weight:2, fillColor:b.id===beach.id?"#f36e50":"#173f56", fillOpacity:1 }} eventHandlers={{ click:()=>onBeachSelect(b.id) }}>
        <Popup><b>{b.ko} 해수욕장</b><br/>선택하려면 점을 누르세요.</Popup>
      </CircleMarker>)}
      <Circle center={beach.coordinate} radius={440} pathOptions={{ color:"#3f829e", fillColor:"#69b5c4", fillOpacity:.13, weight:1 }} />
      <Circle center={points[2].position} radius={150} pathOptions={{ color, fillColor:color, fillOpacity:.14, weight:2, dashArray:"5 5" }} />
      {points.map(point => <Marker key={point.kind} position={point.position} icon={emojiIcon(point.emoji, activeInfo===point.kind)} eventHandlers={{ click:()=>onInfoSelect(point.kind) }}>
        <Popup><b>{point.label}</b><br/>아이콘을 누르면 아래 상세 정보가 바뀝니다.</Popup>
      </Marker>)}
    </MapContainer>
    <div className="map-legend"><span><i className="legend-beach"/> 해수욕장</span><span>🌡️ 온도</span><span>🌊 파도</span><span>{"\u{1FABC}"} 해파리</span><span>🌳 그늘</span></div>
  </div>;
}
