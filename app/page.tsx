"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Lang = "ko" | "en" | "zh" | "ja" | "fr";
type Risk = "safe" | "caution" | "danger";

type Beach = {
  id: string;
  ko: string;
  en: string;
  district: string;
  sand: number;
  wave: number;
  jelly: Risk;
  jellyArea: string;
  shade: { name: string; detail: string; walk: number }[];
};

const BEACHES: Beach[] = [
  { id: "haeundae", ko: "해운대", en: "Haeundae", district: "해운대구", sand: 42, wave: 0.8, jelly: "caution", jellyArea: "미포 방파제 인근", shade: [{ name: "해운대 광장 그늘막", detail: "5번 망루 뒤편", walk: 2 }, { name: "동백섬 산책로", detail: "수목 그늘 구간", walk: 7 }] },
  { id: "gwangalli", ko: "광안리", en: "Gwangalli", district: "수영구", sand: 39, wave: 0.5, jelly: "safe", jellyArea: "관측 없음", shade: [{ name: "만남의 광장", detail: "중앙 음수대 옆", walk: 3 }, { name: "민락수변공원", detail: "해변 북쪽 수목 구간", walk: 8 }] },
  { id: "songjeong", ko: "송정", en: "Songjeong", district: "해운대구", sand: 44, wave: 1.4, jelly: "caution", jellyArea: "죽도공원 앞 수역", shade: [{ name: "죽도공원 입구", detail: "송일정 아래 수목", walk: 5 }, { name: "중앙 안내소", detail: "3번 망루 맞은편", walk: 2 }] },
  { id: "songdo", ko: "송도", en: "Songdo", district: "서구", sand: 38, wave: 0.4, jelly: "safe", jellyArea: "관측 없음", shade: [{ name: "송림공원", detail: "케이블카 하부 소나무숲", walk: 4 }, { name: "분수광장 차양", detail: "중앙 안내소 옆", walk: 2 }] },
  { id: "dadaepo", ko: "다대포", en: "Dadaepo", district: "사하구", sand: 41, wave: 0.7, jelly: "danger", jellyArea: "몰운대 입구·낙동강 하구", shade: [{ name: "해변공원 소나무숲", detail: "꿈의 낙조분수 서편", walk: 5 }, { name: "생태탐방로 쉼터", detail: "고우니길 2번 데크", walk: 9 }] },
  { id: "ilgwang", ko: "일광", en: "Ilgwang", district: "기장군", sand: 43, wave: 1.0, jelly: "caution", jellyArea: "학리항 인근", shade: [{ name: "이천쉼터", detail: "해변 남쪽 산책로", walk: 8 }, { name: "중앙 안내소 차양", detail: "해변 진입광장", walk: 2 }] },
  { id: "imrang", ko: "임랑", en: "Imrang", district: "기장군", sand: 37, wave: 0.6, jelly: "safe", jellyArea: "관측 없음", shade: [{ name: "임랑행정봉사실", detail: "해변 중앙 쉼터", walk: 3 }, { name: "임랑공원 수목", detail: "해변 주차장 맞은편", walk: 6 }] },
];

const copy: Record<Lang, Record<string, string>> = {
  ko: { choose: "언어를 선택해 주세요", chooseSub: "부산 바다를 더 안전하고 시원하게 즐겨요", start: "시작하기", live: "부산 해변 안전 가이드", heroTag: "오늘의 부산 바다", hero: "뜨거우면,\n딴 바다로.", heroSub: "모래 온도부터 파도, 해파리, 그늘까지\n출발 전 꼭 필요한 것만 확인하세요.", beaches: "해수욕장 한눈에 보기", all: "전체", safe: "안전", caution: "주의", danger: "위험", sand: "모래 온도", wave: "파도 높이", jelly: "해파리", shade: "가까운 그늘", min: "분", ago: "도보", selected: "선택한 해수욕장", monitor: "햇빛 노출 타이머", monitorSub: "현재 위치를 확인하고 햇빛에 머문 시간을 알려드려요.", locate: "위치 확인 후 시작", pause: "잠시 멈춤", resume: "다시 시작", reset: "초기화", notify: "알림 허용", exposure: "노출 시간", next: "다음 알림", firstAid: "해파리에 쏘였다면", alternatives: "오늘 바다가 힘들다면", viewAlt: "다른 활동 보기", back: "바다 현황으로", updated: "오늘 14:10 기준 · 시연용 데이터", disclaimer: "실제 방문 전 현장 안전요원과 공식 기상 정보를 확인하세요.", statusSafe: "방문 좋아요", statusCaution: "주의 필요", statusDanger: "방문 비추천", navBeach: "해변", navTimer: "타이머", navAid: "응급처치" },
  en: { choose: "Choose your language", chooseSub: "Enjoy Busan’s beaches safely and comfortably", start: "Continue", live: "Busan beach safety guide", heroTag: "Busan beaches today", hero: "Too hot?\nTry another coast.", heroSub: "Check sand heat, waves, jellyfish and shade\nbefore you head out.", beaches: "All beaches at a glance", all: "All", safe: "Safe", caution: "Caution", danger: "Danger", sand: "Sand temp.", wave: "Wave height", jelly: "Jellyfish", shade: "Nearby shade", min: "min", ago: "walk", selected: "Selected beach", monitor: "Sun exposure timer", monitorSub: "Use your location and get reminders while you stay in the sun.", locate: "Locate & start", pause: "Pause", resume: "Resume", reset: "Reset", notify: "Allow alerts", exposure: "Exposure", next: "Next alert", firstAid: "If you are stung", alternatives: "When the beach is too risky", viewAlt: "See other activities", back: "Back to beaches", updated: "As of 14:10 today · Demo data", disclaimer: "Check official weather and on-site safety guidance before visiting.", statusSafe: "Good to visit", statusCaution: "Use caution", statusDanger: "Avoid today", navBeach: "Beaches", navTimer: "Timer", navAid: "First aid" },
  zh: { choose: "请选择语言", chooseSub: "更安全、更舒适地享受釜山海滩", start: "开始", live: "釜山海滩安全指南", heroTag: "今天的釜山海边", hero: "太热了，\n换一片海吧。", heroSub: "出发前查看沙温、海浪、水母和阴凉处。", beaches: "所有海滩一览", all: "全部", safe: "安全", caution: "注意", danger: "危险", sand: "沙滩温度", wave: "浪高", jelly: "水母", shade: "附近阴凉处", min: "分钟", ago: "步行", selected: "已选海滩", monitor: "阳光暴露计时器", monitorSub: "确认位置并在日晒过久时提醒您。", locate: "定位并开始", pause: "暂停", resume: "继续", reset: "重置", notify: "允许通知", exposure: "暴露时间", next: "下次提醒", firstAid: "被水母蜇伤时", alternatives: "不适合去海边时", viewAlt: "查看其他活动", back: "返回海滩", updated: "今日14:10 · 演示数据", disclaimer: "访问前请确认官方天气和现场安全指引。", statusSafe: "适合前往", statusCaution: "需要注意", statusDanger: "不建议前往", navBeach: "海滩", navTimer: "计时器", navAid: "急救" },
  ja: { choose: "言語を選択してください", chooseSub: "釜山の海を安全で快適に楽しもう", start: "はじめる", live: "釜山ビーチ安全ガイド", heroTag: "今日の釜山の海", hero: "暑すぎたら、\n別の海へ。", heroSub: "砂の温度、波、クラゲ、日陰を出発前にチェック。", beaches: "ビーチ一覧", all: "すべて", safe: "安全", caution: "注意", danger: "危険", sand: "砂の温度", wave: "波の高さ", jelly: "クラゲ", shade: "近くの日陰", min: "分", ago: "徒歩", selected: "選択したビーチ", monitor: "日光タイマー", monitorSub: "位置を確認し、長時間の日差しをお知らせします。", locate: "位置確認して開始", pause: "一時停止", resume: "再開", reset: "リセット", notify: "通知を許可", exposure: "経過時間", next: "次の通知", firstAid: "クラゲに刺されたら", alternatives: "海に行けない日は", viewAlt: "別の活動を見る", back: "海の状況へ", updated: "本日14:10現在・デモデータ", disclaimer: "訪問前に公式気象情報と現地案内をご確認ください。", statusSafe: "おすすめ", statusCaution: "注意が必要", statusDanger: "訪問非推奨", navBeach: "ビーチ", navTimer: "タイマー", navAid: "応急処置" },
  fr: { choose: "Choisissez votre langue", chooseSub: "Profitez des plages de Busan en toute sécurité", start: "Continuer", live: "Guide sécurité des plages de Busan", heroTag: "La mer à Busan aujourd’hui", hero: "Trop chaud ?\nChangez de plage.", heroSub: "Sable, vagues, méduses et ombre : vérifiez avant de partir.", beaches: "Toutes les plages", all: "Toutes", safe: "Sûr", caution: "Prudence", danger: "Danger", sand: "Sable", wave: "Vagues", jelly: "Méduses", shade: "Ombre proche", min: "min", ago: "à pied", selected: "Plage choisie", monitor: "Minuteur solaire", monitorSub: "Utilisez votre position et recevez des rappels au soleil.", locate: "Localiser et démarrer", pause: "Pause", resume: "Reprendre", reset: "Réinitialiser", notify: "Activer les alertes", exposure: "Exposition", next: "Prochaine alerte", firstAid: "En cas de piqûre", alternatives: "Si la plage est déconseillée", viewAlt: "Voir d’autres activités", back: "Retour aux plages", updated: "Aujourd’hui 14:10 · Données démo", disclaimer: "Vérifiez la météo officielle et les consignes sur place avant de partir.", statusSafe: "Bonne visite", statusCaution: "Prudence", statusDanger: "À éviter", navBeach: "Plages", navTimer: "Minuteur", navAid: "Premiers soins" },
};

const languageNames: { id: Lang; label: string; native: string }[] = [
  { id: "ko", label: "Korean", native: "한국어" }, { id: "en", label: "English", native: "English" }, { id: "zh", label: "Chinese", native: "中文" }, { id: "ja", label: "Japanese", native: "日本語" }, { id: "fr", label: "French", native: "Français" },
];

function getRisk(b: Beach): Risk {
  if (b.jelly === "danger" || b.wave >= 1.3) return "danger";
  if (b.sand >= 42 || b.wave >= 0.8 || b.jelly === "caution") return "caution";
  return "safe";
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ko");
  const [entered, setEntered] = useState(false);
  const [selectedId, setSelectedId] = useState("haeundae");
  const [filter, setFilter] = useState<"all" | Risk>("all");
  const [view, setView] = useState<"beaches" | "alternatives">("beaches");
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [located, setLocated] = useState(false);
  const [locationText, setLocationText] = useState("");
  const notificationSent = useRef(false);
  const t = copy[lang];
  const selected = BEACHES.find((b) => b.id === selectedId) ?? BEACHES[0];

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (seconds >= 1200 && !notificationSent.current) {
      notificationSent.current = true;
      if ("Notification" in window && Notification.permission === "granted") new Notification("뜨바다바", { body: "햇빛에 20분 노출되었어요. 그늘에서 쉬고 자외선 차단제를 덧발라 주세요." });
    }
  }, [seconds]);

  const filtered = useMemo(() => BEACHES.filter((b) => filter === "all" || getRisk(b) === filter), [filter]);
  const startLocation = () => {
    if (!("geolocation" in navigator)) { setLocationText("위치 기능을 사용할 수 없습니다"); setRunning(true); return; }
    setLocationText("위치 확인 중…");
    navigator.geolocation.getCurrentPosition(() => { setLocated(true); setLocationText(`${selected.ko} 인근 · 위치 확인됨`); setRunning(true); }, () => { setLocationText("위치 권한 없이 타이머를 시작했어요"); setRunning(true); }, { enableHighAccuracy: true, timeout: 8000 });
  };
  const allowNotification = async () => { if ("Notification" in window) await Notification.requestPermission(); };

  if (!entered) return <main className="welcome">
    <div className="welcome-sun" aria-hidden="true" />
    <div className="welcome-wave wave-a" aria-hidden="true" /><div className="welcome-wave wave-b" aria-hidden="true" />
    <section className="welcome-card">
      <div className="logo-mark">뜨</div>
      <p className="logo-title">뜨바다바</p>
      <p className="logo-sub">뜨거운 바다, 딴 바다로</p>
      <div className="language-box">
        <h1>{copy[lang].choose}</h1><p>{copy[lang].chooseSub}</p>
        <div className="language-list">{languageNames.map((item) => <button key={item.id} className={lang === item.id ? "chosen" : ""} onClick={() => setLang(item.id)}><span>{item.native}</span><small>{item.label}</small><b>{lang === item.id ? "✓" : "›"}</b></button>)}</div>
        <button className="primary wide" onClick={() => setEntered(true)}>{copy[lang].start} <span>→</span></button>
      </div>
    </section>
  </main>;

  return <main className="app-shell">
    <header className="topbar"><button className="brand" onClick={() => setView("beaches")}><span className="mini-logo">뜨</span><span>뜨바다바<small>뜨거운 바다, 딴 바다로</small></span></button><div className="top-actions"><span className="live"><i />{t.live}</span><select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>{languageNames.map((l) => <option key={l.id} value={l.id}>{l.native}</option>)}</select></div></header>
    <section className="hero"><div className="hero-copy"><p className="eyebrow">BUSAN BEACH WEATHER</p><h1>{t.hero.split("\n").map((line, i) => <span key={line} className={i ? "accent" : ""}>{line}</span>)}</h1><p>{t.heroSub.split("\n").map((line) => <span key={line}>{line}</span>)}</p><div className="hero-facts"><div><b>7</b><small>BEACHES</small></div><div><b>3</b><small>GOOD NOW</small></div><div><b>14:10</b><small>UPDATED</small></div></div></div><div className="hero-visual" aria-hidden="true"><div className="sun-disc"><span>오늘은</span><b>그늘 필수!</b></div><div className="cloud c1"/><div className="cloud c2"/><div className="sea-line l1"/><div className="sea-line l2"/></div></section>

    {view === "beaches" ? <>
      <section className="beach-section" id="beaches"><div className="section-head"><div><p className="eyebrow coral">BEACH CHECK</p><h2>{t.beaches}</h2><small>{t.updated}</small></div><div className="filters">{(["all", "safe", "caution", "danger"] as const).map((f) => <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>{t[f]}</button>)}</div></div>
        <div className="beach-grid">{filtered.map((b) => { const risk = getRisk(b); return <button key={b.id} className={`beach-card ${selectedId === b.id ? "selected" : ""}`} onClick={() => setSelectedId(b.id)}><div className="beach-card-head"><span><b>{lang === "ko" ? b.ko : b.en}</b><small>{b.district}</small></span><em className={`risk ${risk}`}>{t[`status${risk[0].toUpperCase()}${risk.slice(1)}`]}</em></div><div className="metrics"><span><small>{t.sand}</small><b>{b.sand}<i>°C</i></b></span><span><small>{t.wave}</small><b>{b.wave}<i>m</i></b></span></div><div className="jelly-row"><span><i className={`dot ${b.jelly}`} />{t.jelly} · {t[b.jelly]}</span><small>14:10</small></div></button>})}</div>
      </section>

      <section className="detail"><div className="detail-main"><p className="eyebrow coral">{t.selected}</p><div className="detail-title"><div><h2>{lang === "ko" ? selected.ko : selected.en} Beach</h2><p>{selected.district} · 14:10</p></div><span className={`risk big ${getRisk(selected)}`}>{t[`status${getRisk(selected)[0].toUpperCase()}${getRisk(selected).slice(1)}`]}</span></div><div className={`notice ${getRisk(selected)}`}><b>!</b><p><strong>{selected.sand >= 43 ? `${t.sand} ${selected.sand}°C` : `${t.jelly} · ${t[selected.jelly]}`}</strong><span>{getRisk(selected) === "danger" ? "오늘은 물놀이보다 실내 활동을 추천해요." : "30분마다 그늘에서 쉬고 물을 자주 마셔 주세요."}</span></p></div><div className="big-metrics"><div><span>♨</span><p><small>{t.sand}</small><b>{selected.sand}°C</b></p></div><div><span>≈</span><p><small>{t.wave}</small><b>{selected.wave}m</b></p></div><div><span>◒</span><p><small>{t.jelly}</small><b>{t[selected.jelly]}</b></p></div></div></div><aside className="shade-card"><div><p className="eyebrow">COOL SPOTS</p><h3>{t.shade}</h3></div><div className="mini-map"><span className="map-road r1"/><span className="map-road r2"/><i className="pin p1">1</i><i className="pin p2">2</i><b className="you">● YOU</b></div><ol>{selected.shade.map((spot, i) => <li key={spot.name}><b>{i + 1}</b><p><strong>{spot.name}</strong><small>{spot.detail}</small></p><em>{t.ago} {spot.walk}{t.min}</em></li>)}</ol></aside></section>

      <section className="exposure" id="timer"><div className="exposure-copy"><p className="eyebrow">SUN SAFETY</p><h2>{t.monitor}</h2><p>{t.monitorSub}</p><div className={`location-status ${located ? "ok" : ""}`}><span>◎</span>{locationText || "위치를 확인하면 타이머가 시작돼요"}</div></div><div className="timer-card"><div className="timer-ring" style={{ "--progress": `${Math.min(seconds / 1200 * 360, 360)}deg` } as React.CSSProperties}><div><small>{t.exposure}</small><b>{formatTime(seconds)}</b><span>{seconds < 1200 ? `${t.next} ${Math.ceil((1200 - seconds) / 60)}${t.min}` : "휴식이 필요해요"}</span></div></div><div className="timer-actions">{seconds === 0 ? <button className="primary" onClick={startLocation}>◎ {t.locate}</button> : <button className="primary" onClick={() => setRunning(!running)}>{running ? "Ⅱ " + t.pause : "▶ " + t.resume}</button>}<button className="secondary" onClick={() => { setSeconds(0); setRunning(false); notificationSent.current = false; }}>{t.reset}</button><button className="text-button" onClick={allowNotification}>♢ {t.notify}</button></div></div></section>

      <section className="first-aid" id="aid"><div className="aid-intro"><p className="eyebrow coral">JELLYFISH FIRST AID</p><h2>{t.firstAid}</h2><p>심한 통증, 호흡곤란, 구토가 있으면 즉시 119에 신고하세요.</p></div><ol><li><b>01</b><span><strong>물 밖으로 이동</strong><small>환부를 문지르거나 만지지 마세요.</small></span></li><li><b>02</b><span><strong>바닷물로 충분히 세척</strong><small>수돗물이나 생수는 사용하지 마세요.</small></span></li><li><b>03</b><span><strong>촉수를 조심히 제거</strong><small>카드 모서리나 핀셋을 사용하세요.</small></span></li><li><b>04</b><span><strong>안전요원 또는 119</strong><small>전신 증상이 있으면 바로 도움을 요청하세요.</small></span></li></ol></section>

      <section className="plan-b"><div className="umbrella">☂</div><div><p className="eyebrow">PLAN B, BUSAN</p><h2>{t.alternatives}</h2><p>폭염·높은 파도·해파리 위험이 크면 시원한 부산 실내 코스를 골라보세요.</p></div><button onClick={() => { setView("alternatives"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{t.viewAlt} →</button></section>
    </> : <AlternativeView t={t} onBack={() => setView("beaches")} />}
    <footer><div className="brand static"><span className="mini-logo">뜨</span><span>뜨바다바<small>뜨거운 바다, 딴 바다로</small></span></div><p>{t.disclaimer}</p></footer>
    <nav className="mobile-nav"><a href="#beaches">⌂<span>{t.navBeach}</span></a><a href="#timer">◴<span>{t.navTimer}</span></a><a href="#aid">＋<span>{t.navAid}</span></a></nav>
  </main>;
}

function AlternativeView({ t, onBack }: { t: Record<string, string>; onBack: () => void }) {
  const places = [
    { n: "01", tag: "MEDIA", title: "뮤지엄 원", area: "해운대구", desc: "몰입형 미디어아트와 함께하는 시원한 실내 전시", cls: "violet" },
    { n: "02", tag: "FREE", title: "부산현대미술관", area: "사하구", desc: "다대포와 가까운 무료 현대미술 전시", cls: "green" },
    { n: "03", tag: "COOL", title: "영화의전당", area: "해운대구", desc: "독립영화와 탁 트인 실내 라운지", cls: "blue" },
    { n: "04", tag: "FAMILY", title: "국립부산과학관", area: "기장군", desc: "아이와 함께하는 체험형 과학 전시", cls: "orange" },
  ];
  return <section className="alternative-page"><button className="back" onClick={onBack}>← {t.back}</button><div className="alt-hero"><p className="eyebrow coral">PLAN B, BUSAN</p><h1>바다 말고도,<br/><em>부산은 시원하니까.</em></h1><p>뜨거운 모래와 높은 파도 대신 가까운 실내 활동을 추천해요.</p></div><div className="alt-grid">{places.map((p) => <article key={p.n} className={p.cls}><div><span>{p.n}</span><em>{p.tag}</em></div><small>{p.area} · 실내</small><h2>{p.title}</h2><p>{p.desc}</p><button>자세히 보기 →</button></article>)}</div></section>;
}
