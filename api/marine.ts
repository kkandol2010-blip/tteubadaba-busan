type JellyRisk = "safe" | "caution" | "danger" | "unknown";
type ApiRequest = { method?: string; query: Record<string, string | string[] | undefined> };
type ApiResponse = { setHeader(name: string, value: string): void; status(code: number): ApiResponse; json(value: unknown): ApiResponse };

const BEACHES: Record<string, { district: string; stationCode: string; stationName: string }> = {
  haeundae: { district: "해운대구", stationCode: "TW_0062", stationName: "해운대해수욕장" },
  gwangalli: { district: "수영구", stationCode: "TW_0062", stationName: "해운대해수욕장" },
  songjeong: { district: "해운대구", stationCode: "TW_0090", stationName: "송정해수욕장" },
  songdo: { district: "서구", stationCode: "TW_0087", stationName: "부산항" },
  dadaepo: { district: "사하구", stationCode: "TW_0087", stationName: "부산항" },
  ilgwang: { district: "기장군", stationCode: "TW_0092", stationName: "임랑해수욕장" },
  imrang: { district: "기장군", stationCode: "TW_0092", stationName: "임랑해수욕장" },
};

const NIFS_LIST = "https://www.nifs.go.kr/board/actionJellyList.do";
const KHOA_API = "https://apis.data.go.kr/1192136/twRecent/GetTWRecentApiService";
const CACHE_MS = 15 * 60 * 1000;
let jellyCache: { expires: number; reportTitle: string; reportUrl: string; reportDate: string | null; text: string } | null = null;

function dateInSeoul() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}${value.month}${value.day}`;
}

function findNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function findObjects(value: unknown, found: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) value.forEach(item => findObjects(item, found));
  else if (value && typeof value === "object") {
    found.push(value as Record<string, unknown>);
    Object.values(value as Record<string, unknown>).forEach(item => findObjects(item, found));
  }
  return found;
}

async function fetchWave(stationCode: string) {
  const key = process.env.DATA_GO_KR_API_KEY?.trim();
  if (!key) return { height: null, observedAt: null, configured: false };

  const query = new URLSearchParams({ obsCode: stationCode, obsDate: dateInSeoul(), interval: "30", numOfRows: "100", pageNo: "1", resultType: "json", _type: "json" });
  const response = await fetch(`${KHOA_API}?serviceKey=${key}&${query}`, { signal: AbortSignal.timeout(9000) });
  if (!response.ok) throw new Error(`KHOA ${response.status}`);
  const body = await response.text();
  if (/SERVICE_(ACCESS_DENIED|KEY_IS_NOT_REGISTERED|KEY_IS_NULL)|PERMISSION_DENIED/i.test(body)) throw new Error("KHOA key");

  let height: number | null = null;
  let observedAt: string | null = null;
  try {
    const json = JSON.parse(body);
    const candidates = findObjects(json);
    const waveKeys = ["wave_height", "waveHeight", "significant_wave_height", "significantWaveHeight", "swh", "wh"];
    const timeKeys = ["record_time", "recordTime", "obs_time", "obsTime", "observed_at", "data_time"];
    for (const item of candidates.reverse()) {
      const value = waveKeys.map(name => findNumber(item[name])).find(number => number !== null);
      if (value !== undefined && value !== null) {
        height = value;
        observedAt = String(timeKeys.map(name => item[name]).find(Boolean) ?? "") || null;
        break;
      }
    }
  } catch {
    const match = body.match(/<(?:wave_height|waveHeight|significant_wave_height|swh|wh)>([0-9.]+)<\//i);
    height = match ? findNumber(match[1]) : null;
    observedAt = body.match(/<(?:record_time|recordTime|obs_time|obsTime)>([^<]+)<\//i)?.[1] ?? null;
  }
  return { height, observedAt, configured: true };
}

async function latestJellyReport() {
  if (jellyCache && jellyCache.expires > Date.now()) return jellyCache;
  const listHtml = await (await fetch(NIFS_LIST, { signal: AbortSignal.timeout(9000) })).text();
  const link = listHtml.match(/href="\.\/actionJellyView\.do\?([^"]+)">([^<]*주간보고[^<]*)<\/a>/);
  if (!link) throw new Error("NIFS report not found");
  const reportUrl = `https://www.nifs.go.kr/board/actionJellyView.do?${link[1].replace(/&amp;/g, "&")}`;
  const reportHtml = await (await fetch(reportUrl, { signal: AbortSignal.timeout(9000) })).text();
  const file = reportHtml.match(/href="([^"]*fileDownloadStat\.do\?FILE_ID=[^"]+)"/);
  if (!file) throw new Error("NIFS PDF not found");
  const pdfUrl = new URL(file[1].replace(/&amp;/g, "&"), "https://www.nifs.go.kr").toString();
  const pdfData = Buffer.from(await (await fetch(pdfUrl, { signal: AbortSignal.timeout(12000) })).arrayBuffer());
  const { default: parsePdf } = await import("pdf-parse/lib/pdf-parse.js");
  const parsed = await parsePdf(pdfData);
  const text = parsed.text;
  const reportDate = link[2].match(/20\d{2}[.-]\d{2}[.-]\d{2}/)?.[0]?.replace(/\./g, "-") ?? null;
  jellyCache = { expires: Date.now() + CACHE_MS, reportTitle: link[2].trim(), reportUrl, reportDate, text: text.replace(/\s+/g, " ") };
  return jellyCache;
}

function jellyForDistrict(text: string, district: string): { risk: JellyRisk; present: boolean; density: "high" | "low" | null } {
  const needle = `부산광역시 ${district}`;
  let cursor = 0;
  let high = false;
  let low = false;
  while ((cursor = text.indexOf(needle, cursor)) >= 0) {
    const context = text.slice(Math.max(0, cursor - 700), cursor);
    const highIndex = context.lastIndexOf("고밀도 출현 해역");
    const lowIndex = context.lastIndexOf("저밀도 출현 해역");
    if (highIndex > lowIndex) high = true;
    else if (lowIndex >= 0) low = true;
    cursor += needle.length;
  }
  if (high) return { risk: "danger", present: true, density: "high" };
  if (low) return { risk: "caution", present: true, density: "low" };
  return { risk: "safe", present: false, density: null };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const id = Array.isArray(req.query.beach) ? req.query.beach[0] : req.query.beach;
  const beach = id ? BEACHES[id] : null;
  if (!beach) return res.status(400).json({ error: "Unknown beach" });

  const [waveResult, jellyResult] = await Promise.allSettled([fetchWave(beach.stationCode), latestJellyReport()]);
  const wave = waveResult.status === "fulfilled" ? waveResult.value : { height: null, observedAt: null, configured: Boolean(process.env.DATA_GO_KR_API_KEY) };
  const report = jellyResult.status === "fulfilled" ? jellyResult.value : null;
  const jelly = report ? jellyForDistrict(report.text, beach.district) : { risk: "unknown" as JellyRisk, present: false, density: null };

  return res.status(200).json({
    beach: id,
    sand: { temperature: null, status: "unavailable", source: "부산 해수욕장 모래 표면온도 공식 실시간 관측자료 없음" },
    wave: { height: wave.height, observedAt: wave.observedAt, station: beach.stationName, stationCode: beach.stationCode, configured: wave.configured, source: "국립해양조사원 해양관측부이 최신 관측데이터" },
    jellyfish: { ...jelly, area: jelly.present ? `부산광역시 ${beach.district}` : "출현 보고 없음", reportDate: report?.reportDate ?? null, reportTitle: report?.reportTitle ?? null, sourceUrl: report?.reportUrl ?? NIFS_LIST, source: "국립수산과학원 해파리 모니터링 주간보고" },
  });
}
