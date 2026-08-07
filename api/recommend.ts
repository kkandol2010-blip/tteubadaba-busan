type Lang = "ko" | "en" | "zh" | "ja" | "fr";

type Candidate = {
  id: string;
  names: Record<Lang, string>;
  category: Record<Lang, string>;
  coordinate: [number, number];
};

const candidates: Candidate[] = [
  { id:"citizens-park", names:{ko:"부산시민공원",en:"Busan Citizens Park",zh:"釜山市民公园",ja:"釜山市民公園",fr:"Parc des citoyens de Busan"}, category:{ko:"도심 공원",en:"City park",zh:"城市公园",ja:"都市公園",fr:"Parc urbain"}, coordinate:[35.1668,129.0556] },
  { id:"gamcheon", names:{ko:"감천문화마을",en:"Gamcheon Culture Village",zh:"甘川文化村",ja:"甘川文化村",fr:"Village culturel de Gamcheon"}, category:{ko:"문화마을",en:"Culture village",zh:"文化村",ja:"文化村",fr:"Village culturel"}, coordinate:[35.0975,129.0106] },
  { id:"busan-tower", names:{ko:"부산타워·용두산공원",en:"Busan Tower & Yongdusan Park",zh:"釜山塔·龙头山公园",ja:"釜山タワー・龍頭山公園",fr:"Tour de Busan et parc Yongdusan"}, category:{ko:"전망·공원",en:"Observatory & park",zh:"观景·公园",ja:"展望・公園",fr:"Panorama et parc"}, coordinate:[35.1012,129.0324] },
  { id:"gukje-market", names:{ko:"국제시장",en:"Gukje Market",zh:"国际市场",ja:"国際市場",fr:"Marché Gukje"}, category:{ko:"전통시장",en:"Traditional market",zh:"传统市场",ja:"伝統市場",fr:"Marché traditionnel"}, coordinate:[35.1028,129.0289] },
  { id:"busan-museum", names:{ko:"부산박물관",en:"Busan Museum",zh:"釜山博物馆",ja:"釜山博物館",fr:"Musée de Busan"}, category:{ko:"실내 박물관",en:"Indoor museum",zh:"室内博物馆",ja:"屋内博物館",fr:"Musée couvert"}, coordinate:[35.1296,129.0913] },
  { id:"cinema-center", names:{ko:"영화의전당",en:"Busan Cinema Center",zh:"电影殿堂",ja:"映画の殿堂",fr:"Centre du cinéma de Busan"}, category:{ko:"문화공간",en:"Culture venue",zh:"文化空间",ja:"文化施設",fr:"Lieu culturel"}, coordinate:[35.1712,129.1270] },
  { id:"f1963", names:{ko:"F1963 문화공간",en:"F1963 Cultural Center",zh:"F1963文化空间",ja:"F1963文化空間",fr:"Centre culturel F1963"}, category:{ko:"전시·카페",en:"Exhibitions & cafés",zh:"展览·咖啡",ja:"展示・カフェ",fr:"Expositions et cafés"}, coordinate:[35.1765,129.1158] },
  { id:"science-museum", names:{ko:"국립부산과학관",en:"Busan National Science Museum",zh:"国立釜山科学馆",ja:"国立釜山科学館",fr:"Musée national des sciences de Busan"}, category:{ko:"실내 과학관",en:"Indoor science museum",zh:"室内科学馆",ja:"屋内科学館",fr:"Musée scientifique couvert"}, coordinate:[35.2048,129.2125] },
  { id:"beomeosa", names:{ko:"범어사",en:"Beomeosa Temple",zh:"梵鱼寺",ja:"梵魚寺",fr:"Temple Beomeosa"}, category:{ko:"사찰·숲",en:"Temple & forest",zh:"寺院·森林",ja:"寺院・森",fr:"Temple et forêt"}, coordinate:[35.2836,129.0687] },
  { id:"modern-art", names:{ko:"부산현대미술관",en:"Museum of Contemporary Art Busan",zh:"釜山现代美术馆",ja:"釜山現代美術館",fr:"Musée d'art contemporain de Busan"}, category:{ko:"실내 미술관",en:"Indoor art museum",zh:"室内美术馆",ja:"屋内美術館",fr:"Musée d'art couvert"}, coordinate:[35.1099,128.9420] },
  { id:"bokcheon", names:{ko:"복천박물관",en:"Bokcheon Museum",zh:"福泉博物馆",ja:"福泉博物館",fr:"Musée de Bokcheon"}, category:{ko:"역사 박물관",en:"History museum",zh:"历史博物馆",ja:"歴史博物館",fr:"Musée d'histoire"}, coordinate:[35.2073,129.0916] },
  { id:"gijang-market", names:{ko:"기장시장",en:"Gijang Market",zh:"机张市场",ja:"機張市場",fr:"Marché de Gijang"}, category:{ko:"전통시장",en:"Traditional market",zh:"传统市场",ja:"伝統市場",fr:"Marché traditionnel"}, coordinate:[35.2445,129.2140] },
];

const beachCenters:Record<string,[number,number]>={
  "해운대":[35.1587,129.1604],"광안리":[35.1531,129.1186],"송정":[35.1798,129.1997],"송도":[35.0765,129.0172],"다대포":[35.0483,128.9652],"일광":[35.2633,129.2338],"임랑":[35.3197,129.2659],
};

const fallbackReason: Record<Lang,string> = {
  ko:"선택한 해수욕장에서 비교적 가깝고 바닷가가 아닌 부산 명소예요.",
  en:"A relatively nearby Busan attraction from the selected beach, away from the seaside.",
  zh:"这是距离所选海滩较近且不在海边的釜山景点。",
  ja:"選択したビーチから比較的近く、海辺ではない釜山のスポットです。",
  fr:"Un lieu de Busan relativement proche de la plage sélectionnée, mais éloigné du bord de mer.",
};

const categoryLabels:Record<string,Record<Lang,string>>={
  museum:{ko:"박물관",en:"Museum",zh:"博物馆",ja:"博物館",fr:"Musée"},gallery:{ko:"전시·미술관",en:"Gallery",zh:"展览·美术馆",ja:"展示・美術館",fr:"Galerie"},attraction:{ko:"관광 명소",en:"Attraction",zh:"旅游景点",ja:"観光スポット",fr:"Attraction"},theme_park:{ko:"테마파크",en:"Theme park",zh:"主题公园",ja:"テーマパーク",fr:"Parc à thème"},library:{ko:"도서관",en:"Library",zh:"图书馆",ja:"図書館",fr:"Bibliothèque"},arts_centre:{ko:"문화예술 공간",en:"Arts centre",zh:"文化艺术空间",ja:"文化芸術施設",fr:"Centre artistique"},theatre:{ko:"공연장",en:"Theatre",zh:"剧院",ja:"劇場",fr:"Théâtre"},cinema:{ko:"영화관",en:"Cinema",zh:"电影院",ja:"映画館",fr:"Cinéma"},marketplace:{ko:"전통시장",en:"Local market",zh:"传统市场",ja:"伝統市場",fr:"Marché local"},community_centre:{ko:"지역 문화공간",en:"Community centre",zh:"社区文化空间",ja:"地域文化施設",fr:"Centre communautaire"},exhibition_centre:{ko:"전시 공간",en:"Exhibition centre",zh:"展览空间",ja:"展示施設",fr:"Centre d’exposition"},historic:{ko:"역사 명소",en:"Historic site",zh:"历史景点",ja:"歴史スポット",fr:"Site historique"},
};

// Curated non-coastal places near Busan's outer beaches. This local list keeps
// results nearby even when a public map data service is slow or unavailable.
candidates.push(
  {id:"dadae-library",names:{ko:"다대도서관",en:"Dadae Library",zh:"多大图书馆",ja:"多大図書館",fr:"Bibliothèque de Dadae"},category:categoryLabels.library,coordinate:[35.0568462,128.9608508]},
  {id:"hongti-art-village",names:{ko:"홍티예술촌",en:"Hongti Art Village",zh:"虹堤艺术村",ja:"ホンティ芸術村",fr:"Village artistique de Hongti"},category:categoryLabels.arts_centre,coordinate:[35.0659848,128.9596879]},
  {id:"eulsukdo-culture-center",names:{ko:"을숙도문화회관",en:"Eulsukdo Cultural Center",zh:"乙淑岛文化会馆",ja:"乙淑島文化会館",fr:"Centre culturel d'Eulsukdo"},category:categoryLabels.arts_centre,coordinate:[35.1091728,128.9487589]},
  {id:"nakdong-eco-center",names:{ko:"낙동강하구에코센터",en:"Nakdong Estuary Eco Center",zh:"洛东江河口生态中心",ja:"洛東江河口エコセンター",fr:"Centre écologique de l'estuaire du Nakdong"},category:categoryLabels.museum,coordinate:[35.1090,128.9474]},
  {id:"gijang-library",names:{ko:"기장도서관",en:"Gijang Library",zh:"机张图书馆",ja:"機張図書館",fr:"Bibliothèque de Gijang"},category:categoryLabels.library,coordinate:[35.2496830,129.2173018]},
  {id:"lotte-world-busan",names:{ko:"롯데월드 어드벤처 부산",en:"Lotte World Adventure Busan",zh:"釜山乐天世界冒险乐园",ja:"ロッテワールド・アドベンチャー釜山",fr:"Lotte World Adventure Busan"},category:categoryLabels.theme_park,coordinate:[35.1969,129.2140]},
  {id:"skyline-luge-busan",names:{ko:"스카이라인 루지 부산",en:"Skyline Luge Busan",zh:"釜山天际线斜坡滑车",ja:"スカイライン・リュージュ釜山",fr:"Skyline Luge Busan"},category:categoryLabels.attraction,coordinate:[35.1938,129.2121]},
  {id:"gamgol-theater",names:{ko:"가마골소극장",en:"Gamagol Small Theater",zh:"伽马谷小剧场",ja:"カマゴル小劇場",fr:"Petit théâtre Gamagol"},category:categoryLabels.theatre,coordinate:[35.2676070,129.2348550]},
  {id:"park-taejoon-memorial",names:{ko:"박태준기념관",en:"Park Tae-joon Memorial Hall",zh:"朴泰俊纪念馆",ja:"朴泰俊記念館",fr:"Mémorial Park Tae-joon"},category:categoryLabels.museum,coordinate:[35.3168230,129.2611808]},
  {id:"gori-sports-center",names:{ko:"고리스포츠문화센터",en:"Gori Sports and Culture Center",zh:"古里体育文化中心",ja:"古里スポーツ文化センター",fr:"Centre sportif et culturel de Gori"},category:categoryLabels.community_centre,coordinate:[35.3301021,129.2843527]},
  {id:"daeryong-history-museum",names:{ko:"대룡역사박물관",en:"Daeryong History Museum",zh:"大龙历史博物馆",ja:"大龍歴史博物館",fr:"Musée d'histoire de Daeryong"},category:categoryLabels.museum,coordinate:[35.3708212,129.2639980]},
  {id:"jeonggwan-museum",names:{ko:"정관박물관",en:"Jeonggwan Museum",zh:"鼎冠博物馆",ja:"鼎冠博物館",fr:"Musée de Jeonggwan"},category:categoryLabels.museum,coordinate:[35.3271147,129.1833929]},
  {id:"jangansa",names:{ko:"장안사",en:"Jangansa Temple",zh:"长安寺",ja:"長安寺",fr:"Temple Jangansa"},category:categoryLabels.historic,coordinate:[35.3743156,129.2329808]},
  {id:"busan-art-museum",names:{ko:"부산시립미술관",en:"Busan Museum of Art",zh:"釜山市立美术馆",ja:"釜山市立美術館",fr:"Musée d'art de Busan"},category:categoryLabels.gallery,coordinate:[35.1668,129.1370]},
  {id:"museum-one",names:{ko:"뮤지엄 원",en:"Museum One",zh:"Museum One美术馆",ja:"ミュージアム・ワン",fr:"Musée One"},category:categoryLabels.gallery,coordinate:[35.1717,129.1287]},
  {id:"busan-design-center",names:{ko:"부산디자인진흥원",en:"Design Council Busan",zh:"釜山设计振兴院",ja:"釜山デザイン振興院",fr:"Centre du design de Busan"},category:categoryLabels.arts_centre,coordinate:[35.1743,129.1269]}
);

const allowedOrigins = new Set([
  "https://kkandol2010-blip.github.io",
  "https://tteubadaba-busan.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
]);

const requestLog = new Map<string, number[]>();

function distanceKm(a:[number,number], b:[number,number]) {
  const rad=(value:number)=>value*Math.PI/180;
  const dLat=rad(b[0]-a[0]), dLon=rad(b[1]-a[1]);
  const x=Math.sin(dLat/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dLon/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

function setCors(req:any,res:any) {
  const origin=String(req.headers.origin||"");
  if (allowedOrigins.has(origin)||origin.endsWith(".vercel.app")) res.setHeader("Access-Control-Allow-Origin",origin);
  res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
}

export default async function handler(req:any,res:any) {
  setCors(req,res);
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  const ip=String(req.headers["x-forwarded-for"]||req.socket?.remoteAddress||"unknown").split(",")[0];
  const now=Date.now(), recent=(requestLog.get(ip)||[]).filter(time=>now-time<60_000);
  if(recent.length>=8) return res.status(429).json({error:"잠시 후 다시 시도해 주세요."});
  recent.push(now); requestLog.set(ip,recent);

  try {
    const body=typeof req.body==="string"?JSON.parse(req.body):req.body||{};
    const latitude=Number(body.latitude), longitude=Number(body.longitude);
    const lang:Lang=["ko","en","zh","ja","fr"].includes(body.lang)?body.lang:"ko";
    if(!Number.isFinite(latitude)||!Number.isFinite(longitude)) return res.status(400).json({error:"위치 정보가 필요합니다."});

    const beachName=String(body.beach||"").slice(0,40),recommendationOrigin=beachCenters[beachName]??[latitude,longitude] as [number,number];
    const radiusMeters=["일광","임랑"].includes(beachName)?10000:["다대포","송도","송정"].includes(beachName)?8000:7000,seenNames=new Set<string>();
    const pool=candidates.map(place=>({...place,distanceKm:distanceKm(recommendationOrigin,place.coordinate)})).filter(place=>place.distanceKm<=radiusMeters/1000).filter(place=>{const name=place.names.ko.replace(/\s/g,"").toLowerCase();if(seenNames.has(name))return false;seenNames.add(name);return true}).sort((a,b)=>a.distanceKm-b.distanceKm);
    const excluded=new Set(Array.isArray(body.excludeIds)?body.excludeIds.filter((id:any)=>typeof id==="string").slice(0,12):[]);
    const fresh=pool.filter(place=>!excluded.has(place.id)),repeated=pool.filter(place=>excluded.has(place.id));
    const nearest=[...fresh,...repeated].slice(0,3);
    if(nearest.length===0)return res.status(404).json({error:"선택한 해수욕장 가까이에서 추천 장소를 찾지 못했습니다."});
    const key=process.env.GEMINI_API_KEY;
    let chosen=nearest.map(place=>({id:place.id,reason:fallbackReason[lang]}));
    let aiUsed=false;

    if(key){
      const prompt=`You are a concise Busan travel assistant. Recommend exactly these ${nearest.length} places near the user's selected beach (${beachName}). The user explicitly does not want a beach, seaside promenade, coastal viewpoint, harbor, lighthouse, or water activity. Distances are measured from the selected beach and all candidates are within ${radiusMeters/1000} km. Write each reason in language code ${lang}, in one short sentence. Return JSON only as {"recommendations":[{"id":"candidate-id","reason":"..."}]}. Candidates: ${JSON.stringify(nearest.map(p=>({id:p.id,name:p.names[lang],category:p.category[lang],distanceKm:Number(p.distanceKm.toFixed(1))})))}.`;
      const gemini=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-goog-api-key":key},
        body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:"application/json",maxOutputTokens:500}}),
      });
      if(gemini.ok){
        const data:any=await gemini.json();
        const raw=data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed=raw?JSON.parse(raw):null;
        const valid=Array.isArray(parsed?.recommendations)?parsed.recommendations.filter((item:any)=>nearest.some(p=>p.id===item.id)&&typeof item.reason==="string").slice(0,3):[];
        if(valid.length===nearest.length){chosen=valid;aiUsed=true;}
      }
    }

    const recommendations=chosen.map(item=>{
      const place=nearest.find(candidate=>candidate.id===item.id)!;
      return {id:place.id,name:place.names[lang],photoTitle:place.names.ko,category:place.category[lang],coordinate:place.coordinate,distanceKm:Number(place.distanceKm.toFixed(1)),reason:item.reason,mapsUrl:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.names.ko)}`};
    });
    return res.status(200).json({recommendations,aiUsed});
  } catch {
    return res.status(500).json({error:"추천을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."});
  }
}
