"use client";

import { useMemo, useState } from "react";
import BeachMap from "./BeachMap";
import ExposureTracker from "./ExposureTracker";

type Level = "좋음" | "주의" | "위험";

type Beach = {
  id: string;
  name: string;
  area: string;
  sandTemp: number;
  wave: number;
  shade: number;
  jellyfish: Level;
  jellySpot: string;
  update: string;
  accent: string;
  coordinate: [number, number];
  shadeSpots: { name: string; detail: string; walk: string }[];
};

const beaches: Beach[] = [
  { id: "haeundae", name: "해운대", area: "해운대구", sandTemp: 42, wave: 0.8, shade: 72, jellyfish: "주의", jellySpot: "미포 방파제 인근", update: "14:10", accent: "#ff7a59", coordinate: [35.1587, 129.1604], shadeSpots: [{ name: "해운대 광장 그늘막", detail: "5번 망루 뒤 · 18석", walk: "2분" }, { name: "동백섬 산책로", detail: "웨스틴 조선 방향 수목 그늘", walk: "7분" }, { name: "구남로 쿨링존", detail: "해변 입구 분수광장", walk: "5분" }] },
  { id: "gwangalli", name: "광안리", area: "수영구", sandTemp: 39, wave: 0.5, shade: 58, jellyfish: "좋음", jellySpot: "관측 없음", update: "14:08", accent: "#5b79ff", coordinate: [35.1531, 129.1186], shadeSpots: [{ name: "민락회센터 데크", detail: "민락 방향 파고라 · 12석", walk: "6분" }, { name: "남천 해변공원", detail: "삼익비치 방향 수목 구간", walk: "8분" }, { name: "만남의 광장", detail: "중앙 화장실 옆 그늘막", walk: "3분" }] },
  { id: "songjeong", name: "송정", area: "해운대구", sandTemp: 44, wave: 1.4, shade: 36, jellyfish: "주의", jellySpot: "죽도공원 바깥 수역", update: "14:05", accent: "#8d6ce7", coordinate: [35.1798, 129.1997], shadeSpots: [{ name: "죽도공원 입구", detail: "송일정 아래 수목 그늘", walk: "5분" }, { name: "구덕포 쉼터", detail: "해변열차 산책로 벤치", walk: "11분" }, { name: "중앙 안내소", detail: "3번 망루 맞은편 차양", walk: "2분" }] },
  { id: "songdo", name: "송도", area: "서구", sandTemp: 38, wave: 0.4, shade: 81, jellyfish: "좋음", jellySpot: "관측 없음", update: "14:12", accent: "#13a085", coordinate: [35.0765, 129.0172], shadeSpots: [{ name: "송림공원", detail: "해상케이블카 하부 소나무숲", walk: "4분" }, { name: "거북섬 쉼터", detail: "구름산책로 입구 파고라", walk: "6분" }, { name: "분수광장 차양", detail: "중앙 안내소 옆 · 20석", walk: "2분" }] },
  { id: "dadaepo", name: "다대포", area: "사하구", sandTemp: 41, wave: 0.7, shade: 65, jellyfish: "위험", jellySpot: "몰운대 남측·낙동강 하구", update: "14:02", accent: "#e3a529", coordinate: [35.0483, 128.9652], shadeSpots: [{ name: "해변공원 소나무숲", detail: "꿈의 낙조분수 서편", walk: "5분" }, { name: "생태탐방로 쉼터", detail: "고우니길 2번 데크", walk: "9분" }, { name: "낙조광장 그늘막", detail: "관리센터 앞 · 16석", walk: "3분" }] },
  { id: "ilgwang", name: "일광", area: "기장군", sandTemp: 43, wave: 1.0, shade: 29, jellyfish: "주의", jellySpot: "학리항 외곽", update: "13:58", accent: "#f05c79", coordinate: [35.2633, 129.2338], shadeSpots: [{ name: "이천쉼터", detail: "남측 해안산책로 파고라", walk: "8분" }, { name: "삼성리 수목 구간", detail: "강송교 인근 벤치", walk: "6분" }, { name: "중앙 안내소 차양", detail: "해변 진입광장", walk: "2분" }] },
  { id: "imrang", name: "임랑", area: "기장군", sandTemp: 37, wave: 0.6, shade: 44, jellyfish: "좋음", jellySpot: "관측 없음", update: "13:55", accent: "#3586b8", coordinate: [35.3197, 129.2659], shadeSpots: [{ name: "임랑행정봉사실", detail: "해변 중앙 파고라 · 10석", walk: "3분" }, { name: "월내천 산책로", detail: "북측 교량 아래 그늘", walk: "9분" }, { name: "임랑공원 수목", detail: "남측 주차장 맞은편", walk: "6분" }] },
];

const alternatives = [
  { title: "뮤지엄 원", meta: "실내 · 해운대구", reason: "시원한 미디어아트 전시", tag: "더위 대피", color: "violet" },
  { title: "부산현대미술관", meta: "실내 · 사하구", reason: "비·파도 걱정 없는 무료 전시", tag: "가족 추천", color: "green" },
  { title: "영화의전당", meta: "실내/야간 · 해운대구", reason: "늦은 오후 영화와 산책", tag: "야간 추천", color: "blue" },
  { title: "국립부산과학관", meta: "실내 · 기장군", reason: "아이와 반나절 체험 코스", tag: "아이와", color: "orange" },
];

function getRisk(beach: Beach) {
  let score = 0;
  if (beach.sandTemp >= 43) score += 2;
  else if (beach.sandTemp >= 40) score += 1;
  if (beach.wave >= 1.2) score += 2;
  else if (beach.wave >= 0.8) score += 1;
  if (beach.shade < 35) score += 2;
  else if (beach.shade < 55) score += 1;
  if (beach.jellyfish === "위험") score += 3;
  else if (beach.jellyfish === "주의") score += 1;
  return score >= 5 ? "방문 비추천" : score >= 3 ? "주의 필요" : "방문 좋아요";
}

function StatusDot({ level }: { level: Level }) {
  return <span className={`status-dot ${level === "좋음" ? "safe" : level === "주의" ? "warn" : "danger"}`} />;
}

export default function Home() {
  const [selectedId, setSelectedId] = useState("haeundae");
  const [filter, setFilter] = useState("전체");
  const [tab, setTab] = useState<"해변 상황" | "다른 놀거리">("해변 상황");
  const [language, setLanguage] = useState<"KO" | "EN">("KO");
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const selected = beaches.find((beach) => beach.id === selectedId) ?? beaches[0];
  const filtered = useMemo(() => beaches.filter((beach) => {
    if (filter === "전체") return true;
    if (filter === "안전") return getRisk(beach) === "방문 좋아요";
    if (filter === "낮은 파도") return beach.wave < 0.8;
    return beach.shade >= 60;
  }), [filter]);
  const risk = getRisk(selected);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="바다어때 홈"><span className="brand-mark">⌁</span><span>바다어때</span></a>
        <nav aria-label="주요 메뉴">
          {(["해변 상황", "다른 놀거리"] as const).map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}
        </nav>
        <div className="header-right"><span className="live-dot" /> {language === "KO" ? "부산 해변 관측 중" : "Busan beach monitor"}<label className="language-select"><span className="sr-only">Language</span><select value={language} onChange={(event) => setLanguage(event.target.value as "KO" | "EN")}><option value="KO">한국어</option><option value="EN">EN</option></select></label><button className="round-button" aria-label="알림">◌</button></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">BUSAN BEACH WEATHER</p>
          <h1>{language === "KO" ? <>오늘, 바다<br /><em>가도 될까?</em></> : <>Should I go<br /><em>to the beach?</em></>}</h1>
          <p className="intro">{language === "KO" ? <>뜨거운 모래부터 높은 파도, 해파리까지.<br />가기 전에 딱 필요한 것만 확인하세요.</> : <>Check sand heat, waves, shade and jellyfish<br />before you head out.</>}</p>
          <div className="hero-summary"><div><b>7</b><span>관측 해수욕장</span></div><div><b>3</b><span>지금 방문 추천</span></div><div><b>14:10</b><span>최근 업데이트</span></div></div>
        </div>
        <div className="sun" aria-hidden="true"><span className="cloud cloud-one" /><span className="cloud cloud-two" /><span className="wave-line wave-one" /><span className="wave-line wave-two" /></div>
        <div className="hero-card">
          <span className="card-kicker">오늘의 한마디</span>
          <strong>발바닥도<br />휴식이 필요해요.</strong>
          <p>오후 2~4시에는 모래가 가장 뜨거워요.<br />아쿠아슈즈를 꼭 챙기세요.</p>
        </div>
      </section>

      <section className="content-shell">
        {tab === "해변 상황" ? <>
          <div className="section-heading">
            <div><p className="eyebrow coral">BEACH CHECK</p><h2>해수욕장 한눈에 보기</h2></div>
            <div className="filters" role="group" aria-label="해변 필터">{["전체", "안전", "낮은 파도", "그늘 많음"].map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? "selected" : ""}>{item}</button>)}</div>
          </div>
          <div className="beach-grid">
            {filtered.map((beach) => {
              const state = getRisk(beach);
              return <button key={beach.id} className={`beach-card ${selectedId === beach.id ? "chosen" : ""}`} onClick={() => setSelectedId(beach.id)} style={{ "--accent": beach.accent } as React.CSSProperties}>
                <span className="beach-top"><span><b>{beach.name}</b><small>{beach.area}</small></span><span className={`pill ${state === "방문 좋아요" ? "safe-pill" : state === "주의 필요" ? "warn-pill" : "danger-pill"}`}>{state}</span></span>
                <span className="metrics"><span><small>모래 온도</small><b>{beach.sandTemp}<i>°</i></b></span><span><small>파도 높이</small><b>{beach.wave}<i>m</i></b></span><span><small>그늘 지수</small><b>{beach.shade}<i>%</i></b></span></span>
                <span className="jelly"><span><StatusDot level={beach.jellyfish} /> 해파리 {beach.jellyfish}</span><small>{beach.update} 갱신</small></span>
              </button>;
            })}
          </div>

          <div className="detail-panel">
            <div className="detail-copy">
              <p className="eyebrow coral">SELECTED BEACH</p>
              <div className="detail-title"><div><h2>{selected.name} 해수욕장</h2><p>{selected.area} · 오늘 {selected.update} 기준</p></div><span className={`big-status ${risk === "방문 좋아요" ? "safe-bg" : risk === "주의 필요" ? "warn-bg" : "danger-bg"}`}>{risk}</span></div>
              <div className="advice"><span>!</span><p><b>{selected.sandTemp >= 43 ? "모래가 매우 뜨거워요" : selected.jellyfish === "위험" ? "해파리 출몰 위험이 높아요" : "짧은 해변 활동은 괜찮아요"}</b><br />{selected.sandTemp >= 43 ? "맨발 보행을 피하고 오전이나 늦은 오후 방문을 권해요." : selected.jellyfish === "위험" ? "입수는 피하고 현장 안전요원의 안내를 확인하세요." : "그늘에서 자주 쉬고, 현장 안전 방송을 확인하세요."}</p></div>
              <div className="detail-stats">
                <div><span className="mini-icon heat">⌁</span><p>모래 온도<small>화상 주의 기준 43°</small></p><b>{selected.sandTemp}°</b></div>
                <div><span className="mini-icon water">≈</span><p>파도 높이<small>주의 기준 1.2m</small></p><b>{selected.wave}m</b></div>
                <div><span className="mini-icon shade">◒</span><p>그늘 지수<small>주변 쉼터 가용도</small></p><b>{selected.shade}%</b></div>
                <div><span className="mini-icon jelly-icon">⌇</span><p>해파리<small>{selected.jellySpot}</small></p><b className="text-status"><StatusDot level={selected.jellyfish} />{selected.jellyfish}</b></div>
              </div>
            </div>
            <aside className="shade-panel">
              <div className="shade-head"><div><p className="eyebrow">COOL SPOTS</p><h3>가까운 그늘 찾기</h3></div><span>{selected.shadeSpots.length}곳</span></div>
              <BeachMap beach={selected} userPosition={userPosition} />
              <ol className="spot-list">{selected.shadeSpots.map((spot, index) => <li key={spot.name}><span>{index + 1}</span><p><b>{spot.name}</b><small>{spot.detail}</small></p><em>도보 {spot.walk}</em></li>)}</ol>
            </aside>
          </div>

          <ExposureTracker beachName={`${selected.name} 해수욕장`} sandTemp={selected.sandTemp} onPosition={setUserPosition} />
          <section className="jelly-aid" aria-labelledby="jelly-aid-title">
            <div className="aid-title"><p className="eyebrow coral">JELLYFISH FIRST AID</p><h2 id="jelly-aid-title">해파리에 쏘였다면</h2><p>해변 안전요원에게 먼저 알리고, 증상이 심하면 즉시 119에 연락하세요.</p></div>
            <ol><li><span>1</span><p><b>물 밖으로 이동</b><small>통증 부위를 만지거나 문지르지 마세요.</small></p></li><li><span>2</span><p><b>바닷물로 10분 이상 세척</b><small>수돗물·민물은 사용하지 마세요.</small></p></li><li><span>3</span><p><b>남은 촉수는 카드로 제거</b><small>맨손 대신 플라스틱 카드 가장자리를 사용하세요.</small></p></li><li><span>4</span><p><b>호흡곤란·어지럼증은 119</b><small>오심, 구토, 식은땀도 즉시 진료가 필요해요.</small></p></li></ol>
            <p className="aid-source">질병관리청 물놀이 활동 손상 예방·응급처치 수칙을 바탕으로 정리했습니다.</p>
          </section>

          <div className="switch-banner">
            <div className="umbrella" aria-hidden="true">⌁</div>
            <div><p className="eyebrow">PLAN B</p><h2>바다가 부담스러운 날엔?</h2><p>뜨거움·높은 파도·해파리 위험을 피해 부산에서 즐길 수 있는 코스를 골랐어요.</p></div>
            <button onClick={() => setTab("다른 놀거리")}>다른 놀거리 보기 <span>→</span></button>
          </div>
        </> : <AlternativeView onBack={() => setTab("해변 상황")} />}
      </section>
      <footer><div className="brand"><span className="brand-mark">⌁</span><span>바다어때</span></div><p>부산의 오늘을 더 시원하고 안전하게.</p><span>내장 예시 데이터 · 실제 방문 전 현장 안내를 확인하세요</span></footer>
    </main>
  );
}

function AlternativeView({ onBack }: { onBack: () => void }) {
  return <section className="alternative-view">
    <button className="back-link" onClick={onBack}>← 해변 상황으로</button>
    <div className="alt-heading"><p className="eyebrow coral">PLAN B, BUSAN</p><h1>바다 말고도<br /><em>부산은 재밌으니까.</em></h1><p>폭염, 높은 파도, 해파리를 피해도 하루는 충분히 근사할 수 있어요.</p></div>
    <div className="alt-grid">{alternatives.map((place, index) => <article className={`alt-card ${place.color}`} key={place.title}><span className="alt-number">0{index + 1}</span><span className="alt-tag">{place.tag}</span><div><small>{place.meta}</small><h2>{place.title}</h2><p>{place.reason}</p></div><button aria-label={`${place.title} 추천 이유 보기`}>추천 이유 <span>↗</span></button></article>)}</div>
    <div className="rule-box"><b>추천 기준</b><p>모래 43°C 이상 · 파고 1.2m 이상 · 그늘 35% 미만 · 해파리 위험 중 하나라도 심각하면 실내 또는 야간 활동을 우선 추천합니다.</p></div>
  </section>;
}
