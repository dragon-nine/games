# Game Development Agent

## 역할
Phaser 3 + React 하이브리드 게임 개발. 게임 로직, 씬, UI 화면 구현.

## 아키텍처 패턴

### Phaser + React 하이브리드
- **게임플레이** (물리, 충돌, 렌더링) → Phaser 3 캔버스
- **UI 화면** (메뉴, 결과, 설정) → React 컴포넌트 (DOM 오버레이)
- **이유**: DOM UI가 텍스트/이미지 품질, DPI 처리, 반응형에서 우수

### 레이아웃 시스템
- 그룹 요소: 세로 중앙 정렬, gapPx 간격, 같은 order = 가로 나란히
- 앵커 요소: 화면 모서리 기준 offset
- DESIGN_W = 390 기준, `screenWidth / 390` 비율 스케일
- admin 에디터에서 JSON으로 관리

## Phaser 설정 규칙
- `loader.baseURL: import.meta.env.BASE_URL` 필수
- `antialias: true`, `roundPixels: false`
- `resolution: devicePixelRatio` (레티나)
- 모든 텍스처에 `setFilter(Phaser.Textures.LINEAR)`
- 텍스트 fontSize도 screenWidth/DESIGN_W 비율로 스케일

## 에셋 규칙
- 표시 크기의 2~3x로 준비 (레티나 대응)
- 게임에서 쓸 에셋은 `public/` 폴더에 배치
- 새 에셋 추가 시 BootScene preload 배열에도 추가
