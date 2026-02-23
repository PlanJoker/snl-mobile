# SNL Mobile 디자인 아이디어

<response>
<probability>0.07</probability>
<text>
<idea>
**Design Movement**: Dark Brutalism + Neon Accent
**Core Principles**:
1. 검정 배경(#012E2B) + 노란 브랜드 컬러(#FFDC73)의 강렬한 대비
2. 모바일 퍼스트 — 엄지 손가락 도달 범위 기반 하단 탭 네비게이션
3. 카드 기반 콘텐츠 블록, 각 섹션이 독립적인 "타일"처럼 작동
4. 최소한의 장식, 정보 밀도 최대화

**Color Philosophy**:
- Background: `#012E2B` (딥 포레스트 그린-블랙)
- Brand: `#FFDC73` (웜 옐로우)
- Surface: `#0a3d39` (카드 배경)
- Text Primary: `#F8F8FF`
- Text Secondary: `#8fa8a5`
- 감정: 집중, 전문성, 에너지

**Layout Paradigm**:
- 하단 고정 탭 바 (5개 탭: Home, Calendar, WAM, Gallery, Admin)
- 각 페이지는 풀스크린 스크롤 가능 컨테이너
- 상단 상태바 스타일 헤더 (페이지 제목 + 액션 버튼)
- 카드 그리드 대신 세로 스택 레이아웃

**Signature Elements**:
1. 노란색 액센트 라인/도트로 활성 탭 표시
2. 카드에 미세한 노란 테두리 glow 효과
3. 섹션 헤더에 노란 왼쪽 보더 스트라이프

**Interaction Philosophy**:
- 탭 전환 시 슬라이드 애니메이션
- 버튼 탭 시 scale 피드백
- 풀-투-리프레시 제스처 지원

**Animation**:
- 페이지 진입: fade + translateY(20px) → 0
- 탭 전환: 수평 슬라이드
- 카드 로드: staggered fade-in
- 버튼: scale(0.97) on press

**Typography System**:
- Display: `Space Grotesk` Bold 700 — 헤더, 숫자, 강조
- Body: `Inter` Regular 400 — 본문, 레이블
- Mono: `JetBrains Mono` — WAM 점수, 날짜, 코드
</idea>
</text>
</response>

<response>
<probability>0.06</probability>
<text>
<idea>
**Design Movement**: Glassmorphism + Warm Dark
**Core Principles**:
1. 반투명 유리 카드 위에 노란 그라디언트 오버레이
2. 블러 효과로 깊이감 표현
3. 부드러운 곡선과 큰 터치 타겟
4. 정보 계층 명확화

**Color Philosophy**:
- Background: 딥 그린 그라디언트 `#011a18` → `#023530`
- Glass Card: `rgba(255,255,255,0.05)` + `backdrop-blur`
- Brand: `#FFDC73`
- 감정: 프리미엄, 모던, 따뜻함

**Layout Paradigm**:
- 하단 플로팅 탭 바 (둥근 pill 형태)
- 풀스크린 배경 그라디언트
- 유리 카드 레이어드 레이아웃

**Signature Elements**:
1. 유리 카드에 노란 상단 테두리 하이라이트
2. 플로팅 액션 버튼 (FAB)
3. 배경에 미세한 노이즈 텍스처

**Interaction Philosophy**:
- 카드 탭 시 유리 반짝임 효과
- 스크롤 시 패럴랙스 배경

**Animation**:
- 카드 진입: scale(0.95) → 1 + fade
- 탭 전환: crossfade
- 숫자 카운트업 애니메이션

**Typography System**:
- Display: `Syne` ExtraBold — 헤더
- Body: `DM Sans` — 본문
</idea>
</text>
</response>

<response>
<probability>0.05</probability>
<text>
<idea>
**Design Movement**: Neo-Brutalist Mobile
**Core Principles**:
1. 두꺼운 테두리 + 오프셋 그림자
2. 날카로운 모서리와 강한 타이포그래피
3. 노란색을 배경색으로 대담하게 사용
4. 격자 기반 레이아웃

**Color Philosophy**:
- Background: `#012E2B`
- Accent Blocks: `#FFDC73` (배경으로 사용)
- Border: `#FFDC73` 2px solid
- Shadow: `4px 4px 0 #FFDC73`

**Layout Paradigm**:
- 하단 탭 바 (두꺼운 상단 테두리)
- 카드에 오프셋 박스 섀도우
- 비대칭 그리드

**Signature Elements**:
1. `4px 4px 0 #FFDC73` 박스 섀도우
2. 두꺼운 2px 노란 테두리
3. 대문자 레이블

**Interaction Philosophy**:
- 버튼 클릭 시 섀도우 제거 (눌리는 효과)
- 강한 색상 반전 호버

**Animation**:
- 섀도우 offset 변화로 3D 누름 효과
- 페이지 전환: 슬라이드

**Typography System**:
- Display: `Space Grotesk` Black 900
- Body: `Space Grotesk` Regular
</idea>
</text>
</response>

## 선택: Dark Brutalism + Neon Accent (첫 번째 아이디어)

브랜드 아이덴티티(#012E2B + #FFDC73)를 그대로 유지하면서 모바일에 최적화된 레이아웃으로 구성.
Space Grotesk + Inter 타이포그래피, 하단 탭 네비게이션, 카드 기반 UI.
