# HWP 자동 수식 입력기 - 변경 이력 (CHANGELOG)

> 제작: 성당중학교 수학교사 한윤석

---

## v1.1.0 (2026-02-21) — 선분(bar) 분수 변환 개선

### 문제 (Bug)
- `(AE^2/BE^3)` 같은 **선분 포함 분수**가 하이브리드 모드에서 `LEFT ( {AE^2} over {BE^3} RIGHT )`로 변환됨
- `AE`, `BE` 등 2글자 대문자 선분에 `bar {}` 래핑이 누락되는 버그
- **원인 (JS)**: `(AE^2/BE^3)`가 FORMULA 타입으로 토큰화되어 SEGMENT 전용 bar 변환이 적용되지 않음
- **원인 (Python)**: `convert_all_to_bar` 이후 `{bar {AE}}^2` 형태가 되면 분수 regex `[^\s`{}\/]+`이 중괄호를 처리하지 못함

### 수정 내용

#### JS (`hwp_auto_app.html`)

**신규 함수 추가:**
```
applyBarToUpperPairs(text)  — line ~1570
```
- 2글자 대문자 시퀀스(AE, BE, AB, CD 등)를 `rmbar {XX}`로 변환
- 단위(cm, mm, km 등), AA, 이미 bar 내부인 경우 제외
- `\b([A-Z]{2})\b` 패턴 사용

**적용 위치 (총 14곳):**

| 위치 (대략 line) | 핸들러 | 변환 예시 |
|---|---|---|
| ~1641 | `(expr)/(expr)^sup` 분자 괄호+위첨자 | `{applyBar(numInner)} over {applyBar(denom)}` |
| ~1644 | `(expr)/(expr)` 분자 괄호 | 동일 |
| ~1676 | `(expr)/num^sup` | 동일 |
| ~1679 | `(expr)/num` | 동일 |
| ~1942-1943 | `(num/den)^superscript` | `cleanNum/cleanDen`에 적용 |
| ~1986 | 쉼표 구분 분수 `(8/3, 1/3)` | 각 항목 num/den에 적용 |
| ~2008-2009 | 일반 괄호 분수 `(AE/BE)` | `cleanNum/cleanDen`에 적용 |
| ~2033 | 괄호 내 연산자+분수 | num/den에 적용 |
| ~2191-2192 | `convertFraction` 내부 (등호/부등호 앞) | `numPart/denPart`에 적용 |
| ~2363-2364 | 독립 `convertFraction` (등호/부등호 없음) | `numPart/denPart`에 적용 |

#### Python (`formula_converter.py`)

**1. 마커 보호 방식 (line ~196-211)**
```python
_bar_frac_markers = []
_bar_frac_prefix = '__BARFRAC_'
```
- `{bar {XX}}` 패턴 → `__BARFRAC_N__` 마커로 치환
- `bar {XX}` 패턴 (위첨자 없는 경우) → 마커로 치환
- 기존 분수 regex가 마커를 정상 매칭

**2. 괄호 분수 핸들러 추가 (line ~302-331)**
```python
def paren_fraction_repl(m):
```
- `(num/den)` → `LEFT ( {num} over {den} RIGHT )` 변환
- 위첨자 `^N` 분리 처리
- 연산자/over 포함 시 스킵

**3. 마커 복원 + 이중 중괄호 방지 (line ~335-343)**
```python
for marker, value in _bar_frac_markers:
    wrapped = '{' + marker + '}'
    if wrapped in result and value.startswith('{') and value.endswith('}'):
        result = result.replace(wrapped, value)  # {{bar {AE}}} → {bar {AE}}
    result = result.replace(marker, value)
```

### 변환 결과 비교

| 입력 | v1.0 (수정 전) | v1.1 (수정 후) |
|---|---|---|
| `(AE^2/BE^3)` | `LEFT ( {AE^2} over {BE^3} RIGHT )` | `LEFT ( {bar {AE}}^2 over {bar {BE}}^{3} RIGHT )` |
| `AE^2/BE^3` | `{AE}^2 over {BE}^{3}` (SEGMENT) | `{bar {AE}}^2 over {bar {BE}}^{3}` |
| `(AE/BE)` | `LEFT ( {AE} over {BE} RIGHT )` | `LEFT ( {bar {AE}} over {bar {BE}} RIGHT )` |
| `(AB^2/CD^3)` | `LEFT ( {AB^2} over {CD^3} RIGHT )` | `LEFT ( {bar {AB}}^2 over {bar {CD}}^{3} RIGHT )` |
| `3/5` | `{3} over {5}` | `{3} over {5}` (변경 없음) |
| `AB = 6cm` | `bar {AB} = 6\`rmcm` | `bar {AB} = 6\`rmcm` (변경 없음) |
| `(1/2)` | `LEFT ( {1} over {2} RIGHT )` | `LEFT ( {1} over {2} RIGHT )` (변경 없음) |

### JS FORMULA 경로 vs SEGMENT 경로

| 경로 | bar 형식 | 설명 |
|---|---|---|
| FORMULA (JS) | `rmbar {AE}` | `rm`(Roman 폰트) + `bar`(윗줄) — 분수 내부에 직접 삽입 |
| SEGMENT (JS) | `bar {AE}` + 앞에 `RM` | 기존 방식 유지 — 전체 앞에 RM 접두사 |
| Python FORMULA | `bar {AE}` | bar 래핑 후 마커 보호 |
| Python SEGMENT | `RM` + `bar {AE}` | RM 접두사 추가 |

### 영향 받지 않는 기존 기능
- 순수 숫자 분수 (`3/5`, `1/2`)
- 단위 변환 (`6cm` → `6\`rmcm`)
- 도형 기호 (`△ABC`)
- 선분 단독 표기 (`AB = CD`)
- 복합 단위 (`km/h`)
- 위첨자 단독 (`AB^2 = 5`)

### 수정 파일
- `hwp_auto_app.html` — JS 프론트엔드 수식 변환
- `formula_converter.py` — Python 백엔드 수식 변환

---

## v1.0.0 (초기 버전)

### 주요 기능
- 웹 브라우저 기반 수식 입력 인터페이스
- HWP 자동 수식 삽입 (pyhwpx)
- 하이브리드 모드 (한글 텍스트 + 수식 혼합 입력)
- 텍스트 세그먼트 토크나이저 (KOREAN / FORMULA / SEGMENT)
- 선분 자동 변환 (`AB` → `bar {AB}`)
- 단위 자동 변환 (`6cm` → `6\`rmcm`)
- 분수 자동 변환 (`a/b` → `{a} over {b}`)
- 괄호 분수 (`(1/2)` → `LEFT ( {1} over {2} RIGHT )`)
- 위첨자/아래첨자 처리
- 도형 기호 인식 (△, □, ○, ∠ 등)
- 복합 단위 처리 (km/h, m/s 등)

### 구성 파일
| 파일 | 역할 |
|---|---|
| `hwp_auto_app.html` | 웹 UI + JS 수식 변환 엔진 |
| `hwp_server.py` | Flask 서버 + HWP COM 연동 |
| `formula_converter.py` | Python 수식 변환 모듈 |
| `text_tokenizer.py` | 텍스트 세그먼트 분류기 |
| `hybrid_executor.py` | 하이브리드 삽입 실행기 |
| `variable_detector.py` | 변수/패턴 감지 모듈 |
| `batch_converter.py` | 일괄 변환 모듈 |
| `batch_converter_gui.py` | 일괄 변환 GUI |
| `start_server_and_browser.py` | 서버+브라우저 통합 실행 |
