import { useCallback, useRef } from 'react';

/**
 * 네이티브 DOM 이벤트로 안정적인 탭 핸들러 등록.
 *
 * iOS WebKit의 onPointerDown 누락 문제를 우회하기 위한 훅.
 * 빠른 연속 입력이 중요한 게임 버튼에 사용.
 *
 * 동작:
 * - touchstart {passive: false} + preventDefault → 후속 mouse 이벤트 차단 (중복 실행 방지)
 * - mousedown → 데스크탑(마우스) 호환
 * - React 합성 이벤트 우회 → 더 빠르고 누락 없음
 *
 * 사용:
 *   const tapRef = useNativeTap(() => { ... });
 *   return <div ref={tapRef}>...</div>;
 *
 * callback ref 패턴 사용 — 엘리먼트가 마운트될 때 자동으로 리스너 등록.
 * useEffect 기반 ref와 달리 조건부 렌더링과 잘 동작함.
 *
 * 출처:
 * - https://github.com/facebook/react/issues/12901 (React onPointerDown iOS 누락)
 * - https://bugs.webkit.org/show_bug.cgi?id=211521 (WebKit 회귀)
 * - https://patrickhlauke.github.io/getting-touchy-presentation/ (모바일 입력 권장 패턴)
 */
interface Options {
  /**
   * 스크롤 가능한 컨테이너 안의 버튼인 경우 true.
   * - touchstart에서 preventDefault 안 함 → 네이티브 스크롤 허용
   * - touchend에서 손가락 이동 거리 검사 → 이동 시 onTap 무시 (스크롤로 간주)
   * - 게임 인풋(즉시 반응 필요)에는 사용 X.
   */
  scrollSafe?: boolean;
}

const SCROLL_THRESHOLD_PX = 8;

export function useNativeTap(onTap: () => void, options: Options = {}) {
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;
  const scrollSafe = options.scrollSafe ?? false;

  const cleanupRef = useRef<(() => void) | null>(null);

  return useCallback((el: HTMLElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!el) return;

    let lastPrimaryFire = 0;
    const CLICK_SUPPRESS_MS = 500;

    if (scrollSafe) {
      // 스크롤 친화 모드: touchend에서 발사, 이동 거리 검사
      let startX = 0;
      let startY = 0;
      let moved = false;

      const onTouchStart = (e: TouchEvent) => {
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        moved = false;
        // preventDefault 호출 안 함 → 브라우저 스크롤 정상 동작
      };

      const onTouchMove = (e: TouchEvent) => {
        if (moved) return;
        const t = e.touches[0];
        const dx = Math.abs(t.clientX - startX);
        const dy = Math.abs(t.clientY - startY);
        if (dx > SCROLL_THRESHOLD_PX || dy > SCROLL_THRESHOLD_PX) {
          moved = true;
        }
      };

      const onTouchEnd = (e: TouchEvent) => {
        if (moved) return;
        e.preventDefault(); // 후속 click 차단 (중복 방지)
        lastPrimaryFire = e.timeStamp;
        onTapRef.current();
      };

      const onMouseDown = () => {
        lastPrimaryFire = performance.now();
        onTapRef.current();
      };

      const onClick = () => {
        const now = performance.now();
        if (now - lastPrimaryFire < CLICK_SUPPRESS_MS) return;
        onTapRef.current();
      };

      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchmove', onTouchMove, { passive: true });
      el.addEventListener('touchend', onTouchEnd);
      el.addEventListener('mousedown', onMouseDown);
      el.addEventListener('click', onClick);

      cleanupRef.current = () => {
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchmove', onTouchMove);
        el.removeEventListener('touchend', onTouchEnd);
        el.removeEventListener('mousedown', onMouseDown);
        el.removeEventListener('click', onClick);
      };
      return;
    }

    // 기본 모드: touchstart 즉시 발사 (게임 인풋용)
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      lastPrimaryFire = e.timeStamp;
      onTapRef.current();
    };

    const onMouseDown = () => {
      lastPrimaryFire = performance.now();
      onTapRef.current();
    };

    const onClick = () => {
      const now = performance.now();
      if (now - lastPrimaryFire < CLICK_SUPPRESS_MS) return;
      onTapRef.current();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('click', onClick);

    cleanupRef.current = () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('click', onClick);
    };
  }, [scrollSafe]);
}
