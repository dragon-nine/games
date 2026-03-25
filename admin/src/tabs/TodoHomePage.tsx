import { useState } from 'react'

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

type TodoItem = { text: string; done: boolean; indent?: number }
type TodoPhase = { phase: string; items: TodoItem[] }

// ---------------------------------------------------------------------------
// 직장인 잔혹사 (game01) 개발 체크리스트 — 30년차 게임 PM 기준
// ---------------------------------------------------------------------------

const TODO_PHASES: TodoPhase[] = [
  {
    phase: 'Phase 1: 코어 게임플레이 (P0)',
    items: [
      { text: 'Stage 1 — 출근: 천국의 계단 (무한의 계단)', done: true },
      { text: 'Stage 2 — 오전: 보고서 오탈자 (컬링 퍼즐)', done: false },
      { text: 'Stage 3 — 점심: 메뉴 받아내기 (기억력+캐치)', done: false },
      { text: 'Stage 4 — 오후 회의: 회의록 작성 (테트리스)', done: false },
      { text: 'Stage 5 — 퇴근: 술 버리기 (타이밍 액션)', done: false },
      { text: '스테이지 순차 진행 시스템 (1→2→3→4→5)', done: false },
      { text: '스테이지 간 전환 연출 (시간대 변경 + 인트로)', done: false },
      { text: '최종 등급 화면 (S/A/B/C/D 판정)', done: false },
      { text: '총합 점수 집계 시스템', done: false },
      { text: '스테이지별 결과 화면 (점수 표시)', done: false },
    ],
  },
  {
    phase: 'Phase 2: 게임 폴리시 & 주스',
    items: [
      { text: 'FTUE 튜토리얼 (첫 실행 조작 가이드)', done: false },
      { text: '3-2-1-GO 카운트다운 (스테이지 시작)', done: false },
      { text: '스테이지 인트로 화면 (시간대 + 대사)', done: false },
      { text: '콤보 이펙트 강화 (10콤보 팝업 + 파티클)', done: false },
      { text: '추락 이펙트 강화 (셰이크 + 먼지 파티클)', done: false },
      { text: '화면 전환 애니메이션 (페이드/슬라이드)', done: false },
      { text: '햅틱 피드백 (버튼 탭, 추락, 콤보)', done: false },
      { text: '점수 카운터 롤업 애니메이션 (게임오버)', done: false },
      { text: 'New Record 연출 (글로우 + 파티클)', done: false },
      { text: 'UI 버튼 터치 피드백 개선 (리플/스케일)', done: false },
    ],
  },
  {
    phase: 'Phase 3: 사운드 & 비주얼',
    items: [
      { text: '메뉴 BGM 교체 (현재 placeholder)', done: false },
      { text: '게임플레이 BGM 교체', done: false },
      { text: '스테이지별 BGM 분리 (5곡)', done: false },
      { text: '콤보 단계 전환 사운드', done: false },
      { text: '타이머 10초 미만 틱 사운드', done: false },
      { text: '게임오버 사운드 강화', done: false },
      { text: '캐릭터 스프라이트 리파인 (front/back/side)', done: false },
      { text: '배경 아트 스테이지별 분리', done: false },
      { text: '맵 타일 디자인 리파인', done: false },
    ],
  },
  {
    phase: 'Phase 4: UX & 접근성',
    items: [
      { text: '로딩/스플래시 화면', done: false },
      { text: '규칙 설명/도움말 화면', done: false },
      { text: '오프라인 대응 (에러 화면)', done: false },
      { text: 'UI 문자열 상수화 (i18n 대비)', done: false },
      { text: '에러 핸들링 강화 (빈 catch 수정)', done: false },
      { text: '저사양 디바이스 대응 (FPS 최적화)', done: false },
      { text: '다양한 해상도/비율 테스트 (SE~Pro Max)', done: false },
      { text: '접근성 개선 (최소 터치 영역 44px)', done: false },
    ],
  },
  {
    phase: 'Phase 5: 리더보드 & 소셜',
    items: [
      { text: 'Google Play leaderboardId 설정', done: false },
      { text: 'Google Play 리더보드 실연동 테스트', done: false },
      { text: '토스 리더보드 실환경 테스트', done: false },
      { text: '카카오톡/웹 공유 기능', done: false },
      { text: '점수 카드 이미지 캡처 공유', done: false },
      { text: '친구 챌린지 시스템', done: false },
      { text: '부활 시스템 정교화 (제한 횟수, 광고 연동)', done: false },
    ],
  },
  {
    phase: 'Phase 6: 수익화',
    items: [
      { text: '사업자등록 완료 (Toss/Google 결제 필수)', done: false },
      { text: '광고 SDK 연동 (AdMob 보상형)', done: false },
      { text: '부활 광고 stub → 실제 연동', done: false },
      { text: '삽입 광고 (매 N게임)', done: false },
      { text: 'IAP 검토 (광고 제거, 스킨 등)', done: false },
    ],
  },
  {
    phase: 'Phase 7: 출시 준비',
    items: [
      { text: '앱 아이콘 최종 확정', done: false },
      { text: '스토어 스크린샷 제작 (Google Play)', done: false },
      { text: '스토어 스크린샷 제작 (토스 인앱)', done: false },
      { text: '스토어 등록 문구 작성 (ASO)', done: false },
      { text: '피처 그래픽 제작', done: false },
      { text: '개인정보처리방침 URL', done: false },
      { text: '네이티브 앱 래핑 (Capacitor/TWA)', done: false },
      { text: '성능 최적화 (컴포넌트 분리, 번들 크기)', done: false },
      { text: '크래시 모니터링 (Sentry)', done: false },
      { text: '디바이스 QA 테스트 (Android/iOS 각 3기종+)', done: false },
    ],
  },
  {
    phase: 'Phase 8: 운영 & 인프라',
    items: [
      { text: '분석 이벤트 로깅 (GA/Firebase)', done: false },
      { text: '치트 방지 / 서버 사이드 점수 검증', done: false },
      { text: 'Rate Limiting (API 요청 제한)', done: false },
      { text: '핫픽스 배포 프로세스 정리', done: false },
      { text: '유저 피드백 채널 구축', done: false },
      { text: 'A/B 테스트 인프라 (난이도 밸런싱)', done: false },
    ],
  },
]

// ---------------------------------------------------------------------------
// Lucide-style icon
// ---------------------------------------------------------------------------

function LucideIcon({ d, size = 16, color = 'currentColor' }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  )
}

const CHECK_SQUARE_D = 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'

// ---------------------------------------------------------------------------
// LocalStorage persistence
// ---------------------------------------------------------------------------

const TODO_STORAGE_KEY = 'game01-todo-done'

function useTodoDone() {
  const [doneSet, setDoneSet] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(TODO_STORAGE_KEY)
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch { return new Set() }
  })
  const toggle = (key: string) => {
    setDoneSet(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify([...next]))
      return next
    })
  }
  return { doneSet, toggle }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TodoHomePage() {
  const { doneSet, toggle } = useTodoDone()

  const allItems = TODO_PHASES.flatMap((p, pi) =>
    p.items.filter(it => it.indent === undefined || it.indent === 0).map((_, ii) => `${pi}-${ii}`)
  )
  const doneCount = allItems.filter(k => doneSet.has(k)).length
  const progress = Math.round((doneCount / allItems.length) * 100)

  return (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <LucideIcon d={CHECK_SQUARE_D} size={22} color="#3182F6" /> TO DO
      </h2>
      <div style={{ fontSize: 13, color: '#8B95A1', marginBottom: 20 }}>직장인 잔혹사 전체 개발 체크리스트</div>

      {/* 전체 진행률 */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E8ED', padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>전체 진행률</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#3182F6' }}>{doneCount} / {allItems.length} ({progress}%)</span>
        </div>
        <div style={{ background: '#F0F0F5', borderRadius: 100, height: 10, overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`, height: '100%', borderRadius: 100,
            background: 'linear-gradient(90deg, #3182F6, #60a5fa)',
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Phase별 체크리스트 */}
      {TODO_PHASES.map((phase, pi) => {
        let topIdx = -1
        const phaseKeys = phase.items.map((it) => {
          if (it.indent === undefined || it.indent === 0) topIdx++
          return `${pi}-${topIdx}`
        })
        const phaseTopKeys = phase.items
          .filter(it => it.indent === undefined || it.indent === 0)
          .map((_, i) => `${pi}-${i}`)
        const phaseDoneCount = phaseTopKeys.filter(k => doneSet.has(k)).length

        return (
          <div key={pi} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E8ED', padding: '20px 24px', marginBottom: 12 }}>
            {/* Phase 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#191F28' }}>{phase.phase}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#8B95A1' }}>{phaseDoneCount}/{phaseTopKeys.length}</span>
                <div style={{ background: '#F0F0F5', borderRadius: 100, height: 6, width: 80, overflow: 'hidden' }}>
                  <div style={{
                    width: phaseTopKeys.length > 0 ? `${Math.round((phaseDoneCount / phaseTopKeys.length) * 100)}%` : '0%',
                    height: '100%', borderRadius: 100,
                    background: phaseDoneCount === phaseTopKeys.length ? '#10b981' : '#3182F6',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            </div>

            {/* 아이템 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {phase.items.map((item, ii) => {
                const key = phaseKeys[ii]
                const done = doneSet.has(key)
                return (
                  <div key={ii} onClick={() => toggle(key)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                    marginLeft: item.indent ? item.indent * 24 : 0,
                    background: done ? '#F0FDF4' : 'transparent',
                  }}>
                    {/* 체크박스 */}
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                      border: done ? 'none' : '2px solid #D1D5DB',
                      background: done ? '#10b981' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 150ms',
                    }}>
                      {done && (
                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                          <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {/* 텍스트 */}
                    <span style={{
                      fontSize: item.indent ? 12 : 13,
                      color: done ? '#6B7280' : '#191F28',
                      textDecoration: done ? 'line-through' : 'none',
                      lineHeight: 1.5,
                      transition: 'all 150ms',
                    }}>
                      {item.text}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}
