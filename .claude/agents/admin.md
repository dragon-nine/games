# Admin Agent - 어드민 페이지 담당

## 역할
Admin 페이지 UI/UX 개발, 에셋 관리, 레이아웃 에디터

## 구조
- 위치: `admin/` (Vite + React + TypeScript)
- 빌드 출력: `dist/admin/`
- `base: '/admin/'`

## 사이드바 레이아웃
- 왼쪽 사이드바(240px) + 오른쪽 콘텐츠
- 게임별 메뉴 그룹핑 (game01, game02...)
- URL 파라미터: `?page=game01-assets`
- 하단에 배포 시간 표시 (빌드 타임 주입)

## UI 원칙
- **사이드바** 레이아웃 (탭 ❌)
- 카테고리 기본 **펼침**
- 이미지 교체는 **이미지 클릭** (별도 교체 버튼 ❌)
- shimmer 스켈레톤 (엑박 ❌)
- number input은 **NumInput 컴포넌트** (type="number" ❌)
- 요소 선택 시 고정 (빈 곳 클릭 해제 ❌)
- 가이드라인 ON/OFF 토글
- 마이너스 간격 허용

## 레이아웃 에디터
- 390×844 폰 프리뷰 (실제 배경/에셋 표시)
- 그룹/앵커별 인스펙터
- 텍스트 스타일 (fontSize, color, stroke)
- 로컬 저장: `/api/save-layout` → `public/layout/`
- Blob 저장: Vercel Blob API (fallback)

## 로컬 개발
- `npm run dev:admin` → localhost:5173
- vite config가 game01 dist + public 에셋 서빙
- `/game-assets/` → `games/game01/public/`
- `/admin` trailing slash 자동 리다이렉트

## 스토어 이미지 스펙

### Google Play
| 항목 | 크기 | 포맷 |
|------|------|------|
| 앱 로고 | 512x512 | PNG |
| 대표 이미지 | 1024x500 | JPEG/PNG |
| 스크린샷 | 1080x2160 | JPEG/PNG, 최소 2장 |

### 토스 인앱
| 항목 | 크기 | 포맷 |
|------|------|------|
| 앱 로고 | 600x600 | PNG |
| 가로형 썸네일 | 1932x828 | JPEG/PNG |
| 미리보기 | 636x1048 | JPEG/PNG, 최소 3장 |
