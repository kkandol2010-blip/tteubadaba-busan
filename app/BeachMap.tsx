"use client";

import { useEffect } from "react";
import L from "leaflet";
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Risk = "safe" | "caution" | "danger";
type InfoKind = "sand" | "wave" | "jelly" | "shade" | "timer" | "aid" | "plan";
type Beach = { id:string; ko:string; en:string; coordinate:[number,number]; sand:number; wave:number; jelly:Risk; jellyArea:string; shade:{name:string;detail:string;walk:number}[] };

type Props = { beach:Beach; beaches:Beach[]; labels:Record<string,string>; activeInfo:InfoKind; placeFocus?:[number,number]|null; onBeachSelect:(id:string)=>void; onInfoSelect:(kind:InfoKind)=>void };

function FlyToBeach({ center, placeFocus }:{center:[number,number];placeFocus?:[number,number]|null}) {
  const map = useMap();
  useEffect(() => { map.flyTo(placeFocus ?? center, placeFocus ? 15 : 12.2, { duration: .65 }); }, [center, map, placeFocus]);
  return null;
}

const nearbyPlaceCoordinates:Record<string,[number,number]> = {
  "더베이 101":[35.1569,129.1531], "The Bay 101":[35.1569,129.1531],
  "동백섬":[35.1535,129.1519], "Dongbaekseom Island":[35.1535,129.1519],
  "민락수변공원":[35.1555,129.1303], "Millak Waterfront Park":[35.1555,129.1303],
  "광안리 카페거리":[35.1549,129.1198], "Gwangalli Cafe Street":[35.1549,129.1198],
  "해동용궁사":[35.1882,129.2238], "Haedong Yonggungsa":[35.1882,129.2238],
  "청사포 다릿돌전망대":[35.1607,129.1918], "Cheongsapo Observatory":[35.1607,129.1918],
  "송도해상케이블카":[35.0773,129.0192], "Songdo Marine Cable Car":[35.0773,129.0192],
  "암남공원":[35.0705,129.0158], "Amnam Park":[35.0705,129.0158],
  "꿈의 낙조분수":[35.0464,128.9669], "Sunset Fountain of Dreams":[35.0464,128.9669],
  "다대포 해변공원":[35.0483,128.9652], "Dadaepo Beach Park":[35.0483,128.9652],
  "기장시장":[35.2445,129.2140], "Gijang Market":[35.2445,129.2140],
  "일광 해안산책로":[35.2622,129.2334], "Ilgwang Coastal Trail":[35.2622,129.2334],
  "죽성드림성당":[35.2414,129.2347], "Jukseong Dream Church":[35.2414,129.2347],
};

function FlyToNearbyPlace() {
  const map = useMap();
  useEffect(() => {
    const move = (event:MouseEvent) => {
      const card = (event.target as HTMLElement).closest(".plan-card button");
      const name = card?.querySelector("b")?.textContent?.trim();
      const coordinate = name ? nearbyPlaceCoordinates[name] : undefined;
      if (coordinate) map.flyTo(coordinate, 15, { duration: .65 });
    };
    document.addEventListener("click", move);
    return () => document.removeEventListener("click", move);
  }, [map]);
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

export default function BeachMap({ beach, beaches, labels, activeInfo, placeFocus, onBeachSelect, onInfoSelect }:Props) {
  const [lat, lng] = beach.coordinate;
  const beachLayout:Record<string,{sand:[number,number];sea:[number,number];shade:[number,number]}>={
    // Dadaepo faces south-west; Imrang faces east. These use their own shoreline positions.
    dadaepo:{sand:[35.04685,128.96315],sea:[35.04605,128.96195],shade:[35.04805,128.96485]},
    imrang:{sand:[35.3196,129.2660],sea:[35.3194,129.2669],shade:[35.3202,129.2654]},
  };
  const layout=beachLayout[beach.id]??{sand:[lat + .00030,lng - .00010] as [number,number],sea:[lat - .00135,lng + .0028] as [number,number],shade:[lat + .00125,lng + .00135] as [number,number]};
  const sunPosition:[number,number]=[layout.sand[0] + .00035,layout.sand[1] + .00025];
  const sharedDadaepoPosition=beach.id==="dadaepo"?sunPosition:null;
  const points:{kind:Extract<InfoKind,"sand"|"wave"|"jelly"|"shade"|"timer">; emoji:string; position:[number,number]; label:string}[] = [
    // Temperature and sun timer: dry sand area. Jellyfish: offshore water. Shade: land-side shade area.
    { kind:"sand", emoji:"🌡️", position:sharedDadaepoPosition??layout.sand, label:`${labels.sand} ${beach.sand}°C` },
    { kind:"wave", emoji:"🌊", position:sharedDadaepoPosition??layout.sea, label:`${labels.wave} ${beach.wave}m` },
    { kind:"jelly", emoji:"\u{1FABC}", position:sharedDadaepoPosition??[layout.sea[0] - .00025,layout.sea[1] + .00030], label:`${labels.jelly} ${beach.jellyArea}` },
    { kind:"shade", emoji:"🌳", position:layout.shade, label:`${labels.shade} 1` },
    { kind:"timer", emoji:"☀️", position:sunPosition, label:labels.timer },
  ];
  const color = beach.jelly === "danger" ? "#d6534b" : beach.jelly === "caution" ? "#d99c23" : "#1b8b6d";
  return <div className="real-map-wrap" aria-label={`${beach.ko} 실제 지도`}>
    <MapContainer center={[35.153,129.095]} zoom={11.4} minZoom={10.5} maxBounds={[[34.98,128.84],[35.38,129.38]]} maxBoundsViscosity={1} scrollWheelZoom={true} className="real-map" zoomControl={false}>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FlyToBeach center={beach.coordinate} placeFocus={placeFocus} />
      <FlyToNearbyPlace />
      {beaches.map(b => <CircleMarker key={b.id} center={b.coordinate} radius={b.id===beach.id?8:5} pathOptions={{ color:"#fff", weight:2, fillColor:b.id===beach.id?"#f36e50":"#173f56", fillOpacity:1 }} eventHandlers={{ click:()=>onBeachSelect(b.id) }}>
        <Popup><b>{b.en}</b><br/>{labels.tap}</Popup>
      </CircleMarker>)}
      <Circle center={beach.coordinate} radius={440} pathOptions={{ color:"#3f829e", fillColor:"#69b5c4", fillOpacity:.13, weight:1 }} />
      <Circle center={points[2].position} radius={150} pathOptions={{ color, fillColor:color, fillOpacity:.14, weight:2, dashArray:"5 5" }} />
      {points.map(point => <Marker key={point.kind} position={point.position} icon={emojiIcon(point.emoji, activeInfo===point.kind)} eventHandlers={{ click:()=>onInfoSelect(point.kind) }}>
        <Popup><b>{point.label}</b><br/>{labels.tap}</Popup>
      </Marker>)}
    </MapContainer>
    <div className="map-legend"><span><i className="legend-beach"/> BEACH</span><span>🌡️ {labels.sand}</span><span>🌊 {labels.wave}</span><span>{"\u{1FABC}"} {labels.jelly}</span><span>🌳 {labels.shade}</span></div>
  </div>;
}
