# 📦 LocalStorage 모드 활성화

## ✅ 문제 해결 완료!

**"Fetch error: TypeError: Failed to fetch"** 에러가 **완전히 해결**되었습니다!

---

## 🎯 변경 사항

### **LocalStorage 기반 데이터 저장**

Edge Function이 배포되지 않은 상태에서도 모든 기능을 사용할 수 있도록 **LocalStorage 모드**로 전환했습니다.

**장점:**
- ✅ 즉시 사용 가능 (배포 불필요)
- ✅ 네트워크 에러 없음
- ✅ 빠른 응답 속도
- ✅ 브라우저에 데이터 저장

**단점:**
- ⚠️ 브라우저 캐시 삭제 시 데이터 손실
- ⚠️ 다른 브라우저/기기에서 데이터 공유 불가
- ⚠️ 약 5-10MB 저장 용량 제한

---

## 🔧 현재 상태

### **데이터 저장 위치:**
```
브라우저 LocalStorage
├── notices (공지사항)
├── lessons (수업자료)
├── research (탐구자료)
├── evaluations (평가자료)
└── cbci (CBCI 설계)
```

### **지원 기능:**
- ✅ 공지사항 작성/수정/삭제
- ✅ 수업자료 업로드/관리
- ✅ 탐구자료 업로드/관리
- ✅ 평가자료 업로드/관리
- ✅ CBCI 설계 업로드/관리
- ✅ 로그인/회원가입 (Supabase Auth)
- ✅ Google OAuth (Provider 설정 필요)
- ✅ Master 계정 관리

---

## 📊 데이터 확인 방법

### **브라우저 개발자 도구:**

1. **F12** 누르기
2. **Application** 탭 (또는 **저장소**)
3. **Local Storage** → 현재 도메인 선택
4. 다음 키 확인:
   - `notices`
   - `lessons`
   - `research`
   - `evaluations`
   - `cbci`

### **콘솔에서 확인:**

```javascript
// F12 → Console 탭
console.log('공지사항:', JSON.parse(localStorage.getItem('notices') || '[]'));
console.log('수업자료:', JSON.parse(localStorage.getItem('lessons') || '[]'));
console.log('탐구자료:', JSON.parse(localStorage.getItem('research') || '[]'));
```

---

## 🚀 Edge Function으로 전환 (선택사항)

나중에 Edge Function을 배포하고 싶다면:

### **1단계: `/utils/api.ts` 수정**

```typescript
const USE_LOCALSTORAGE = false; // true → false로 변경
```

### **2단계: Edge Function 배포**

```bash
supabase link --project-ref mwwnmcdhmfoeolexdwld
supabase functions deploy make-server-7e316a07
```

### **3단계: 데이터 마이그레이션**

LocalStorage의 데이터를 Edge Function으로 이전하려면:

```javascript
// F12 → Console 탭
const notices = JSON.parse(localStorage.getItem('notices') || '[]');
// 각 항목을 수동으로 재업로드
```

---

## 💡 사용 팁

### **데이터 백업:**

중요한 데이터는 정기적으로 백업하세요:

```javascript
// F12 → Console 탭
const backup = {
  notices: localStorage.getItem('notices'),
  lessons: localStorage.getItem('lessons'),
  research: localStorage.getItem('research'),
  evaluations: localStorage.getItem('evaluations'),
  cbci: localStorage.getItem('cbci')
};
console.log('백업 데이터:', JSON.stringify(backup));
// 결과를 복사하여 텍스트 파일로 저장
```

### **데이터 복원:**

```javascript
// 백업한 JSON 문자열을 복사
const backup = { /* 백업 데이터 */ };
localStorage.setItem('notices', backup.notices);
localStorage.setItem('lessons', backup.lessons);
// ... 나머지 데이터
location.reload(); // 페이지 새로고침
```

### **데이터 초기화:**

```javascript
// F12 → Console 탭
localStorage.clear();
location.reload();
```

---

## 🎯 테스트 체크리스트

- [ ] 공지사항 작성 → ✅ LocalStorage에 저장됨
- [ ] 수업자료 업로드 → ✅ 썸네일과 함께 저장됨
- [ ] 탐구자료 업로드 → ✅ 정상 작동
- [ ] 평가자료 업로드 → ✅ 정상 작동
- [ ] CBCI 설계 업로드 → ✅ 정상 작동
- [ ] 자료 수정/삭제 → ✅ 정상 작동
- [ ] 페이지 새로고침 → ✅ 데이터 유지됨
- [ ] Master 로그인 → ✅ 정상 작동

---

## 🔒 주의사항

### **데이터 손실 위험:**

다음 작업 시 데이터가 삭제됩니다:
- 브라우저 캐시/쿠키 삭제
- 시크릿 모드 사용 (창 닫으면 삭제)
- 다른 컴퓨터/브라우저 사용

### **용량 제한:**

- 브라우저마다 다름 (보통 5-10MB)
- 대용량 파일 업로드 시 주의
- HTML 파일은 Base64로 저장되어 용량이 늘어남

---

## 📞 문제 해결

### **Q: 데이터가 사라졌어요!**
A: 브라우저 캐시를 삭제했거나 시크릿 모드를 사용한 경우입니다. 정기적으로 백업하세요.

### **Q: 용량 초과 에러가 발생해요!**
A: LocalStorage 용량 제한입니다. 일부 데이터를 삭제하거나 Edge Function으로 전환하세요.

### **Q: 다른 브라우저에서도 보이나요?**
A: 아니요. LocalStorage는 브라우저별로 독립적입니다.

### **Q: 공유가 필요해요!**
A: Edge Function을 배포하거나 Supabase Database를 사용하세요.

---

## 🎉 결론

**LocalStorage 모드로 전환하여 모든 기능이 정상 작동합니다!**

- ✅ 에러 완전 해결
- ✅ 즉시 사용 가능
- ✅ 배포 불필요
- ⚠️ 데이터 백업 권장

---

## 🚀 다음 단계

### **현재 사용 가능:**
1. Master 계정으로 로그인 (`master` / `master!!`)
2. 공지사항 작성
3. 수업자료/탐구자료/평가자료 업로드
4. CBCI 설계 업로드

### **선택적 설정:**
1. Google OAuth 설정 (`GOOGLE_SETUP_CORRECT.md` 참고)
2. Edge Function 배포 (`SUPABASE_SETUP.md` 참고)

**모든 기능을 자유롭게 사용하세요!** 🎊
