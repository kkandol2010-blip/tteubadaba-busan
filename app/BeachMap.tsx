"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Risk = "safe" | "caution" | "danger";
type InfoKind = "sand" | "wave" | "jelly" | "shade" | "timer" | "aid" | "plan";
type Beach = { id:string; ko:string; en:string; displayName?:string; localizedJellyArea?:string; coordinate:[number,number]; sand:number; wave:number; jelly:Risk; jellyArea:string; shade:{name:string;detail:string;walk:number}[] };
type RecommendedPlace = { id:string; name:string; photoTitle?:string; category:string; coordinate:[number,number]; distanceKm:number; reason:string; openNow?:boolean; mapsUrl:string };

type Props = { beach:Beach; beaches:Beach[]; labels:Record<string,string>; activeInfo:InfoKind; placeFocus?:[number,number]|null; userPosition?:[number,number]|null; recommendedPlaces?:RecommendedPlace[]; onBeachSelect:(id:string)=>void; onInfoSelect:(kind:InfoKind)=>void };

function FlyToBeach({ center, placeFocus, zoom=12.2 }:{center:[number,number];placeFocus?:[number,number]|null;zoom?:number}) {
  const map = useMap();
  useEffect(() => { map.flyTo(placeFocus ?? center, placeFocus ? 15 : zoom, { duration: .65 }); }, [center, map, placeFocus, zoom]);
  return null;
}

function FitRecommendations({ center, places }:{center:[number,number];places:RecommendedPlace[]}) {
  const map=useMap();
  useEffect(()=>{
    if(places.length===0)return;
    map.fitBounds(L.latLngBounds([center,...places.map(place=>place.coordinate)]),{padding:[55,55],maxZoom:14,duration:.7});
  },[center,map,places]);
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
  const content=emoji==="\u{1FABC}"?'<img class="jellyfish-emoji-image" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.2/assets/svg/1fabc.svg" alt="" />':emoji;
  return L.divIcon({
    className: "map-emoji-wrap",
    html: `<span class="map-emoji ${active ? "chosen" : ""}">${content}</span>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

function userLocationIcon() {
  return L.divIcon({className:"user-location-wrap",html:'<span class="user-location-pulse"><b>●</b></span>',iconSize:[34,34],iconAnchor:[17,17]});
}

function recommendationIcon(index:number) {
  return L.divIcon({className:"recommendation-location-wrap",html:`<span class="recommendation-location-pin"><i>🏙️</i><b>${index+1}</b></span>`,iconSize:[48,48],iconAnchor:[24,44],popupAnchor:[0,-40]});
}

function RecommendationPopup({place,index,labels}:{place:RecommendedPlace;index:number;labels:Record<string,string>}){
  const [photo,setPhoto]=useState<{photoUri:string;attribution:{name:string;uri:string|null}|null}|null>(null),[failed,setFailed]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    const base=window.location.hostname.endsWith("github.io")?"https://tteubadaba-busan.vercel.app":"";
    fetch(`${base}/api/place-photo?id=${encodeURIComponent(place.id)}&title=${encodeURIComponent(place.photoTitle||place.name)}`,{signal:controller.signal}).then(response=>{if(!response.ok)throw new Error("photo");return response.json()}).then(setPhoto).catch(error=>{if(error.name!=="AbortError")setFailed(true)});
    return()=>controller.abort();
  },[place.id,place.name,place.photoTitle]);
  return <div className="recommendation-map-popup">{photo?<><img src={photo.photoUri} alt={`${place.name} ${labels.placePhoto}`} />{photo.attribution&&(photo.attribution.uri?<a className="photo-attribution" href={photo.attribution.uri} target="_blank" rel="noreferrer">{labels.photoBy} {photo.attribution.name}</a>:<small className="photo-attribution">{labels.photoBy} {photo.attribution.name}</small>)}</>:<div className="recommendation-photo-state">{failed?labels.photoUnavailable:labels.photoLoading}</div>}<b>{index+1}. {place.name}</b><small>{place.category} · {place.distanceKm} km</small>{place.openNow&&<em className="open-now-badge">● {labels.regularOpen}</em>}<p>{place.reason}</p><a href={place.mapsUrl} target="_blank" rel="noreferrer">Google Maps ↗</a></div>;
}

export default function BeachMap({ beach, beaches, labels, activeInfo, placeFocus, userPosition, recommendedPlaces=[], onBeachSelect, onInfoSelect }:Props) {
  const [selectedRecommendation,setSelectedRecommendation]=useState<string|null>(null);
  const [lat, lng] = beach.coordinate;
  const beachLayout:Record<string,{sand:[number,number];sea:[number,number];shade:[number,number]}>={
    // Dadaepo faces south-west; Imrang faces east. These use their own shoreline positions.
    dadaepo:{sand:[35.04770,128.96450],sea:[35.04690,128.96330],shade:[35.04805,128.96485]},
    imrang:{sand:[35.3196,129.2660],sea:[35.3194,129.2669],shade:[35.3202,129.2654]},
  };
  const layout=beachLayout[beach.id]??{sand:[lat + .00030,lng - .00010] as [number,number],sea:[lat - .00135,lng + .0028] as [number,number],shade:[lat + .00125,lng + .00135] as [number,number]};
  const sunPosition:[number,number]=[layout.sand[0] + .00035,layout.sand[1] + .00025];
  // Dadaepo uses a closer map view so each marker stays in its real beach/sea area and remains tappable.
  const specialPositions = beach.id === "dadaepo" ? {
    // Center of the yellow sand strip shown for Dadaepo Beach on the base map.
    sand: [35.04560, 128.96520] as [number,number],
    // Keep the sun-exposure control alongside the beach safety markers, without covering the thermometer.
    timer: [35.04430, 128.96650] as [number,number],
    wave: [35.04160, 128.96250] as [number,number],
    // Offshore blue-water area, kept separate from the wave marker.
    jelly: [35.04160, 128.95800] as [number,number],
    shade: [35.05620, 128.96560] as [number,number],
  } : beach.id === "imrang" ? {
    // Imrang Beach's mapped sand strip runs north-to-south; put both heat controls on it.
    sand: [35.31845, 129.26417] as [number,number],
    timer: [35.31590, 129.26280] as [number,number],
    wave: [35.31900, 129.27050] as [number,number],
    jelly: [35.31650, 129.27100] as [number,number],
    shade: [35.32300, 129.26450] as [number,number],
  } : null;
  const points:{kind:Extract<InfoKind,"sand"|"wave"|"jelly"|"shade"|"timer">; emoji:string; position:[number,number]; label:string}[] = [
    // Temperature and sun timer: dry sand area. Wave and jellyfish: separate offshore water points.
    { kind:"sand", emoji:"🌡️", position:specialPositions?.sand ?? layout.sand, label:`${labels.sand} ${beach.sand}°C` },
    { kind:"wave", emoji:"🌊", position:specialPositions?.wave ?? layout.sea, label:`${labels.wave} ${beach.wave}m` },
    { kind:"jelly", emoji:"\u{1FABC}", position:specialPositions?.jelly ?? [layout.sea[0] - .00025,layout.sea[1] + .00030], label:`${labels.jelly} ${beach.localizedJellyArea??beach.jellyArea}` },
    { kind:"shade", emoji:"🌳", position:specialPositions?.shade ?? layout.shade, label:`${labels.shade} 1` },
    { kind:"timer", emoji:"☀️", position:specialPositions?.timer ?? sunPosition, label:labels.timer },
  ];
  const color = beach.jelly === "danger" ? "#d6534b" : beach.jelly === "caution" ? "#d99c23" : "#1b8b6d";
  return <div className="real-map-wrap" aria-label={`${beach.displayName??beach.en} ${labels.actualMap}`}>
    <MapContainer center={[35.153,129.095]} zoom={11.4} minZoom={10.5} maxBounds={[[34.98,128.84],[35.38,129.38]]} maxBoundsViscosity={1} scrollWheelZoom={true} className="real-map" zoomControl={false}>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FlyToBeach center={beach.coordinate} placeFocus={placeFocus} zoom={beach.id === "dadaepo" ? 14 : beach.id === "imrang" ? 15.5 : 12.2} />
      <FitRecommendations center={beach.coordinate} places={recommendedPlaces} />
      <FlyToNearbyPlace />
      {beaches.map(b => <CircleMarker key={b.id} center={b.coordinate} radius={b.id===beach.id?8:5} pathOptions={{ color:"#fff", weight:2, fillColor:b.id===beach.id?"#f36e50":"#173f56", fillOpacity:1 }} eventHandlers={{ click:()=>onBeachSelect(b.id) }}>
        <Popup><b>{b.displayName??b.en}</b><br/>{labels.tap}</Popup>
      </CircleMarker>)}
      <Circle center={beach.coordinate} radius={440} pathOptions={{ color:"#3f829e", fillColor:"#69b5c4", fillOpacity:.13, weight:1 }} />
      <Circle center={points[2].position} radius={150} pathOptions={{ color, fillColor:color, fillOpacity:.14, weight:2, dashArray:"5 5" }} />
      {points.map(point => <Marker key={point.kind} position={point.position} icon={emojiIcon(point.emoji, activeInfo===point.kind)} eventHandlers={{ click:()=>onInfoSelect(point.kind) }}>
        <Popup><b>{point.label}</b><br/>{labels.tap}</Popup>
      </Marker>)}
      {userPosition&&<Marker position={userPosition} icon={userLocationIcon()} zIndexOffset={1500}><Popup><b>📍 {labels.myLocation}</b></Popup></Marker>}
      {recommendedPlaces.map((place,index)=><Marker key={place.id} position={place.coordinate} icon={recommendationIcon(index)} zIndexOffset={1200-index} eventHandlers={{click:()=>setSelectedRecommendation(place.id)}}><Popup>{selectedRecommendation===place.id?<RecommendationPopup place={place} index={index} labels={labels}/>:<b>{place.name}</b>}</Popup></Marker>)}
    </MapContainer>
    <div className="map-legend"><span><i className="legend-beach"/> {labels.beachMarker}</span><span>🌡️ {labels.sand}</span><span>🌊 {labels.wave}</span><span><img className="jellyfish-legend-image" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.2/assets/svg/1fabc.svg" alt=""/> {labels.jelly}</span><span>🌳 {labels.shade}</span></div>
  </div>;
}
