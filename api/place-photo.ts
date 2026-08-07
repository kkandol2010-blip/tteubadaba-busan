const placeQueries:Record<string,{query:string;coordinate:[number,number]}>= {
  "citizens-park":{query:"부산시민공원",coordinate:[35.1668,129.0556]},
  "gamcheon":{query:"감천문화마을",coordinate:[35.0975,129.0106]},
  "busan-tower":{query:"부산타워 용두산공원",coordinate:[35.1012,129.0324]},
  "gukje-market":{query:"부산 국제시장",coordinate:[35.1028,129.0289]},
  "busan-museum":{query:"부산박물관",coordinate:[35.1296,129.0913]},
  "cinema-center":{query:"영화의전당 부산",coordinate:[35.1712,129.1270]},
  "f1963":{query:"F1963 부산",coordinate:[35.1765,129.1158]},
  "science-museum":{query:"국립부산과학관",coordinate:[35.2048,129.2125]},
  "beomeosa":{query:"범어사 부산",coordinate:[35.2836,129.0687]},
  "modern-art":{query:"부산현대미술관",coordinate:[35.1099,128.9420]},
  "bokcheon":{query:"복천박물관",coordinate:[35.2073,129.0916]},
  "gijang-market":{query:"기장시장 부산",coordinate:[35.2445,129.2140]},
};

const allowedOrigins=new Set(["https://kkandol2010-blip.github.io","https://tteubadaba-busan.vercel.app","http://localhost:3000","http://localhost:5173"]);
const requestLog=new Map<string,number[]>();

function setCors(req:any,res:any){
  const origin=String(req.headers.origin||"");
  if(allowedOrigins.has(origin)||origin.endsWith(".vercel.app"))res.setHeader("Access-Control-Allow-Origin",origin);
  res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Methods","GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
}

export default async function handler(req:any,res:any){
  setCors(req,res);
  res.setHeader("Cache-Control","no-store");
  if(req.method==="OPTIONS")return res.status(204).end();
  if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});

  const ip=String(req.headers["x-forwarded-for"]||req.socket?.remoteAddress||"unknown").split(",")[0];
  const now=Date.now(),recent=(requestLog.get(ip)||[]).filter(time=>now-time<60_000);
  if(recent.length>=12)return res.status(429).json({error:"잠시 후 다시 시도해 주세요."});
  recent.push(now);requestLog.set(ip,recent);

  const place=placeQueries[String(req.query?.id||"")];
  if(!place)return res.status(400).json({error:"지원하지 않는 장소입니다."});
  const key=process.env.GOOGLE_MAPS_API_KEY||process.env.GEMINI_API_KEY;
  if(!key)return res.status(503).json({error:"Google Places API key is not configured"});

  try{
    const search=await fetch("https://places.googleapis.com/v1/places:searchText",{
      method:"POST",
      headers:{"Content-Type":"application/json","X-Goog-Api-Key":key,"X-Goog-FieldMask":"places.photos"},
      body:JSON.stringify({textQuery:place.query,languageCode:"ko",locationBias:{circle:{center:{latitude:place.coordinate[0],longitude:place.coordinate[1]},radius:3000}}}),
    });
    if(!search.ok)return res.status(502).json({error:"Google Places API unavailable",code:search.status});
    const searchData:any=await search.json();
    const photo=searchData?.places?.[0]?.photos?.[0];
    if(!photo?.name)return res.status(404).json({error:"장소 사진이 없습니다."});

    const media=await fetch(`https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=900&skipHttpRedirect=true&key=${encodeURIComponent(key)}`);
    if(!media.ok)return res.status(502).json({error:"Google Place photo unavailable",code:media.status});
    const mediaData:any=await media.json();
    if(!mediaData?.photoUri)return res.status(404).json({error:"장소 사진이 없습니다."});

    const attribution=photo.authorAttributions?.[0];
    return res.status(200).json({photoUri:mediaData.photoUri,attribution:attribution?{name:attribution.displayName||"Google Maps contributor",uri:attribution.uri||null}:null});
  }catch{
    return res.status(500).json({error:"장소 사진을 불러오지 못했습니다."});
  }
}
