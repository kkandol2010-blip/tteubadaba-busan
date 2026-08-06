"use client";

import { useEffect, useRef, useState } from "react";

type Lang = "ko" | "en" | "zh" | "ja" | "fr";
type Risk = "safe" | "caution" | "danger";
type Panel = "status" | "shade" | "timer" | "aid" | "plan";

type Beach = {
  id: string; ko: string; en: string; district: string; sand: number; wave: number;
  jelly: Risk; jellyArea: string; shade: { name: string; detail: string; walk: number }[];
};

const beaches: Beach[] = [
  { id:"haeundae", ko:"해운대", en:"Haeundae", district:"해운대구", sand:42, wave:.8, jelly:"caution", jellyArea:"미포 방파제 인근", shade:[{name:"해운대 광장 그늘막",detail:"5번 망루 뒤편",walk:2},{name:"동백섬 산책로",detail:"수목 그늘 구간",walk:7}] },
  { id:"gwangalli", ko:"광안리", en:"Gwangalli", district:"수영구", sand:39, wave:.5, jelly:"safe", jellyArea:"관측 없음", shade:[{name:"만남의 광장",detail:"중앙 음수대 옆",walk:3},{name:"민락수변공원",detail:"해변 북쪽 수목",walk:8}] },
  { id:"songjeong", ko:"송정", en:"Songjeong", district:"해운대구", sand:44, wave:1.4, jelly:"caution", jellyArea:"죽도공원 앞 수역", shade:[{name:"죽도공원 입구",detail:"송일정 아래",walk:5},{name:"중앙 안내소",detail:"3번 망루 맞은편",walk:2}] },
  { id:"songdo", ko:"송도", en:"Songdo", district:"서구", sand:38, wave:.4, jelly:"safe", jellyArea:"관측 없음", shade:[{name:"송림공원",detail:"케이블카 하부",walk:4},{name:"분수광장 차양",detail:"중앙 안내소 옆",walk:2}] },
  { id:"dadaepo", ko:"다대포", en:"Dadaepo", district:"사하구", sand:41, wave:.7, jelly:"danger", jellyArea:"몰운대·낙동강 하구", shade:[{name:"해변공원 소나무숲",detail:"낙조분수 서편",walk:5},{name:"생태탐방로 쉼터",detail:"고우니길 2번 데크",walk:9}] },
  { id:"ilgwang", ko:"일광", en:"Ilgwang", district:"기장군", sand:43, wave:1, jelly:"caution", jellyArea:"학리항 인근", shade:[{name:"이천쉼터",detail:"해변 남쪽 산책로",walk:8},{name:"중앙 안내소 차양",detail:"해변 진입광장",walk:2}] },
  { id:"imrang", ko:"임랑", en:"Imrang", district:"기장군", sand:37, wave:.6, jelly:"safe", jellyArea:"관측 없음", shade:[{name:"임랑행정봉사실",detail:"해변 중앙 쉼터",walk:3},{name:"임랑공원 수목",detail:"주차장 맞은편",walk:6}] },
];

const langs:{id:Lang;native:string;english:string}[] = [
  {id:"ko",native:"한국어",english:"Korean"},{id:"en",native:"English",english:"English"},{id:"zh",native:"中文",english:"Chinese"},{id:"ja",native:"日本語",english:"Japanese"},{id:"fr",native:"Français",english:"French"},
];

const words:Record<Lang,Record<string,string>> = {
  ko:{choose:"언어를 선택해 주세요",sub:"부산 바다를 더 안전하고 시원하게 즐겨요",start:"시작하기",guide:"부산 해변 안전 가이드",status:"해변 현황",shade:"그늘 찾기",timer:"햇빛 타이머",aid:"응급처치",plan:"다른 활동",sand:"모래 온도",wave:"파도 높이",jelly:"해파리",safe:"안전",caution:"주의",danger:"위험",visitSafe:"방문 좋아요",visitCaution:"주의 필요",visitDanger:"방문 비추천",updated:"오늘 14:10 · 시연용 데이터",location:"가까운 그늘",walk:"도보",minutes:"분",startTimer:"위치 확인 후 시작",pause:"잠시 멈춤",resume:"다시 시작",reset:"초기화",exposure:"노출 시간",notify:"알림 허용",next:"다음 알림",titleStatus:"오늘, 바다 가도 될까?",titleShade:"그늘에서 잠시 쉬어가세요",titleTimer:"강한 햇빛에 머문 시간을 알려드려요",titleAid:"해파리에 쏘였다면",titlePlan:"오늘 바다가 힘들다면",change:"언어 변경"},
  en:{choose:"Choose your language",sub:"Enjoy Busan’s beaches safely and comfortably",start:"Continue",guide:"Busan beach safety guide",status:"Beach status",shade:"Find shade",timer:"Sun timer",aid:"First aid",plan:"Other plans",sand:"Sand temp.",wave:"Wave height",jelly:"Jellyfish",safe:"Safe",caution:"Caution",danger:"Danger",visitSafe:"Good to visit",visitCaution:"Use caution",visitDanger:"Avoid today",updated:"Today 14:10 · Demo data",location:"Nearby shade",walk:"Walk",minutes:"min",startTimer:"Locate & start",pause:"Pause",resume:"Resume",reset:"Reset",exposure:"Exposure",notify:"Allow alerts",next:"Next alert",titleStatus:"Should I go to the beach?",titleShade:"Take a break in the shade",titleTimer:"Track your time in strong sun",titleAid:"If you are stung",titlePlan:"When the beach is too risky",change:"Change language"},
  zh:{choose:"请选择语言",sub:"更安全、更舒适地享受釜山海滩",start:"开始",guide:"釜山海滩安全指南",status:"海滩状况",shade:"寻找阴凉",timer:"日晒计时",aid:"急救",plan:"其他活动",sand:"沙温",wave:"浪高",jelly:"水母",safe:"安全",caution:"注意",danger:"危险",visitSafe:"适合前往",visitCaution:"需要注意",visitDanger:"不建议前往",updated:"今日14:10 · 演示数据",location:"附近阴凉处",walk:"步行",minutes:"分钟",startTimer:"定位并开始",pause:"暂停",resume:"继续",reset:"重置",exposure:"暴露时间",notify:"允许通知",next:"下次提醒",titleStatus:"今天适合去海边吗？",titleShade:"在阴凉处休息一下",titleTimer:"记录强烈阳光下的时间",titleAid:"被水母蜇伤时",titlePlan:"不适合去海边时",change:"更改语言"},
  ja:{choose:"言語を選択してください",sub:"釜山の海を安全で快適に楽しもう",start:"はじめる",guide:"釜山ビーチ安全ガイド",status:"海の状況",shade:"日陰を探す",timer:"日光タイマー",aid:"応急処置",plan:"別の活動",sand:"砂の温度",wave:"波の高さ",jelly:"クラゲ",safe:"安全",caution:"注意",danger:"危険",visitSafe:"おすすめ",visitCaution:"注意が必要",visitDanger:"訪問非推奨",updated:"本日14:10 · デモデータ",location:"近くの日陰",walk:"徒歩",minutes:"分",startTimer:"位置確認して開始",pause:"一時停止",resume:"再開",reset:"リセット",exposure:"経過時間",notify:"通知を許可",next:"次の通知",titleStatus:"今日は海に行ける？",titleShade:"日陰でひと休み",titleTimer:"強い日差しの時間を記録",titleAid:"クラゲに刺されたら",titlePlan:"海に行けない日は",change:"言語変更"},
  fr:{choose:"Choisissez votre langue",sub:"Profitez des plages de Busan en toute sécurité",start:"Continuer",guide:"Guide sécurité des plages de Busan",status:"État des plages",shade:"Trouver l’ombre",timer:"Minuteur solaire",aid:"Premiers soins",plan:"Autres activités",sand:"Sable",wave:"Vagues",jelly:"Méduses",safe:"Sûr",caution:"Prudence",danger:"Danger",visitSafe:"Bonne visite",visitCaution:"Prudence",visitDanger:"À éviter",updated:"Aujourd’hui 14:10 · Démo",location:"Ombre proche",walk:"À pied",minutes:"min",startTimer:"Localiser et démarrer",pause:"Pause",resume:"Reprendre",reset:"Réinitialiser",exposure:"Exposition",notify:"Activer alertes",next:"Prochaine alerte",titleStatus:"Aller à la plage aujourd’hui ?",titleShade:"Faites une pause à l’ombre",titleTimer:"Suivez votre temps au soleil",titleAid:"En cas de piqûre",titlePlan:"Si la plage est déconseillée",change:"Changer de langue"},
};

const riskOf=(b:Beach):Risk=>b.jelly==="danger"||b.wave>=1.3?"danger":b.sand>=42||b.wave>=.8||b.jelly==="caution"?"caution":"safe";
const time=(n:number)=>`${Math.floor(n/60).toString().padStart(2,"0")}:${(n%60).toString().padStart(2,"0")}`;

export default function Home(){
  const [lang,setLang]=useState<Lang>("ko"),[entered,setEntered]=useState(false),[panel,setPanel]=useState<Panel>("status"),[beachId,setBeachId]=useState("haeundae");
  const [seconds,setSeconds]=useState(0),[running,setRunning]=useState(false),[location,setLocation]=useState("");
  const warned=useRef(false), t=words[lang], beach=beaches.find(b=>b.id===beachId)??beaches[0], risk=riskOf(beach);
  useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setSeconds(s=>s+1),1000);return()=>clearInterval(id)},[running]);
  useEffect(()=>{if(seconds>=1200&&!warned.current){warned.current=true;if("Notification"in window&&Notification.permission==="granted")new Notification("뜨바다바",{body:"20분 동안 햇빛에 노출되었어요. 그늘에서 쉬어 주세요."})}},[seconds]);
  const begin=()=>{setLocation("위치 확인 중…");if(!navigator.geolocation){setLocation("타이머 시작됨");setRunning(true);return}navigator.geolocation.getCurrentPosition(()=>{setLocation(`${beach.ko} 인근 · 위치 확인됨`);setRunning(true)},()=>{setLocation("위치 권한 없이 타이머 시작됨");setRunning(true)},{timeout:6000})};
  const title={status:t.titleStatus,shade:t.titleShade,timer:t.titleTimer,aid:t.titleAid,plan:t.titlePlan}[panel];

  if(!entered)return <main className="welcome"><div className="welcome-sun"/><div className="welcome-wave wave-a"/><div className="welcome-wave wave-b"/><section className="welcome-card"><div className="logo-mark">뜨</div><p className="logo-title">뜨바다바</p><p className="logo-sub">뜨거운 바다, 딴 바다로</p><div className="language-box"><h1>{t.choose}</h1><p>{t.sub}</p><div className="language-list">{langs.map(l=><button key={l.id} className={lang===l.id?"chosen":""} onClick={()=>setLang(l.id)}><span>{l.native}</span><small>{l.english}</small><b>{lang===l.id?"✓":"›"}</b></button>)}</div><button className="primary wide" onClick={()=>setEntered(true)}>{t.start} →</button></div></section></main>;

  return <main className="dashboard"><header className="dash-header"><button className="brand" onClick={()=>setPanel("status")}><span className="mini-logo">뜨</span><span>뜨바다바<small>뜨거운 바다, 딴 바다로</small></span></button><span className="live"><i/>{t.guide}</span><button className="language-change" onClick={()=>setEntered(false)}>文 {t.change}</button></header>
    <nav className="feature-nav" aria-label="주요 기능">{(["status","shade","timer","aid","plan"] as Panel[]).map((p,i)=><button key={p} className={panel===p?"active":""} onClick={()=>setPanel(p)}><span>{["≈","◒","◷","＋","⌂"][i]}</span>{t[p]}</button>)}</nav>
    <section className="dash-body"><aside className="beach-rail"><div className="rail-head"><p>BUSAN BEACHES</p><b>7</b></div><div className="beach-list">{beaches.map(b=>{const r=riskOf(b);return <button key={b.id} className={beachId===b.id?"active":""} onClick={()=>setBeachId(b.id)}><i className={`dot ${r}`}/><span><b>{lang==="ko"?b.ko:b.en}</b><small>{b.district}</small></span><em>{b.sand}°</em></button>})}</div><small className="rail-update">● {t.updated}</small></aside>
      <article className={`info-panel panel-${panel}`}><div className="panel-heading"><div><p className="eyebrow">{panel.toUpperCase()}</p><h1>{title}</h1></div>{panel!=="plan"&&<div className="selected-beach"><span>{lang==="ko"?beach.ko:beach.en}</span><em className={`risk ${risk}`}>{t[`visit${risk[0].toUpperCase()+risk.slice(1)}`]}</em></div>}</div>
        {panel==="status"&&<StatusPanel beach={beach} risk={risk} t={t}/>} 
        {panel==="shade"&&<ShadePanel beach={beach} t={t}/>} 
        {panel==="timer"&&<TimerPanel t={t} seconds={seconds} running={running} location={location} begin={begin} toggle={()=>setRunning(!running)} reset={()=>{setSeconds(0);setRunning(false);warned.current=false}}/>}
        {panel==="aid"&&<AidPanel/>}
        {panel==="plan"&&<PlanPanel/>}
      </article>
    </section>
  </main>
}

function StatusPanel({beach,risk,t}:{beach:Beach;risk:Risk;t:Record<string,string>}){return <div className="status-layout"><div className="status-hero"><span className="weather-sun">☀</span><div><small>BEACH SCORE</small><b>{risk==="safe"?"86":risk==="caution"?"64":"38"}</b><em>/ 100</em></div><p>{risk==="danger"?"오늘은 물놀이보다 실내 활동을 추천해요.":"30분마다 그늘에서 쉬고 물을 자주 마셔 주세요."}</p></div><div className="metric-grid"><div><span>♨</span><small>{t.sand}</small><b>{beach.sand}<em>°C</em></b><i className={beach.sand>=43?"hot":""}>{beach.sand>=43?t.danger:t.caution}</i></div><div><span>≈</span><small>{t.wave}</small><b>{beach.wave}<em>m</em></b><i>{beach.wave>=1.3?t.danger:beach.wave>=.8?t.caution:t.safe}</i></div><div><span>◌</span><small>{t.jelly}</small><b className="word-value">{t[beach.jelly]}</b><i>{beach.jellyArea}</i></div></div></div>}

function ShadePanel({beach,t}:{beach:Beach;t:Record<string,string>}){return <div className="shade-layout"><div className="large-map"><span className="map-road road-a"/><span className="map-road road-b"/><span className="water-shape"/><i className="map-pin pin-a">1</i><i className="map-pin pin-b">2</i><b className="user-pin">● MY LOCATION</b><small>모형 지도 · 현장 표지판 확인</small></div><div className="shade-list"><p>{t.location}</p>{beach.shade.map((s,i)=><div key={s.name}><b>{i+1}</b><span><strong>{s.name}</strong><small>{s.detail}</small></span><em>{t.walk} {s.walk}{t.minutes}</em></div>)}<button onClick={()=>alert("위치 권한을 허용하면 가장 가까운 그늘을 안내합니다.")}>◎ 내 위치에서 찾기</button></div></div>}

function TimerPanel({t,seconds,running,location,begin,toggle,reset}:{t:Record<string,string>;seconds:number;running:boolean;location:string;begin:()=>void;toggle:()=>void;reset:()=>void}){const allow=()=>{"Notification"in window&&Notification.requestPermission()};return <div className="timer-layout"><div className="timer-ring" style={{"--progress":`${Math.min(seconds/1200*360,360)}deg`} as React.CSSProperties}><div><small>{t.exposure}</small><b>{time(seconds)}</b><span>{seconds<1200?`${t.next} ${Math.ceil((1200-seconds)/60)}${t.minutes}`:"휴식이 필요해요"}</span></div></div><div className="timer-control"><p>◎ {location||"위치를 확인하면 타이머가 시작돼요"}</p>{seconds===0?<button className="primary" onClick={begin}>{t.startTimer}</button>:<button className="primary" onClick={toggle}>{running?"Ⅱ "+t.pause:"▶ "+t.resume}</button>}<button className="secondary" onClick={reset}>{t.reset}</button><button className="notify-button" onClick={allow}>♢ {t.notify}</button><small>20분마다 그늘 휴식과 자외선 차단제 사용을 알려드려요.</small></div></div>}

function AidPanel(){const steps=[['01','물 밖으로 이동','환부를 문지르거나 만지지 마세요.'],['02','바닷물로 충분히 세척','수돗물이나 생수는 사용하지 마세요.'],['03','촉수를 조심히 제거','카드 모서리나 핀셋을 사용하세요.'],['04','안전요원 또는 119','호흡곤란·구토가 있으면 바로 신고하세요.']];return <div className="aid-layout"><div className="aid-warning"><b>!</b><p><strong>먼저 안전요원에게 알려주세요</strong><span>심한 통증이나 전신 증상이 있으면 즉시 119</span></p></div><div className="aid-steps">{steps.map(s=><div key={s[0]}><b>{s[0]}</b><span><strong>{s[1]}</strong><small>{s[2]}</small></span></div>)}</div></div>}

function PlanPanel(){const places=[['MEDIA','뮤지엄 원','해운대구','몰입형 미디어아트'],['FREE','부산현대미술관','사하구','무료 현대미술 전시'],['COOL','영화의전당','해운대구','영화와 실내 라운지'],['FAMILY','국립부산과학관','기장군','체험형 과학 전시']];return <div className="plan-grid">{places.map((p,i)=><button key={p[1]} className={`plan-${i}`}><span>{p[0]}</span><small>{p[2]} · 실내</small><b>{p[1]}</b><em>{p[3]}</em><i>추천 보기 →</i></button>)}</div>}
