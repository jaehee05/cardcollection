import { useEffect, useRef, useState } from "react";

const THRESHOLD = 70; // 새로고침 트리거 거리(px)
const MAX_PULL = 120;
const RESISTANCE = 0.5; // 손가락 이동 대비 인디케이터 이동 비율

// 모바일에서 페이지 최상단에서 아래로 끌어당기면 새로고침되는 동작.
// PWA(standalone) 모드에서는 브라우저 기본 pull-to-refresh가 없으므로 직접 구현.
export function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const draggingRef = useRef(false);
  const pullRef = useRef(0);

  useEffect(() => {
    function setPullBoth(v: number) {
      pullRef.current = v;
      setPull(v);
    }

    function onStart(e: TouchEvent) {
      if (window.scrollY > 0) {
        draggingRef.current = false;
        return;
      }
      if (e.touches.length !== 1) return;
      startY.current = e.touches[0].clientY;
      draggingRef.current = true;
    }

    function onMove(e: TouchEvent) {
      if (!draggingRef.current || refreshing) return;
      // 도중에 스크롤이 발생하면 중단
      if (window.scrollY > 0) {
        draggingRef.current = false;
        setPullBoth(0);
        return;
      }
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        setPullBoth(0);
        return;
      }
      const eased = Math.min(MAX_PULL, dy * RESISTANCE);
      setPullBoth(eased);
      // 페이지 최상단에서 아래로 당기는 동안은 native bounce 막기
      if (e.cancelable) e.preventDefault();
    }

    function onEnd() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (pullRef.current >= THRESHOLD) {
        setRefreshing(true);
        setPullBoth(60);
        // 인디케이터가 잠깐 보인 뒤 reload
        window.setTimeout(() => {
          window.location.reload();
        }, 250);
      } else {
        setPullBoth(0);
      }
    }

    // touchmove는 preventDefault 호출을 위해 passive=false 필요
    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd, { passive: true });
    document.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, [refreshing]);

  if (pull === 0 && !refreshing) return null;

  const reached = pull >= THRESHOLD;
  const label = refreshing
    ? "새로고침 중…"
    : reached
      ? "↑ 놓으면 새로고침"
      : "↓ 더 당겨 주세요";

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center"
      style={{
        transform: `translateY(${Math.max(0, pull - 30)}px)`,
        transition: refreshing || pull === 0 ? "transform 200ms ease" : "none",
      }}
      aria-live="polite"
    >
      <div
        className={`mt-2 rounded-full bg-white px-4 py-1.5 text-[12px] font-extrabold shadow-card transition-colors ${
          reached || refreshing
            ? "text-brand-mintDark"
            : "text-brand-gray"
        }`}
      >
        {refreshing && (
          <span className="mr-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-brand-mint border-t-transparent align-[-2px]" />
        )}
        {label}
      </div>
    </div>
  );
}
