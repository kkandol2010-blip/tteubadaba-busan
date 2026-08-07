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

const fallbackReason: Record<Lang,string> = {
  ko:"현재 위치에서 비교적 가깝고 바닷가가 아닌 부산 명소예요.",
  en:"A relatively nearby Busan attraction away from the beach.",
  zh:"这是距离当前位置较近且不在海边的釜山景点。",
  ja:"現在地から比較的近く、海辺ではない釜山のスポットです。",
  fr:"Un lieu de Busan relativement proche et éloigné de la plage.",
};

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

    const nearest=candidates.map(place=>({...place,distanceKm:distanceKm([latitude,longitude],place.coordinate)})).sort((a,b)=>a.distanceKm-b.distanceKm).slice(0,5);
    const key=process.env.GEMINI_API_KEY;
    let chosen=nearest.slice(0,3).map(place=>({id:place.id,reason:fallbackReason[lang]}));
    let aiUsed=false;

    if(key){
      const prompt=`You are a concise Busan travel assistant. Select exactly 3 places from the supplied candidates. The user explicitly does not want a beach, seaside promenade, coastal viewpoint, or water activity. Prefer short travel distance and variety. Write each reason in language code ${lang}, in one short sentence. Return JSON only as {"recommendations":[{"id":"candidate-id","reason":"..."}]}. Candidates: ${JSON.stringify(nearest.map(p=>({id:p.id,name:p.names[lang],category:p.category[lang],distanceKm:Number(p.distanceKm.toFixed(1))})))}. Current selected beach context: ${String(body.beach||"").slice(0,40)}.`;
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
        if(valid.length===3){chosen=valid;aiUsed=true;}
      }
    }

    const recommendations=chosen.map(item=>{
      const place=nearest.find(candidate=>candidate.id===item.id)!;
      return {id:place.id,name:place.names[lang],category:place.category[lang],distanceKm:Number(place.distanceKm.toFixed(1)),reason:item.reason,mapsUrl:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.names.ko)}`};
    });
    return res.status(200).json({recommendations,aiUsed});
  } catch {
    return res.status(500).json({error:"추천을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."});
  }
}
