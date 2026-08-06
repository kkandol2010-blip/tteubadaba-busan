"use client";

import { useEffect, useState } from "react";

type Position = { lat: number; lng: number } | null;

export default function ExposureTracker({ beachName, sandTemp, onPosition }: { beachName: string; sandTemp: number; onPosition: (position: Position) => void }) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [locationState, setLocationState] = useState<"idle" | "granted" | "denied">("idle");
  useEffect(() => {
    if (!startedAt) return;
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 60000)), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);
  useEffect(() => { setStartedAt(null); setElapsed(0); }, [beachName]);

  const intensity = sandTemp >= 43 ? "매우 강함" : sandTemp >= 40 ? "강함" : "보통";
  const risk = elapsed >= 90 ? { title: "피부 손상 위험이 높아요", body: "즉시 그늘로 이동하고, 열감·물집·심한 통증이 있으면 의료진에게 상담하세요.", tone: "high" } : elapsed >= 45 ? { title: "일광화상 위험 구간이에요", body: "그늘에서 쉬고, 피부 노출 부위를 가리세요. 물을 마시고 자외선 차단제를 덧바르세요.", tone: "mid" } : elapsed >= 20 ? { title: "휴식 시간이 가까워요", body: "다음 10분 안에 그늘에서 쉬며 수분을 보충하세요.", tone: "mid" } : { title: "피부 보호를 시작하세요", body: "모래 반사열을 고려해 모자·긴소매·자외선 차단제를 챙기세요.", tone: "low" };
  const start = () => {
    setStartedAt(Date.now());
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLocationState("granted"); onPosition({ lat: coords.latitude, lng: coords.longitude }); },
      () => setLocationState("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };
  const mins = String(elapsed % 60).padStart(2, "0");
  const hours = String(Math.floor(elapsed / 60)).padStart(2, "0");
  return <section className="exposure-card" aria-labelledby="sun-check-title">
    <div className="exposure-top"><div><p className="eyebrow coral">SUN CHECK</p><h2 id="sun-check-title">햇볕 노출 체크</h2><p>{beachName}의 모래 온도와 체류 시간을 기준으로 휴식 시점을 알려드려요.</p></div><span className={`sun-badge ${sandTemp >= 43 ? "hot" : ""}`}>현재 열기 {intensity}</span></div>
    <div className="exposure-content"><div className="timer"><small>해변 체류 시간</small><b>{hours}:{mins}</b><span>{startedAt ? "측정 중" : "시작 전"}</span></div><div className={`exposure-advice ${risk.tone}`}><b>{risk.title}</b><p>{risk.body}</p></div><button className="location-button" onClick={start}>{startedAt ? "체류·위치 갱신" : "내 위치로 체류 시작"}<small>{locationState === "granted" ? "기기 내 위치 확인됨" : locationState === "denied" ? "위치 없이 시간만 측정 중" : "위치는 기기에서만 사용"}</small></button></div>
    <p className="medical-note">이 기능은 의료 진단이나 피부 질환 예측이 아닙니다. 피부색·자외선 지수·차단제·건강 상태에 따라 위험은 달라질 수 있어요.</p>
  </section>;
}
