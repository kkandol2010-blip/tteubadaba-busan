const placePages:Record<string,{title:string;commonsSearch?:string}>={
  "citizens-park":{title:"부산시민공원"},
  "gamcheon":{title:"감천문화마을"},
  "busan-tower":{title:"부산타워"},
  "gukje-market":{title:"국제시장"},
  "busan-museum":{title:"부산박물관"},
  "cinema-center":{title:"영화의전당"},
  "f1963":{title:"F1963"},
  "science-museum":{title:"국립부산과학관"},
  "beomeosa":{title:"범어사"},
  "modern-art":{title:"부산현대미술관",commonsSearch:"부산현대미술관"},
  "bokcheon":{title:"복천박물관"},
  "gijang-market":{title:"기장시장"},
  "dadae-library":{title:"다대도서관",commonsSearch:"Dadae Library Busan"},
  "hongti-art-village":{title:"홍티예술촌",commonsSearch:"Hongti Art Village Busan"},
  "eulsukdo-culture-center":{title:"을숙도문화회관",commonsSearch:"Eulsukdo Cultural Center"},
  "nakdong-eco-center":{title:"낙동강하구에코센터",commonsSearch:"Nakdong Estuary Eco Center"},
  "gijang-library":{title:"기장도서관",commonsSearch:"Gijang Library Busan"},
  "lotte-world-busan":{title:"롯데월드 어드벤처 부산",commonsSearch:"Lotte World Adventure Busan"},
  "skyline-luge-busan":{title:"스카이라인 루지 부산",commonsSearch:"Skyline Luge Busan"},
  "gamgol-theater":{title:"가마골소극장",commonsSearch:"Gamagol Theater Busan"},
  "park-taejoon-memorial":{title:"박태준기념관",commonsSearch:"Park Tae-joon Memorial Hall"},
  "gori-sports-center":{title:"고리스포츠문화센터",commonsSearch:"Gori Sports Culture Center"},
  "daeryong-history-museum":{title:"대룡역사박물관",commonsSearch:"Daeryong History Museum"},
  "jeonggwan-museum":{title:"정관박물관",commonsSearch:"Jeonggwan Museum Busan"},
  "jangansa":{title:"장안사",commonsSearch:"Jangansa Temple Busan"},
  "busan-art-museum":{title:"부산시립미술관",commonsSearch:"Busan Museum of Art"},
  "museum-one":{title:"뮤지엄 원",commonsSearch:"Museum One Busan"},
  "busan-design-center":{title:"부산디자인진흥원",commonsSearch:"Design Council Busan"},
};

const allowedOrigins=new Set(["https://kkandol2010-blip.github.io","https://tteubadaba-busan.vercel.app","http://localhost:3000","http://localhost:5173"]);
const requestLog=new Map<string,number[]>();
const userAgent="TteubadabaBusan/1.0 (https://tteubadaba-busan.vercel.app/)";

function setCors(req:any,res:any){
  const origin=String(req.headers.origin||"");
  if(allowedOrigins.has(origin)||origin.endsWith(".vercel.app"))res.setHeader("Access-Control-Allow-Origin",origin);
  res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Methods","GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
}

function firstPage(data:any){return data?.query?.pages?Object.values(data.query.pages)[0] as any:null}
function plain(value:string|undefined){return String(value||"").replace(/<[^>]*>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#039;/g,"'").trim()}

async function commonsPhoto(fileTitle:string){
  const params=new URLSearchParams({action:"query",format:"json",origin:"*",prop:"imageinfo",iiprop:"url|extmetadata",iiurlwidth:"900",titles:fileTitle});
  const response=await fetch(`https://commons.wikimedia.org/w/api.php?${params}`,{headers:{"User-Agent":userAgent}});
  if(!response.ok)return null;
  const page=firstPage(await response.json());
  const image=page?.imageinfo?.[0];
  if(!image?.thumburl&&!image?.url)return null;
  const metadata=image.extmetadata||{},artist=plain(metadata.Artist?.value),license=plain(metadata.LicenseShortName?.value||metadata.UsageTerms?.value);
  return {photoUri:image.thumburl||image.url,attribution:{name:[artist,license].filter(Boolean).join(" · ")||"Wikimedia Commons",uri:image.descriptionurl||"https://commons.wikimedia.org/"}};
}

async function searchedCommonsPhoto(query:string){
  const params=new URLSearchParams({action:"query",format:"json",origin:"*",generator:"search",gsrnamespace:"6",gsrlimit:"1",gsrsearch:query,prop:"imageinfo",iiprop:"url|extmetadata",iiurlwidth:"900"});
  const response=await fetch(`https://commons.wikimedia.org/w/api.php?${params}`,{headers:{"User-Agent":userAgent}});
  if(!response.ok)return null;
  const page=firstPage(await response.json()),image=page?.imageinfo?.[0];
  if(!image?.thumburl&&!image?.url)return null;
  const metadata=image.extmetadata||{},artist=plain(metadata.Artist?.value),license=plain(metadata.LicenseShortName?.value||metadata.UsageTerms?.value);
  return {photoUri:image.thumburl||image.url,attribution:{name:[artist,license].filter(Boolean).join(" · ")||"Wikimedia Commons",uri:image.descriptionurl||"https://commons.wikimedia.org/"}};
}

export default async function handler(req:any,res:any){
  setCors(req,res);
  res.setHeader("Cache-Control","public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
  if(req.method==="OPTIONS")return res.status(204).end();
  if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});

  const ip=String(req.headers["x-forwarded-for"]||req.socket?.remoteAddress||"unknown").split(",")[0];
  const now=Date.now(),recent=(requestLog.get(ip)||[]).filter(time=>now-time<60_000);
  if(recent.length>=20)return res.status(429).json({error:"잠시 후 다시 시도해 주세요."});
  recent.push(now);requestLog.set(ip,recent);

  const requestedId=String(req.query?.id||""),requestedTitle=String(req.query?.title||"").trim().slice(0,80);
  const place=placePages[requestedId]||(requestedId.startsWith("osm-")&&requestedTitle?{title:requestedTitle}:null);
  if(!place)return res.status(400).json({error:"지원하지 않는 장소입니다."});

  try{
    const params=new URLSearchParams({action:"query",format:"json",origin:"*",redirects:"1",prop:"pageimages|info",inprop:"url",piprop:"name|thumbnail",pithumbsize:"900",titles:place.title});
    const response=await fetch(`https://ko.wikipedia.org/w/api.php?${params}`,{headers:{"User-Agent":userAgent}});
    if(!response.ok)throw new Error("Wikipedia unavailable");
    const page=firstPage(await response.json());

    if(page?.pageimage){
      const fromCommons=await commonsPhoto(`File:${page.pageimage}`);
      if(fromCommons)return res.status(200).json(fromCommons);
    }
    if(page?.thumbnail?.source)return res.status(200).json({photoUri:page.thumbnail.source,attribution:{name:"한국어 위키백과",uri:page.fullurl||"https://ko.wikipedia.org/"}});
    if(place.commonsSearch){
      const searched=await searchedCommonsPhoto(place.commonsSearch);
      if(searched)return res.status(200).json(searched);
    }
    return res.status(404).json({error:"공개 사진을 찾지 못했습니다."});
  }catch{
    return res.status(500).json({error:"장소 사진을 불러오지 못했습니다."});
  }
}
