# 🎓 CBCI MATH 교육 자료 사이트

Apple Store 디자인 시스템을 적용한 수학 교육 자료 플랫폼

---

## ✨ 주요 기능

### **📚 6개 탭 구성**
- **공지사항** - 중요 공지 및 업데이트
- **수업자료** - 학년별 수업 자료
- **탐구자료** - 학년별 탐구 자료
- **평가자료** - 학년별 평가 자료
- **CBCI 설계** - CBCI 교육 설계 자료
- **With** - 협업 및 커뮤니티

### **🔐 계정 시스템**
- **회원가입/로그인** - Supabase Auth 기반
- **Google OAuth** - 소셜 로그인 지원
- **Master 계정** - 관리자 권한
  - 아이디: `master` 또는 `master@cbcimath.com`
  - 비밀번호: `master!!`

### **📤 자료 업로드**
- HTML 파일 업로드
- 자동 썸네일 생성
- 학교구분/학년/단원 분류
- 카드 형식 표시

### **🎨 Apple 디자인 시스템**
- Apple Blue (#007AFF)
- 미니멀 디자인
- 깔끔한 타이포그래피

---

## 🚀 현재 상태

### ✅ **완전 작동 중**

**LocalStorage 모드로 전환되어 모든 기능이 즉시 사용 가능합니다!**

- ✅ 공지사항 작성/수정/삭제
- ✅ 수업자료 업로드/관리
- ✅ 탐구자료 업로드/관리
- ✅ 평가자료 업로드/관리
- ✅ CBCI 설계 업로드/관리
- ✅ 로그인/회원가입
- ✅ Master 계정 관리
- ⏳ Google OAuth (Provider 설정 필요)

---

## 📊 데이터 저장 방식

### **LocalStorage 모드 (현재)**

브라우저 LocalStorage에 데이터를 저장합니다.

**장점:**
- ✅ 즉시 사용 가능
- ✅ 배포 불필요
- ✅ 빠른 속도

**주의사항:**
- ⚠️ 브라우저 캐시 삭제 시 데이터 손실
- ⚠️ 다른 기기에서 데이터 공유 불가
- ⚠️ 용량 제한 (5-10MB)

**데이터 백업 권장!** (자세한 내용: `LOCALSTORAGE_INFO.md`)

---

## 🎯 사용 방법

### **1. Master 계정으로 로그인**

1. 우측 상단 **ShoppingBag 아이콘** 클릭
2. **"회원가입하기"** 클릭
3. **아이디:** `master`
4. **비밀번호:** `master!!`
5. **로그인** 버튼 클릭

### **2. 공지사항 작성**

1. **공지사항** 탭 클릭
2. 우측 상단 **+ 공지사항 등록** 버튼 클릭
3. 제목, 내용, 카테고리 입력
4. **등록** 버튼 클릭

### **3. 자료 업로드**

1. 원하는 탭 선택 (수업자료/탐구자료/평가자료/CBCI 설계)
2. 우측 상단 **Upload 아이콘** 클릭
3. 학교구분, 학년, 단원, 제목 선택/입력
4. HTML 파일 선택
5. **업로드** 버튼 클릭
6. 자동으로 썸네일 생성 및 카드 표시

### **4. 자료 관리**

- **수정:** 카드의 **Edit 아이콘** 클릭
- **삭제:** 카드의 **Trash 아이콘** 클릭
- **보기:** 카드 클릭 시 자료 열람

---

## 🔧 선택적 설정

### **Google OAuth 설정**

Google 계정으로 로그인하려면:

1. **Supabase Dashboard** 접속
   ```
   https://supabase.com/dashboard/project/mwwnmcdhmfoeolexdwld/auth/providers
   ```

2. **Google Provider 활성화**
   - Enable Sign in with Google → ON
   - Client ID: `792200959505-id28o0pp0imt5sdi042ggnj10htuqbus.apps.googleusercontent.com`
   - Client Secret: `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`
   - Save 클릭

3. **Google Cloud Console 설정**
   - https://console.cloud.google.com/apis/credentials
   - OAuth 클라이언트 ID 선택
   - 승인된 리디렉션 URI 추가:
     ```
     https://mwwnmcdhmfoeolexdwld.supabase.co/auth/v1/callback
     ```

### **Edge Function 전환 (선택)**

서버 기반 데이터 저장으로 전환하려면:

1. **`/utils/api.ts` 수정**
   ```typescript
   const USE_LOCALSTORAGE = false; // true → false
   ```

2. **Edge Function 배포**
   ```bash
   supabase link --project-ref mwwnmcdhmfoeolexdwld
   supabase functions deploy make-server-7e316a07
   ```

---

## 📱 기술 스택

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Auth:** Supabase Auth
- **Storage:** LocalStorage (현재) / Supabase Edge Function (선택)
- **Icons:** Lucide React

---

## 📂 프로젝트 구조

```
├── App.tsx                 # 메인 컴포넌트
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트
│   └── figma/              # 커스텀 컴포넌트
├── utils/
│   ├── api.ts              # API 함수 (LocalStorage 모드)
│   └── supabase/           # Supabase 설정
├── supabase/functions/     # Edge Function (선택)
└── styles/globals.css      # 전역 스타일
```

---

## 🎨 디자인 시스템

### **색상 팔레트**
- **Apple Blue:** #007AFF
- **Black:** #1D1D1F
- **White:** #FFFFFF
- **Light Gray:** #F5F5F7
- **Dark Gray:** #86868B

### **타이포그래피**
- SF Pro Display (Apple 시스템 폰트)
- 깔끔하고 읽기 쉬운 글꼴

---

## 🔒 보안

- ✅ Supabase Auth 기반 인증
- ✅ Master 계정 보호
- ✅ 로그인 필수 탭 (수업자료, 탐구자료, 평가자료, CBCI 설계)
- ⚠️ LocalStorage 모드는 클라이언트 저장 (보안 주의)

---

## 📚 문서

- **LocalStorage 모드:** `LOCALSTORAGE_INFO.md`
- **Attributions:** `Attributions.md`
- **Guidelines:** `guidelines/Guidelines.md`

---

## 🎯 체크리스트

### **기본 기능:**
- [x] 6개 탭 네비게이션
- [x] 공지사항 CRUD
- [x] 자료 업로드/수정/삭제
- [x] 썸네일 자동 생성
- [x] 학년별 필터링
- [x] 로그인/회원가입
- [x] Master 계정 관리

### **선택 기능:**
- [ ] Google OAuth 설정
- [ ] Edge Function 배포
- [ ] Supabase Database 연동

---

## 💡 팁

### **데이터 백업**
```javascript
// F12 → Console
const backup = {
  notices: localStorage.getItem('notices'),
  lessons: localStorage.getItem('lessons'),
  research: localStorage.getItem('research'),
  evaluations: localStorage.getItem('evaluations'),
  cbci: localStorage.getItem('cbci')
};
console.log(JSON.stringify(backup));
// 결과를 복사하여 저장
```

### **데이터 복원**
```javascript
// 백업한 데이터를 다시 로드
const backup = { /* 백업 데이터 */ };
localStorage.setItem('notices', backup.notices);
// ... 나머지
location.reload();
```

---

## 🚀 시작하기

1. **Master 계정 로그인**
   - ID: `master` / PW: `master!!`

2. **공지사항 작성**
   - 공지사항 탭 → + 버튼

3. **자료 업로드**
   - 수업자료/탐구자료 등 탭 → Upload 버튼

4. **즐기기!** 🎉

---

## ❓ FAQ

**Q: 데이터가 사라졌어요!**
A: 브라우저 캐시를 삭제했거나 시크릿 모드를 사용한 경우입니다. 정기적으로 백업하세요.

**Q: Google 로그인이 안 돼요!**
A: Supabase Dashboard에서 Google Provider를 활성화하세요.

**Q: 파일 업로드가 안 돼요!**
A: HTML 파일만 업로드 가능합니다. 파일 형식을 확인하세요.

**Q: 다른 사람과 공유하고 싶어요!**
A: Edge Function을 배포하거나 Supabase Database를 사용하세요.

---

## 🎊 완성!

**모든 기능이 정상 작동합니다. 자유롭게 사용하세요!**

문제가 발생하면 `LOCALSTORAGE_INFO.md`를 참고하거나 개발자 도구(F12)의 Console 탭을 확인하세요.

---

Made with ❤️ for CBCI MATH Education
