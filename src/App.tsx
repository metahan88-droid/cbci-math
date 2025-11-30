import { Search, ShoppingBag, ChevronRight, ChevronLeft, Bell, BookOpen, FlaskConical, FileCheck, Lightbulb, Users, Plus, Upload, Trash2, LogOut, FileText, Edit } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./components/ui/dialog";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { Toaster } from "./components/ui/sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "./components/ui/command";
import { useState, useEffect, useRef } from "react";
import logoImage from "figma:asset/d1a26da5edba8bb5b9eedb786024a4f8fba96ba0.png";
import { toast } from "sonner@2.0.3";
import { noticesAPI, lessonsAPI, researchAPI, evaluationsAPI, cbciAPI } from "./utils/api";
import html2canvas from "html2canvas@1.4.1";
import { supabase } from "./utils/supabase/client";
import { projectId, publicAnonKey } from "./utils/supabase/info";

type TabType = "공지사항" | "수업자료" | "탐구자료" | "평가자료" | "CBCI 설계" | "With";

type Notice = {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  important: boolean;
};

type ResearchMaterial = {
  id: string;
  schoolType: "middle" | "high";
  grade: "1" | "2" | "3";
  unit: string;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  thumbnail?: string;
  fileType?: string;
  fileName?: string;
  fileData?: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
  contentSystem?: string;
  knowledgeUnderstanding?: string;
};

type LessonMaterial = {
  id: string;
  schoolType: "middle" | "high";
  grade: "1" | "2" | "3";
  unit: string;
  title: string;
  content: string;
  files: number;
  updated: string;
  thumbnail?: string;
  fileType?: string;
  fileName?: string;
  fileData?: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
  contentSystem?: string;
  knowledgeUnderstanding?: string;
};

type EvaluationMaterial = {
  id: string;
  schoolType: "middle" | "high";
  grade: "1" | "2" | "3";
  title: string;
  content: string;
  type: string;
  date: string;
  status: string;
  thumbnail?: string;
  fileType?: string;
  fileName?: string;
  fileData?: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
  contentSystem?: string;
  knowledgeUnderstanding?: string;
};

type CBCIMaterial = {
  id: string;
  schoolType: "middle" | "high";
  grade: "1" | "2" | "3";
  unit: string;
  title: string;
  content: string;
  description: string;
  deadline: string;
  progress: number;
  thumbnail?: string;
  fileType?: string;
  fileName?: string;
  fileData?: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
  contentSystem?: string;
  knowledgeUnderstanding?: string;
};

// 교육과정 내용체계 데이터
const curriculumKnowledge = {
  "수와 연산": ["소인수분해", "정수와 유리수", "유리수와 순환소수", "제곱근과 실수"],
  "변화와 관계": ["문자의 사용과 식", "일차방정식", "좌표평면과 그래프", "식의 계산", "일차부등식", "연립일차방정식", "일차함수와 그 그래프", "일차함수와 일차방정식의 관계", "다항식의 곱셈과 인수분해", "이차방정식", "이차함수와 그 그래프"],
  "도형과 측정": ["기본 도형", "작도와 합동", "평면도형의 성질", "입체도형의 성질", "삼각형과 사각형의 성질", "도형의 닮음", "피타고라스 정리", "삼각비", "원의 성질"],
  "자료와 가능성": ["대푯값", "도수분포표와 상대도수", "경우의 수와 확률", "산포도", "상자그림과 산점도"]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("공지사항");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // 초기 샘플 데이터 설정
  useEffect(() => {
    const initializeSampleData = () => {
      // 공지사항 샘플 데이터
      if (!localStorage.getItem("notices")) {
        const sampleNotices = [
          {
            id: "notice-1",
            title: "CBCI MATH 교육 자료 사이트가 오픈했습니다!",
            content: "안녕하세요. CBCI MATH 교육 자료 사이트에 오신 것을 환영합니다.\n\n이 사이트는 교육과정 기반 수학 교육 자료를 공유하고 협력하기 위한 플랫폼입니다.\n\n다양한 수업자료, 탐구자료, 평가자료를 업로드하고 활용하실 수 있습니다.",
            date: "2025.01.15",
            category: "시스템",
            important: true
          },
          {
            id: "notice-2",
            title: "2025년 1학기 교육 자료 업로드 안내",
            content: "2025년 1학기 교육 자료 업로드를 시작합니다.\n\n각 학년별, 단원별로 자료를 정리하여 업로드해 주시기 바랍니다.\n\nHTML 파일로 업로드하시면 자동으로 썸네일이 생성됩니다.",
            date: "2025.01.20",
            category: "자료공유",
            important: false
          },
          {
            id: "notice-3",
            title: "Google 계정으로 간편하게 로그인하세요",
            content: "이제 Google 계정으로 간편하게 로그인하실 수 있습니다.\n\n회원가입 또는 로그인 버튼을 클릭하여 Google 계정으로 로그인해 보세요.",
            date: "2025.01.25",
            category: "기능",
            important: false
          }
        ];
        localStorage.setItem("notices", JSON.stringify(sampleNotices));
        console.log("✅ 공지사항 샘플 데이터 초기화 완료");
      }

      // 탐구자료 샘플 데이터
      if (!localStorage.getItem("research")) {
        const sampleResearch = [
          {
            id: "research-1",
            schoolType: "middle",
            grade: "3",
            unit: "수와 연산",
            title: "실생활 속 제곱근 찾기",
            content: "우리 주변에서 제곱근을 활용하는 사례를 찾아보고, 그 의미를 탐구하는 활동입니다.\n\n피타고라스 정리와 연계하여 대각선의 길이를 구하는 과정에서 제곱근의 필요성을 이해합니다.",
            author: "김수학",
            date: "2025.01.10",
            views: 45,
            contentSystem: "수와 연산",
            knowledgeUnderstanding: "제곱근과 실수"
          },
          {
            id: "research-2",
            schoolType: "high",
            grade: "1",
            unit: "변화와 관계",
            title: "이차함수의 최댓값과 최솟값 탐구",
            content: "이차함수 y=ax²+bx+c의 그래프에서 최댓값과 최솟값을 찾는 탐구 활동입니다.\n\n실생활 문제를 이차함수로 모델링하고 최적의 해를 구합니다.",
            author: "박교사",
            date: "2025.01.15",
            views: 67,
            contentSystem: "변화와 관계",
            knowledgeUnderstanding: "이차함수와 그 그래프"
          },
          {
            id: "research-3",
            schoolType: "middle",
            grade: "2",
            unit: "도형과 측정",
            title: "삼각형의 합동 조건 탐구",
            content: "다양한 삼각형을 작도하면서 합동 조건을 탐구하는 활동입니다.\n\nSSS, SAS, ASA 합동 조건을 직접 확인해봅니다.",
            author: "이선생",
            date: "2025.01.18",
            views: 32,
            contentSystem: "도형과 측정",
            knowledgeUnderstanding: "작도와 합동"
          }
        ];
        localStorage.setItem("research", JSON.stringify(sampleResearch));
        console.log("✅ 탐구자료 샘플 데이터 초기화 완료");
      }

      // 수업자료 샘플 데이터
      if (!localStorage.getItem("lessons")) {
        const sampleLessons = [
          {
            id: "lesson-1",
            schoolType: "middle",
            grade: "1",
            unit: "수와 연산",
            title: "소인수분해 기본 개념",
            content: "소인수분해의 기본 개념과 방법을 학습하는 수업 자료입니다.",
            files: 3,
            updated: "2025.01.12",
            contentSystem: "수와 연산",
            knowledgeUnderstanding: "소인수분해"
          },
          {
            id: "lesson-2",
            schoolType: "middle",
            grade: "2",
            unit: "변화와 관계",
            title: "일차함수와 그래프",
            content: "일차함수의 그래프를 그리고 성질을 이해하는 수업 자료입니다.",
            files: 5,
            updated: "2025.01.14",
            contentSystem: "변화와 관계",
            knowledgeUnderstanding: "일차함수와 그 그래프"
          }
        ];
        localStorage.setItem("lessons", JSON.stringify(sampleLessons));
        console.log("✅ 수업자료 샘플 데이터 초기화 완료");
      }

      // 평가자료 샘플 데이터
      if (!localStorage.getItem("evaluations")) {
        const sampleEvaluations = [
          {
            id: "eval-1",
            schoolType: "middle",
            grade: "3",
            title: "이차방정식 단원 평가",
            content: "이차방정식 단원의 이해도를 평가하는 문제지입니다.",
            type: "단원평가",
            date: "2025.01.20",
            status: "진행중",
            contentSystem: "변화와 관계",
            knowledgeUnderstanding: "이차방정식"
          }
        ];
        localStorage.setItem("evaluations", JSON.stringify(sampleEvaluations));
        console.log("✅ 평가자료 샘플 데이터 초기화 완료");
      }

      // CBCI 설계 샘플 데이터
      if (!localStorage.getItem("cbci")) {
        const sampleCbci = [
          {
            id: "cbci-1",
            schoolType: "middle",
            grade: "3",
            unit: "수와 연산",
            title: "제곱근과 실수 CBCI 설계",
            content: "제곱근과 실수 단원의 CBCI 설계 자료입니다.",
            description: "개념 이해 → 적용 → 종합 과정 설계",
            deadline: "2025.02.28",
            progress: 60,
            contentSystem: "수와 연산",
            knowledgeUnderstanding: "제곱근과 실수"
          }
        ];
        localStorage.setItem("cbci", JSON.stringify(sampleCbci));
        console.log("✅ CBCI 설계 샘플 데이터 초기화 완료");
      }
    };

    initializeSampleData();
  }, []);

// 로그인 상태 확인
useEffect(() => {
  const checkSession = async () => {
    try {
      console.log('🔍 Starting session check...');

      // OAuth 콜백 처리 (URL 해시 또는 쿼리 파라미터에서 토큰 추출)
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      const hasAuthParams = hash.includes('access_token') || searchParams.has('code');

      if (hasAuthParams) {
        console.log('🔵 OAuth callback detected');

        // Supabase가 URL에서 세션을 추출할 때까지 대기
        console.log('⏳ Processing OAuth callback...');

        // exchangeCodeForSession을 사용하여 code를 세션으로 변환 (PKCE 플로우)
        if (searchParams.has('code')) {
          const code = searchParams.get('code');
          console.log('🔑 Found authorization code, exchanging for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code!);
          if (error) {
            console.error('❌ Code exchange error:', error);
          } else if (data.session) {
            console.log('✅ Session created from code');
            setIsLoggedIn(true);
            setIsMaster(false);
            const userName = data.session.user.user_metadata?.full_name || data.session.user.email || "";
            setCurrentUser(userName);
            toast.success(`환영합니다, ${userName}님!`);
            // URL 정리
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }
        }

        // URL 정리
        window.history.replaceState(null, '', window.location.pathname);
      }

      // Supabase 세션 확인
      console.log('🔍 Checking Supabase session...');
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Session check error:", error);
      }

      // Supabase 세션이 있으면 우선 처리 (OAuth 로그인)
      if (session) {
        setIsLoggedIn(true);
        setIsMaster(false);
        const userName = session.user.user_metadata?.full_name || session.user.email || "";
        setCurrentUser(userName);
        console.log("✅ OAuth user logged in:", userName);
        console.log("👤 User ID:", session.user.id);
        console.log("📧 Email:", session.user.email);
        toast.success(`환영합니다, ${userName}님!`);
        return;
      }

      // Supabase 세션이 없으면 master 계정 체크
      const isMasterLocal = localStorage.getItem("isMaster") === "true";
      const isLoggedInLocal = localStorage.getItem("isLoggedIn") === "true";

      if (isMasterLocal && isLoggedInLocal) {
        setIsLoggedIn(true);
        setIsMaster(true);
        setCurrentUser("master");
        console.log("✅ Master account logged in");
        return;
      }

      console.log("ℹ️ No active session found");
    } catch (error) {
      console.error("❌ Unexpected error in checkSession:", error);
    }
  };

  checkSession();

  // Auth 상태 변경 리스너
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("🔄 Auth state changed:", event);
    
    if (event === 'SIGNED_IN' && session) {
      // OAuth 로그인 성공
      setIsLoggedIn(true);
      setIsMaster(false);
      const userName = session.user.user_metadata?.full_name || session.user.email || "";
      setCurrentUser(userName);
      toast.success(`환영합니다, ${userName}님!`);
      console.log("✅ OAuth Signed in:", userName);
      console.log("📧 Email:", session.user.email);
    } else if (event === 'SIGNED_OUT') {
      // 로그아웃
      const isMasterLocal = localStorage.getItem("isMaster") === "true";
      const isLoggedInLocal = localStorage.getItem("isLoggedIn") === "true";
      
      if (!isMasterLocal || !isLoggedInLocal) {
        setIsLoggedIn(false);
        setIsMaster(false);
        setCurrentUser("");
        console.log("🔴 Signed out");
      }
    } else if (event === 'TOKEN_REFRESHED' && session) {
      // 토큰 갱신
      console.log("🔄 Token refreshed");
      setIsLoggedIn(true);
      setIsMaster(false);
      const userName = session.user.user_metadata?.full_name || session.user.email || "";
      setCurrentUser(userName);
    } else if (session) {
      // 세션 복구
      setIsLoggedIn(true);
      setIsMaster(false);
      const userName = session.user.user_metadata?.full_name || session.user.email || "";
      setCurrentUser(userName);
      console.log("✅ Session restored:", userName);
    }
  });

  return () => subscription.unsubscribe();
}, []);

  const handleLogin = () => {
    setLoginDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setIsMaster(false);
      setCurrentUser("");
      localStorage.setItem("isLoggedIn", "false");
      localStorage.setItem("isMaster", "false");
      toast.success("로그아웃 되었습니다");
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
      toast.error("로그아웃 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isLoggedIn={isLoggedIn} 
        onLogout={handleLogout}
        onLogin={() => setLoginDialogOpen(true)}
        onSignup={() => setSignupDialogOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
      />
      <TabContent activeTab={activeTab} isLoggedIn={isLoggedIn} />
      <Footer onLogin={() => setLoginDialogOpen(true)} onSignup={() => setSignupDialogOpen(true)} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <SignupDialog open={signupDialogOpen} onOpenChange={setSignupDialogOpen} onSignupSuccess={() => {}} />
      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} onLoginSuccess={() => setIsLoggedIn(true)} />
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} setActiveTab={setActiveTab} />
      <Toaster />
    </div>
  );
}

function Navigation({ activeTab, setActiveTab, isLoggedIn, onLogout, onLogin, onSignup, onSearchClick }: { activeTab: TabType; setActiveTab: (tab: TabType) => void; isLoggedIn: boolean; onLogout: () => void; onLogin: () => void; onSignup: () => void; onSearchClick: () => void }) {
  const navItems: TabType[] = [
    "공지사항",
    "수업자료",
    "탐구자료",
    "평가자료",
    "CBCI 설계",
    "With",
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex items-center justify-between h-11">
          <div className="flex items-center gap-8">
            <div className="flex items-center h-11">
              <img 
                src={logoImage} 
                alt="CBCI MATH" 
                className="h-8 w-auto"
              />
            </div>
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`text-[12px] transition-colors py-3 relative ${
                  activeTab === item
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
                {activeTab === item && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Search 
              className="w-[15px] h-[15px] text-foreground cursor-pointer hover:text-primary transition-colors" 
              onClick={onSearchClick}
            />
            <ShoppingBag className="w-[15px] h-[15px] text-foreground cursor-pointer" />
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="h-7 text-xs gap-1"
              >
                <LogOut className="w-3 h-3" />
                로그아웃
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignup}
                  className="h-7 text-xs"
                >
                  회원가입
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogin}
                  className="h-7 text-xs"
                >
                  로그인
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function TabContent({ activeTab, isLoggedIn }: { activeTab: TabType; isLoggedIn: boolean }) {
  switch (activeTab) {
    case "공지사항":
      return <NoticeTab isLoggedIn={isLoggedIn} />;
    case "수업자료":
      return <LessonMaterialsTab isLoggedIn={isLoggedIn} />;
    case "탐구자료":
      return <ResearchMaterialsTab isLoggedIn={isLoggedIn} />;
    case "평가자료":
      return <EvaluationTab isLoggedIn={isLoggedIn} />;
    case "CBCI 설계":
      return <CBCITab isLoggedIn={isLoggedIn} />;
    case "With":
      return <WithTab />;
    default:
      return <NoticeTab isLoggedIn={isLoggedIn} />;
  }
}

// 검색 다이얼로그
function SearchDialog({ open, onOpenChange, setActiveTab }: { open: boolean; onOpenChange: (open: boolean) => void; setActiveTab: (tab: TabType) => void }) {
  const [searchQuery, setSearchQuery] = useState("");

  type SearchResult = {
    id: string;
    title: string;
    category: string;
    type: "notice" | "lesson" | "research" | "evaluation" | "cbci";
    preview?: string;
  };

  const getAllSearchResults = (): SearchResult[] => {
    const results: SearchResult[] = [];

    // 공지사항 검색
    const notices = JSON.parse(localStorage.getItem("notices") || "[]");
    notices.forEach((notice: Notice) => {
      results.push({
        id: notice.id,
        title: notice.title,
        category: notice.category,
        type: "notice",
        preview: notice.content.substring(0, 100),
      });
    });

    // 수업자료 검색
    const lessonMaterials = JSON.parse(localStorage.getItem("lessonMaterials") || "[]");
    lessonMaterials.forEach((material: LessonMaterial) => {
      results.push({
        id: material.id,
        title: material.title,
        category: `수업자료 - ${material.schoolType === "middle" ? "중" : "고"}${material.grade}`,
        type: "lesson",
        preview: material.content.substring(0, 100),
      });
    });

    // 탐구자료 검색
    const researchMaterials = JSON.parse(localStorage.getItem("researchMaterials") || "[]");
    researchMaterials.forEach((material: ResearchMaterial) => {
      results.push({
        id: material.id,
        title: material.title,
        category: `탐구자료 - ${material.schoolType === "middle" ? "중" : "고"}${material.grade} - ${material.author}`,
        type: "research",
        preview: material.content.substring(0, 100),
      });
    });

    // 평가자료 검색
    const evaluationMaterials = JSON.parse(localStorage.getItem("evaluationMaterials") || "[]");
    evaluationMaterials.forEach((material: EvaluationMaterial) => {
      results.push({
        id: material.id,
        title: material.title,
        category: `평가자료 - ${material.type} - ${material.status}`,
        type: "evaluation",
        preview: material.content.substring(0, 100),
      });
    });

    // CBCI 설계 검색
    const cbciMaterials = JSON.parse(localStorage.getItem("cbciMaterials") || "[]");
    cbciMaterials.forEach((material: CBCIMaterial) => {
      results.push({
        id: material.id,
        title: material.title,
        category: `CBCI 설계 - ${material.description}`,
        type: "cbci",
        preview: material.content.substring(0, 100),
      });
    });

    return results;
  };

  const filteredResults = getAllSearchResults().filter((result) => {
    const query = searchQuery.toLowerCase();
    return (
      result.title.toLowerCase().includes(query) ||
      result.category.toLowerCase().includes(query) ||
      (result.preview && result.preview.toLowerCase().includes(query))
    );
  });

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "notice":
        setActiveTab("공지사항");
        break;
      case "lesson":
        setActiveTab("수업자료");
        break;
      case "research":
        setActiveTab("탐구자료");
        break;
      case "evaluation":
        setActiveTab("평가자료");
        break;
      case "cbci":
        setActiveTab("CBCI 설계");
        break;
    }
    onOpenChange(false);
    toast.success(`"${result.title}" 으로 이동합니다`);
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "notice":
        return <Bell className="w-4 h-4" />;
      case "lesson":
        return <BookOpen className="w-4 h-4" />;
      case "research":
        return <FlaskConical className="w-4 h-4" />;
      case "evaluation":
        return <FileCheck className="w-4 h-4" />;
      case "cbci":
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0">
        <Command className="rounded-lg border-0">
          <CommandInput 
            placeholder="검색어를 입력하세요..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
            
            {searchQuery && (
              <>
                <CommandGroup heading={`검색 결과 (${filteredResults.length}개)`}>
                  {filteredResults.slice(0, 10).map((result) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      onSelect={() => handleResultClick(result)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="mt-0.5">
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="font-medium truncate">{result.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{result.category}</div>
                          {result.preview && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.preview}</div>
                          )}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {!searchQuery && (
              <>
                <CommandGroup heading="최근 추가된 자료">
                  {getAllSearchResults().slice(0, 5).map((result) => (
                    <CommandItem
                      key={`${result.type}-${result.id}`}
                      onSelect={() => handleResultClick(result)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="mt-0.5">
                          {getIcon(result.type)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="font-medium truncate">{result.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{result.category}</div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// 회원가입 다이얼로그
function SignupDialog({ open, onOpenChange, onSignupSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSignupSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error("모든 항목을 입력해주세요");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다");
      return;
    }

    if (password.length < 6) {
      toast.error("비밀번호는 최소 6자 이상이어야 합니다");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7e316a07/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("회원가입이 완료되었습니다! 로그인해주세요.");
        onOpenChange(false);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.error || "회원가입에 실패했습니다");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("회원가입 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      console.log("🔵 Starting Google OAuth signup...");
      console.log("Supabase URL:", `https://${projectId}.supabase.co`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error("❌ Google signup error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        
        if (error.message.includes('not enabled')) {
          toast.error("Google Provider가 Supabase에서 활성화되지 않았습니다!");
          console.log("👉 Supabase Dashboard → Authentication → Providers → Google 확인 필요");
        } else {
          toast.error(`Google 로그인 실패: ${error.message}`);
        }
      } else {
        // OAuth 흐름 시작 성공
        console.log("✅ Google OAuth flow started successfully");
        console.log("OAuth data:", data);
      }
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      toast.error("구글 로그인 중 오류가 발생했습니다");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>회원가입</DialogTitle>
          <DialogDescription>
            새 계정을 만들어 CBCI MATH 자료를 이용하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">이름</Label>
            <Input
              id="signup-name"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">이메일</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">비밀번호</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="최소 6자 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-confirm-password">비밀번호 확인</Label>
            <Input
              id="signup-confirm-password"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleGoogleSignup} variant="outline" className="w-full">
            <svg className="mr-2 h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google 계정으로 가입
          </Button>
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">또는</span>
            </div>
          </div>
          <Button onClick={handleSignup} disabled={loading} className="w-full bg-primary hover:bg-primary/90">
            {loading ? "가입 중..." : "회원가입"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 로그인 다이얼로그
function LoginDialog({ open, onOpenChange, onLoginSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onLoginSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // master 계정 체크 (이메일 없이 "master"만 입력해도 로그인 가능)
    const emailLower = email.toLowerCase().trim();
    if ((emailLower === "master" || emailLower === "master@cbcimath.com") && password === "master!!") {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isMaster", "true");
      onLoginSuccess();
      onOpenChange(false);
      toast.success("관리자 로그인 성공!");
      setEmail("");
      setPassword("");
      return;
    }

    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        toast.error("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      } else if (data.session) {
        localStorage.setItem("isMaster", "false");
        onLoginSuccess();
        onOpenChange(false);
        setEmail("");
        setPassword("");
        toast.success("로그인 성공!");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("로그인 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log("🔵 Starting Google OAuth login...");
      console.log("Supabase URL:", `https://${projectId}.supabase.co`);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error("❌ Google login error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        
        if (error.message.includes('not enabled')) {
          toast.error("Google Provider가 Supabase에서 활성화되지 않았습니다!");
          console.log("👉 Supabase Dashboard → Authentication → Providers → Google 확인 필요");
        } else {
          toast.error(`Google 로그인 실패: ${error.message}`);
        }
      } else {
        // OAuth 흐름 시작 성공
        console.log("✅ Google OAuth flow started successfully");
        console.log("OAuth data:", data);
      }
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      toast.error("구글 로그인 중 오류가 발생했습니다");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>로그인</DialogTitle>
          <DialogDescription>
            CBCI MATH 자료 사이트에 로그인하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">이메일</Label>
            <Input
              id="login-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">비밀번호</Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="button" onClick={handleGoogleLogin} variant="outline" className="w-full">
              <svg className="mr-2 h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google 계정으로 로그인
            </Button>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">또는</span>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// 공지사항 탭
function NoticeTab({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const result = await noticesAPI.getAll();
      if (result.success) {
        setNotices(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch notices:", error);
      // localStorage 사용 중이므로 에러 메시지 표시 안 함
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeAdded = async (newNotice: Notice) => {
    try {
      const result = await noticesAPI.create(newNotice);
      if (result.success) {
        setNotices([newNotice, ...notices]);
        toast.success("공지사항이 등록되었습니다");
      }
    } catch (error) {
      console.error("Failed to add notice:", error);
      toast.error("공지사항 등록에 실패했습니다");
    }
  };

  const handleNoticeUpdated = async (updatedNotice: Notice) => {
    try {
      const result = await noticesAPI.update(updatedNotice.id, updatedNotice);
      if (result.success) {
        setNotices(notices.map((n) => n.id === updatedNotice.id ? updatedNotice : n));
        toast.success("공지사항이 수정되었습니다");
      }
    } catch (error) {
      console.error("Failed to update notice:", error);
      toast.error("공지사항 수정에 실패했습니다");
    }
  };

  const handleNoticeDeleted = async (noticeId: string) => {
    try {
      const result = await noticesAPI.delete(noticeId);
      if (result.success) {
        setNotices(notices.filter((n) => n.id !== noticeId));
        toast.success("공지사항이 삭제되었습니다");
      }
    } catch (error) {
      console.error("Failed to delete notice:", error);
      toast.error("공지사항 삭제에 실패했습니다");
    }
  };

  const handleViewNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setViewDialogOpen(true);
  };

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <h2>공지사항</h2>
          </div>
          {isLoggedIn && <UploadNoticeDialog onNoticeAdded={handleNoticeAdded} />}
        </div>
        <div className="space-y-3">
          {notices.map((notice) => (
            <Card key={notice.id} className="p-6 border-0 shadow-sm bg-secondary hover:shadow-md transition-shadow cursor-pointer relative group">
              <div onClick={() => handleViewNotice(notice)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {notice.important && (
                        <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">중요</span>
                      )}
                      <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded">{notice.category}</span>
                    </div>
                    <h3 className="mb-2">{notice.title}</h3>
                    <p className="text-sm text-muted-foreground">{notice.date}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              {isLoggedIn && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-4 right-12 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('이 공지사항을 삭제하시겠습니까?')) {
                      handleNoticeDeleted(notice.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>

      {selectedNotice && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedNotice.important && (
                  <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">중요</span>
                )}
                {selectedNotice.title}
              </DialogTitle>
              <DialogDescription>
                {selectedNotice.category} • {selectedNotice.date}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="whitespace-pre-wrap">{selectedNotice.content}</p>
            </div>
            {isLoggedIn && (
              <DialogFooter className="gap-2">
                <EditNoticeDialog notice={selectedNotice} onNoticeUpdated={handleNoticeUpdated} />
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}

// 공지사항 업로드 다이얼로그
function UploadNoticeDialog({ onNoticeAdded }: { onNoticeAdded: (notice: Notice) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("공지");
  const [important, setImportant] = useState(false);

  const handleSubmit = () => {
    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const newNotice: Notice = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      category,
      important,
    };

    onNoticeAdded(newNotice);
    
    setTitle("");
    setContent("");
    setCategory("공지");
    setImportant(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          공지사항 작성
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>공지사항 작성</DialogTitle>
          <DialogDescription>
            새로운 공지사항을 작성합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notice-title">제목</Label>
            <Input
              id="notice-title"
              placeholder="공지사항 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notice-category">카테고리</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="notice-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="공지">공지</SelectItem>
                  <SelectItem value="업데이트">업데이트</SelectItem>
                  <SelectItem value="행사">행사</SelectItem>
                  <SelectItem value="서비스">서비스</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice-important">중요 공지</Label>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  id="notice-important"
                  checked={important}
                  onChange={(e) => setImportant(e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary"
                />
                <label htmlFor="notice-important" className="ml-2 text-sm">
                  중요 공지로 표시
                </label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notice-content">내용</Label>
            <Textarea
              id="notice-content"
              placeholder="공지사항 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
            작성
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 공지사항 수정 다이얼로그
function EditNoticeDialog({ notice, onNoticeUpdated }: { notice: Notice; onNoticeUpdated: (notice: Notice) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(notice.title);
  const [content, setContent] = useState(notice.content);
  const [category, setCategory] = useState(notice.category);
  const [important, setImportant] = useState(notice.important);

  const handleSubmit = () => {
    if (!title || !content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const updatedNotice: Notice = {
      ...notice,
      title,
      content,
      category,
      important,
    };

    onNoticeUpdated(updatedNotice);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">수정</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>공지사항 수정</DialogTitle>
          <DialogDescription>
            공지사항을 수정합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-notice-title">제목</Label>
            <Input
              id="edit-notice-title"
              placeholder="공지사항 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-notice-category">카테고리</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="edit-notice-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="공지">공지</SelectItem>
                  <SelectItem value="업데이트">업데이트</SelectItem>
                  <SelectItem value="행사">행사</SelectItem>
                  <SelectItem value="서비스">서비스</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notice-important">중요 공지</Label>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  id="edit-notice-important"
                  checked={important}
                  onChange={(e) => setImportant(e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary"
                />
                <label htmlFor="edit-notice-important" className="ml-2 text-sm">
                  중요 공지로 표시
                </label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notice-content">내용</Label>
            <Textarea
              id="edit-notice-content"
              placeholder="공지사항 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
            수정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 수업자료 탭
function LessonMaterialsTab({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [materials, setMaterials] = useState<LessonMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMaterials();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchMaterials = async () => {
    try {
      const result = await lessonsAPI.getAll();
      if (result.success) {
        setMaterials(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
      toast.error("수업자료를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialAdded = async (newMaterial: LessonMaterial) => {
    try {
      const result = await lessonsAPI.create(newMaterial);
      if (result.success) {
        setMaterials([...materials, newMaterial]);
        toast.success("자료가 등록되었습니다");
      }
    } catch (error) {
      console.error("Failed to add lesson:", error);
      toast.error("자료 등록에 실패했습니다");
    }
  };

  const handleMaterialDeleted = async (materialId: string) => {
    try {
      const result = await lessonsAPI.delete(materialId);
      if (result.success) {
        setMaterials(materials.filter((m) => m.id !== materialId));
        toast.success("자료가 삭제되었습니다");
      }
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      toast.error("자료 삭제에 실패했습니다");
    }
  };

  const handleMaterialUpdated = async (material: LessonMaterial) => {
    try {
      const result = await lessonsAPI.update(material.id, material);
      if (result.success) {
        setMaterials(materials.map((m) => m.id === material.id ? material : m));
        toast.success("자료가 수정되었습니다");
      }
    } catch (error) {
      console.error("Failed to update lesson:", error);
      toast.error("자료 수정에 실패했습니다");
    }
  };

  if (!isLoggedIn) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="mb-2">로그인이 필요합니다</h3>
            <p className="text-muted-foreground">수업자료를 보시려면 로그인해주세요.</p>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2>수업자료</h2>
          </div>
          <UploadLessonDialog onMaterialAdded={handleMaterialAdded} />
        </div>
        
        <Tabs defaultValue="middle-1" className="w-full">
          <div className="mb-6">
            <h3 className="mb-3">중학교</h3>
            <TabsList className="bg-secondary">
              <TabsTrigger value="middle-1">1학년</TabsTrigger>
              <TabsTrigger value="middle-2">2학년</TabsTrigger>
              <TabsTrigger value="middle-3">3학년</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="mb-6">
            <h3 className="mb-3">고등학교</h3>
            <TabsList className="bg-secondary">
              <TabsTrigger value="high-1">1학년</TabsTrigger>
              <TabsTrigger value="high-2">2학년</TabsTrigger>
              <TabsTrigger value="high-3">3학년</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="middle-1" className="mt-6">
            <GradeMaterials grade="중학교 1학년" schoolType="middle" gradeNum="1" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="middle-2" className="mt-6">
            <GradeMaterials grade="중학교 2학년" schoolType="middle" gradeNum="2" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="middle-3" className="mt-6">
            <GradeMaterials grade="중학교 3학년" schoolType="middle" gradeNum="3" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="high-1" className="mt-6">
            <GradeMaterials grade="고등학교 1학년" schoolType="high" gradeNum="1" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="high-2" className="mt-6">
            <GradeMaterials grade="고등학교 2학년" schoolType="high" gradeNum="2" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="high-3" className="mt-6">
            <GradeMaterials grade="고등학교 3학년" schoolType="high" gradeNum="3" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

// 수업자료 수정 다이얼로그
function EditLessonDialog({ material, onMaterialUpdated, triggerId }: { material: LessonMaterial; onMaterialUpdated: (material: LessonMaterial) => void; triggerId: string }) {
  const [open, setOpen] = useState(false);
  const [schoolType, setSchoolType] = useState<"middle" | "high">(material.schoolType);
  const [grade, setGrade] = useState<"1" | "2" | "3">(material.grade);
  const [unit, setUnit] = useState(material.unit);
  const [title, setTitle] = useState(material.title);
  const [content, setContent] = useState(material.content);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string>(material.thumbnail || "");
  const [fileType, setFileType] = useState<string>(material.fileType || "");
  const [fileData, setFileData] = useState<string>(material.fileData || "");
  const [contentSystem, setContentSystem] = useState<string>(material.contentSystem || "");
  const [knowledgeUnderstanding, setKnowledgeUnderstanding] = useState<string>(material.knowledgeUnderstanding || "");

  useEffect(() => {
    setSchoolType(material.schoolType);
    setGrade(material.grade);
    setTitle(material.title);
    setContent(material.content);
    setUnit(material.unit);
    setThumbnail(material.thumbnail || "");
    setFileType(material.fileType || "");
    setFileData(material.fileData || "");
    setContentSystem(material.contentSystem || "");
    setKnowledgeUnderstanding(material.knowledgeUnderstanding || "");
  }, [material]);

  const extractThumbnailFromHtml = (html: string): string | undefined => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const firstImg = doc.querySelector('img');
    return firstImg?.src;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      setFileType('image');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
        setThumbnail(dataUrl);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
      setFileType('html');
      reader.onload = (event) => {
        const htmlContent = event.target?.result as string;
        setFileData(htmlContent);
        const extractedThumbnail = extractThumbnailFromHtml(htmlContent);
        if (extractedThumbnail) {
          setThumbnail(extractedThumbnail);
        }
      };
      reader.readAsText(file);
    } else {
      setFileType('file');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title || !unit) {
      alert("제목과 단원명을 입력해주세요.");
      return;
    }

    const now = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const updatedMaterial: LessonMaterial = {
      ...material,
      schoolType,
      grade,
      title,
      content,
      unit,
      updated: now,
      updatedAt: now,
      thumbnail: uploadedFile ? thumbnail : material.thumbnail,
      fileType: uploadedFile ? fileType : material.fileType,
      fileName: uploadedFile ? uploadedFile.name : material.fileName,
      fileData: uploadedFile ? fileData : material.fileData,
      contentSystem,
      knowledgeUnderstanding,
    };

    onMaterialUpdated(updatedMaterial);
    setOpen(false);
    setUploadedFile(null);
  };

  return (
    <>
      <button id={triggerId} className="hidden" onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>수업자료 수정</DialogTitle>
            <DialogDescription>
              자료의 내용을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-lesson-schoolType">학교구분</Label>
                <Select value={schoolType} onValueChange={(value: "middle" | "high") => setSchoolType(value)}>
                  <SelectTrigger id="edit-lesson-schoolType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="middle">중학교</SelectItem>
                    <SelectItem value="high">고등학교</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lesson-grade">학년</Label>
                <Select value={grade} onValueChange={(value: "1" | "2" | "3") => setGrade(value)}>
                  <SelectTrigger id="edit-lesson-grade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1학년</SelectItem>
                    <SelectItem value="2">2학년</SelectItem>
                    <SelectItem value="3">3학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lesson-unit">단원명</Label>
              <Input
                id="edit-lesson-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lesson-contentSystem">내용체계</Label>
              <Select value={contentSystem} onValueChange={(value) => {
                setContentSystem(value);
                setKnowledgeUnderstanding("");
              }}>
                <SelectTrigger id="edit-lesson-contentSystem">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="수와 연산">수와 연산</SelectItem>
                  <SelectItem value="변화와 관계">변화와 관계</SelectItem>
                  <SelectItem value="도형과 측정">도형과 측정</SelectItem>
                  <SelectItem value="자료와 가능성">자료와 가능성</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {contentSystem && (
              <div className="space-y-2">
                <Label htmlFor="edit-lesson-knowledge">지식·이해</Label>
                <Select value={knowledgeUnderstanding} onValueChange={setKnowledgeUnderstanding}>
                  <SelectTrigger id="edit-lesson-knowledge">
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {curriculumKnowledge[contentSystem as keyof typeof curriculumKnowledge].map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-lesson-title">제목</Label>
              <Input
                id="edit-lesson-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lesson-content">내용</Label>
              <Textarea
                id="edit-lesson-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lesson-file">파일 업로드 (선택사항)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-lesson-file"
                  type="file"
                  accept="*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <Upload className="w-4 h-4 text-muted-foreground" />
              </div>
              {uploadedFile && (
                <p className="text-sm text-muted-foreground">
                  새 파일: {uploadedFile.name} ({fileType})
                </p>
              )}
              {!uploadedFile && material.fileName && (
                <p className="text-sm text-muted-foreground">
                  현재 파일: {material.fileName}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 수업자료 업로드 다이얼로그
function UploadLessonDialog({ onMaterialAdded }: { onMaterialAdded: (material: LessonMaterial) => void }) {
  const [open, setOpen] = useState(false);
  const [schoolType, setSchoolType] = useState<"middle" | "high">("middle");
  const [grade, setGrade] = useState<"1" | "2" | "3">("1");
  const [unit, setUnit] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [fileData, setFileData] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [contentSystem, setContentSystem] = useState<string>("");
  const [knowledgeUnderstanding, setKnowledgeUnderstanding] = useState<string>("");

  const extractThumbnailFromHtml = (html: string): string | undefined => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const firstImg = doc.querySelector('img');
    return firstImg?.src;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      setFileType('image');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
        setThumbnail(dataUrl);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
      setFileType('html');
      reader.onload = (event) => {
        const htmlContent = event.target?.result as string;
        setFileData(htmlContent);
        const extractedThumbnail = extractThumbnailFromHtml(htmlContent);
        if (extractedThumbnail) {
          setThumbnail(extractedThumbnail);
        }
      };
      reader.readAsText(file);
    } else {
      setFileType('file');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title || !unit) {
      alert("제목과 단원명을 입력해주세요.");
      return;
    }

    const now = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const newMaterial: LessonMaterial = {
      id: Date.now().toString(),
      schoolType,
      grade,
      unit,
      title,
      content,
      files: 1,
      updated: now,
      thumbnail,
      fileType,
      fileName: uploadedFile?.name,
      fileData,
      link,
      createdAt: now,
      updatedAt: now,
      contentSystem,
      knowledgeUnderstanding,
    };

    onMaterialAdded(newMaterial);
    
    setSchoolType("middle");
    setGrade("1");
    setUnit("");
    setTitle("");
    setContent("");
    setUploadedFile(null);
    setThumbnail("");
    setFileType("");
    setFileData("");
    setLink("");
    setContentSystem("");
    setKnowledgeUnderstanding("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          자료 업로드
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>수업자료 업로드</DialogTitle>
          <DialogDescription>
            새로운 수업자료를 업로드합니다. 학교구분과 학년을 선택해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-schoolType">학교구분</Label>
              <Select value={schoolType} onValueChange={(value: "middle" | "high") => setSchoolType(value)}>
                <SelectTrigger id="lesson-schoolType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="middle">중학교</SelectItem>
                  <SelectItem value="high">고등학교</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-grade">학년</Label>
              <Select value={grade} onValueChange={(value: "1" | "2" | "3") => setGrade(value)}>
                <SelectTrigger id="lesson-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1학년</SelectItem>
                  <SelectItem value="2">2학년</SelectItem>
                  <SelectItem value="3">3학년</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-unit">단원명</Label>
            <Input
              id="lesson-unit"
              placeholder="예: 1단원"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-contentSystem">내용체계</Label>
            <Select value={contentSystem} onValueChange={(value) => {
              setContentSystem(value);
              setKnowledgeUnderstanding("");
            }}>
              <SelectTrigger id="lesson-contentSystem">
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="수와 연산">수와 연산</SelectItem>
                <SelectItem value="변화와 관계">변화와 관계</SelectItem>
                <SelectItem value="도형과 측정">도형과 측정</SelectItem>
                <SelectItem value="자료와 가능성">자료와 가능��</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {contentSystem && (
            <div className="space-y-2">
              <Label htmlFor="lesson-knowledge">지식·이해</Label>
              <Select value={knowledgeUnderstanding} onValueChange={setKnowledgeUnderstanding}>
                <SelectTrigger id="lesson-knowledge">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {curriculumKnowledge[contentSystem as keyof typeof curriculumKnowledge].map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="lesson-title">제목</Label>
            <Input
              id="lesson-title"
              placeholder="자료 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-content">내용 (파일에 대한 설명)</Label>
            <Textarea
              id="lesson-content"
              placeholder="수업자료에 대한 설명을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-link">링크 (선택사항)</Label>
            <Input
              id="lesson-link"
              type="url"
              placeholder="https://example.com"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lesson-uploadFile">파일 업로드 (모든 형식)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="lesson-uploadFile"
                type="file"
                accept="*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <Upload className="w-4 h-4 text-muted-foreground" />
            </div>
            {uploadedFile && (
              <p className="text-sm text-muted-foreground">
                업로드됨: {uploadedFile.name} ({fileType})
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
            업로드
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GradeMaterials({ 
  grade, 
  schoolType, 
  gradeNum, 
  materials,
  isLoggedIn,
  onDelete,
  onEdit
}: { 
  grade: string; 
  schoolType: "middle" | "high"; 
  gradeNum: string;
  materials: LessonMaterial[];
  isLoggedIn: boolean;
  onDelete: (id: string) => void;
  onEdit: (material: LessonMaterial) => void;
}) {
  const filteredMaterials = materials.filter(
    (m) => m.schoolType === schoolType && m.grade === gradeNum
  );

  const allMaterials = filteredMaterials.map((m) => ({
    id: m.id,
    title: m.title,
    files: m.files,
    updated: m.updated,
    unit: m.unit,
    thumbnail: m.thumbnail,
    knowledgeUnderstanding: m.knowledgeUnderstanding,
  }));

  const [selectedMaterial, setSelectedMaterial] = useState<LessonMaterial | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleViewMaterial = (materialId: string) => {
    const material = materials.find((m) => m.id === materialId);
    if (material) {
      if (material.fileType === 'html' && material.fileData) {
        const blob = new Blob([material.fileData], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        setSelectedMaterial(material);
        setViewDialogOpen(true);
      }
    }
  };

  const getGradientColor = (index: number) => {
    const gradients = [
      "from-blue-400 to-indigo-600",
      "from-purple-400 to-pink-600",
      "from-green-400 to-teal-600",
      "from-orange-400 to-red-600",
      "from-cyan-400 to-blue-600",
      "from-amber-400 to-orange-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div>
      <h4 className="mb-4 text-muted-foreground">{grade}</h4>
      <div className="grid grid-cols-3 gap-6">
        {allMaterials.map((material, index) => (
          <Card 
            key={material.id} 
            className="overflow-hidden border-0 shadow-sm bg-secondary hover:shadow-md transition-shadow cursor-pointer relative group"
          >
            <div onClick={() => handleViewMaterial(material.id)}>
              <div className="aspect-video bg-accent relative overflow-hidden">
                {material.thumbnail ? (
                  <>
                    <ImageWithFallback
                      src={material.thumbnail}
                      alt={material.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                      {material.knowledgeUnderstanding || material.unit}
                    </div>
                  </>
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${getGradientColor(index)} flex items-center justify-center`}>
                    <BookOpen className="w-16 h-16 text-white/80" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="mb-2 line-clamp-2">{material.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{material.files}개 파일</span>
                  <span>{material.updated}</span>
                </div>
              </div>
            </div>
            {isLoggedIn && (
              <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 bg-primary hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    const materialToEdit = materials.find((m) => m.id === material.id);
                    if (materialToEdit) {
                      const editDialog = document.getElementById(`edit-lesson-${material.id}`);
                      if (editDialog) {
                        (editDialog as any).click();
                      }
                    }
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('이 자료를 삭제하시겠습니까?')) {
                      onDelete(material.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            {isLoggedIn && (
              <EditLessonDialog 
                material={materials.find((m) => m.id === material.id)!}
                onMaterialUpdated={onEdit}
                triggerId={`edit-lesson-${material.id}`}
              />
            )}
          </Card>
        ))}
      </div>

      {selectedMaterial && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedMaterial.title}</DialogTitle>
              <DialogDescription>
                {selectedMaterial.unit} • {selectedMaterial.updated}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedMaterial.content && (
                <div className="mb-4 p-4 bg-secondary rounded-lg">
                  <p className="text-sm">{selectedMaterial.content}</p>
                </div>
              )}
              {selectedMaterial.fileType === 'image' && selectedMaterial.fileData && (
                <img src={selectedMaterial.fileData} alt={selectedMaterial.title} className="w-full rounded-lg" />
              )}
              {selectedMaterial.fileType === 'file' && selectedMaterial.fileData && (
                <div className="text-center">
                  <a href={selectedMaterial.fileData} download={selectedMaterial.fileName} className="text-primary underline">
                    파일 다운로드: {selectedMaterial.fileName}
                  </a>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// 탐구자료 탭
function ResearchMaterialsTab({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [materials, setMaterials] = useState<ResearchMaterial[]>([]);
  const [activeTab, setActiveTab] = useState("middle-1");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMaterials();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchMaterials = async () => {
    try {
      const result = await researchAPI.getAll();
      if (result.success) {
        setMaterials(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch research:", error);
      toast.error("탐구자료를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialAdded = async (newMaterial: ResearchMaterial) => {
    try {
      const result = await researchAPI.create(newMaterial);
      if (result.success) {
        setMaterials([...materials, newMaterial]);
        toast.success("자료가 등록되었습니다");
      }
    } catch (error) {
      console.error("Failed to add research:", error);
      toast.error("자료 등록에 실패했습니다");
    }
  };

  const handleMaterialDeleted = async (materialId: string) => {
    try {
      const result = await researchAPI.delete(materialId);
      if (result.success) {
        setMaterials(materials.filter((m) => m.id !== materialId));
        toast.success("자료가 삭제되었습니다");
      }
    } catch (error) {
      console.error("Failed to delete research:", error);
      toast.error("자료 삭제에 실패했습니다");
    }
  };

  const handleMaterialUpdated = async (material: ResearchMaterial) => {
    try {
      const result = await researchAPI.update(material.id, material);
      if (result.success) {
        setMaterials(materials.map((m) => m.id === material.id ? material : m));
        toast.success("자료가 수정되었습니다");
      }
    } catch (error) {
      console.error("Failed to update research:", error);
      toast.error("자료 수정에 실패했습니다");
    }
  };

  if (!isLoggedIn) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-20">
            <FlaskConical className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="mb-2">로그인이 필요합니다</h3>
            <p className="text-muted-foreground">탐구자료를 보시려면 로그인해주세요.</p>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-6 h-6 text-primary" />
            <h2>탐구자료</h2>
          </div>
          <UploadResearchDialog onMaterialAdded={handleMaterialAdded} />
        </div>

        <Tabs defaultValue="middle-1" className="w-full">
          <div className="mb-6">
            <h3 className="mb-3">중학교</h3>
            <TabsList className="bg-secondary">
              <TabsTrigger value="middle-1">1학년</TabsTrigger>
              <TabsTrigger value="middle-2">2학년</TabsTrigger>
              <TabsTrigger value="middle-3">3학년</TabsTrigger>
            </TabsList>
          </div>

          <div className="mb-6">
            <h3 className="mb-3">고등학교</h3>
            <TabsList className="bg-secondary">
              <TabsTrigger value="high-1">1학년</TabsTrigger>
              <TabsTrigger value="high-2">2학년</TabsTrigger>
              <TabsTrigger value="high-3">3학년</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="middle-1" className="mt-6">
            <GradeResearch grade="중학교 1학년" schoolType="middle" gradeNum="1" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="middle-2" className="mt-6">
            <GradeResearch grade="중학교 2학년" schoolType="middle" gradeNum="2" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="middle-3" className="mt-6">
            <GradeResearch grade="중학교 3학년" schoolType="middle" gradeNum="3" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="high-1" className="mt-6">
            <GradeResearch grade="고등학교 1학년" schoolType="high" gradeNum="1" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="high-2" className="mt-6">
            <GradeResearch grade="고등학교 2학년" schoolType="high" gradeNum="2" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="high-3" className="mt-6">
            <GradeResearch grade="고등학교 3학년" schoolType="high" gradeNum="3" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

// 탐구자료 수정 다이얼로그
function EditResearchDialog({ material, onMaterialUpdated, triggerId }: { material: ResearchMaterial; onMaterialUpdated: (material: ResearchMaterial) => void; triggerId: string }) {
  const [open, setOpen] = useState(false);
  const [schoolType, setSchoolType] = useState<"middle" | "high">(material.schoolType);
  const [grade, setGrade] = useState<"1" | "2" | "3">(material.grade);
  const [unit, setUnit] = useState(material.unit);
  const [title, setTitle] = useState(material.title);
  const [author, setAuthor] = useState(material.author);
  const [content, setContent] = useState(material.content);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string>(material.thumbnail || "");
  const [fileType, setFileType] = useState<string>(material.fileType || "");
  const [fileData, setFileData] = useState<string>(material.fileData || "");
  const [contentSystem, setContentSystem] = useState<string>(material.contentSystem || "");
  const [knowledgeUnderstanding, setKnowledgeUnderstanding] = useState<string>(material.knowledgeUnderstanding || "");

  useEffect(() => {
    setSchoolType(material.schoolType);
    setGrade(material.grade);
    setTitle(material.title);
    setContent(material.content);
    setUnit(material.unit);
    setAuthor(material.author);
    setThumbnail(material.thumbnail || "");
    setFileType(material.fileType || "");
    setFileData(material.fileData || "");
    setContentSystem(material.contentSystem || "");
    setKnowledgeUnderstanding(material.knowledgeUnderstanding || "");
  }, [material]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      setFileType('image');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
        setThumbnail(dataUrl);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
      setFileType('html');
      reader.onload = (event) => {
        const htmlContent = event.target?.result as string;
        setFileData(htmlContent);
      };
      reader.readAsText(file);
    } else {
      setFileType('file');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title || !unit) {
      alert("제목과 단원명을 입력해주세요.");
      return;
    }

    const now = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const finalAuthor = author.trim() || "MASTER";
    const updatedMaterial: ResearchMaterial = {
      ...material,
      schoolType,
      grade,
      title,
      content,
      unit,
      author: finalAuthor,
      updatedAt: now,
      thumbnail: uploadedFile ? thumbnail : material.thumbnail,
      fileType: uploadedFile ? fileType : material.fileType,
      fileName: uploadedFile ? uploadedFile.name : material.fileName,
      fileData: uploadedFile ? fileData : material.fileData,
      contentSystem,
      knowledgeUnderstanding,
    };

    onMaterialUpdated(updatedMaterial);
    setOpen(false);
    setUploadedFile(null);
  };

  return (
    <>
      <button id={triggerId} className="hidden" onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>탐구자료 수정</DialogTitle>
            <DialogDescription>
              자료의 내용을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-research-schoolType">학교구분</Label>
                <Select value={schoolType} onValueChange={(value: "middle" | "high") => setSchoolType(value)}>
                  <SelectTrigger id="edit-research-schoolType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="middle">중학교</SelectItem>
                    <SelectItem value="high">고등학교</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-research-grade">학년</Label>
                <Select value={grade} onValueChange={(value: "1" | "2" | "3") => setGrade(value)}>
                  <SelectTrigger id="edit-research-grade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1학년</SelectItem>
                    <SelectItem value="2">2학년</SelectItem>
                    <SelectItem value="3">3학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-research-unit">단원명</Label>
              <Input
                id="edit-research-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-research-contentSystem">내용체계</Label>
              <Select value={contentSystem} onValueChange={(value) => {
                setContentSystem(value);
                setKnowledgeUnderstanding("");
              }}>
                <SelectTrigger id="edit-research-contentSystem">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="수와 연산">수와 연산</SelectItem>
                  <SelectItem value="변화와 관계">변화와 관계</SelectItem>
                  <SelectItem value="도형과 측정">도형과 측정</SelectItem>
                  <SelectItem value="자료와 가능성">자료와 가능성</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {contentSystem && (
              <div className="space-y-2">
                <Label htmlFor="edit-research-knowledge">지식·이해</Label>
                <Select value={knowledgeUnderstanding} onValueChange={setKnowledgeUnderstanding}>
                  <SelectTrigger id="edit-research-knowledge">
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {curriculumKnowledge[contentSystem as keyof typeof curriculumKnowledge].map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-research-title">제목</Label>
              <Input
                id="edit-research-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-research-author">작성자 (선택)</Label>
              <Input
                id="edit-research-author"
                placeholder="비워두면 MASTER로 등록됩니다"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-research-content">내용</Label>
              <Textarea
                id="edit-research-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-research-file">파일 업로드 (선택사항)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-research-file"
                  type="file"
                  accept="*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <Upload className="w-4 h-4 text-muted-foreground" />
              </div>
              {uploadedFile && (
                <p className="text-sm text-muted-foreground">
                  새 파일: {uploadedFile.name} ({fileType})
                </p>
              )}
              {!uploadedFile && material.fileName && (
                <p className="text-sm text-muted-foreground">
                  현재 파일: {material.fileName}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 탐구자료 업로드 다이얼로그
function UploadResearchDialog({ onMaterialAdded }: { onMaterialAdded: (material: ResearchMaterial) => void }) {
  const [open, setOpen] = useState(false);
  const [schoolType, setSchoolType] = useState<"middle" | "high">("middle");
  const [grade, setGrade] = useState<"1" | "2" | "3">("1");
  const [unit, setUnit] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [fileData, setFileData] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [contentSystem, setContentSystem] = useState<string>("");
  const [knowledgeUnderstanding, setKnowledgeUnderstanding] = useState<string>("");

  const captureHtmlThumbnail = async (htmlContent: string): Promise<string> => {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.width = '1200px';
      iframe.style.height = '800px';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      iframe.onload = async () => {
        try {
          await new Promise(r => setTimeout(r, 500));
          
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc && iframeDoc.body) {
            const canvas = await html2canvas(iframeDoc.body, {
              width: 1200,
              height: 800,
              scale: 0.5,
              useCORS: true,
              allowTaint: true,
            });
            
            const thumbnailDataUrl = canvas.toDataURL('image/png');
            document.body.removeChild(iframe);
            resolve(thumbnailDataUrl);
          } else {
            document.body.removeChild(iframe);
            resolve('');
          }
        } catch (error) {
          console.error('Failed to capture thumbnail:', error);
          document.body.removeChild(iframe);
          resolve('');
        }
      };
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      setFileType('image');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
        setThumbnail(dataUrl);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
      setFileType('html');
      reader.onload = async (event) => {
        const htmlContent = event.target?.result as string;
        setFileData(htmlContent);
        
        toast.info('HTML 썸네일 생성 중...');
        const thumbnailDataUrl = await captureHtmlThumbnail(htmlContent);
        if (thumbnailDataUrl) {
          setThumbnail(thumbnailDataUrl);
          toast.success('썸네일 생성 완료!');
        } else {
          toast.error('썸네일 생성 실패');
        }
      };
      reader.readAsText(file);
    } else {
      setFileType('file');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title || !unit) {
      alert("제목과 단원명을 입력해주세요.");
      return;
    }

    const now = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const finalAuthor = author.trim() || "MASTER";
    const newMaterial: ResearchMaterial = {
      id: Date.now().toString(),
      schoolType,
      grade,
      unit,
      title,
      content,
      author: finalAuthor,
      date: now,
      views: 0,
      thumbnail,
      fileType,
      fileName: uploadedFile?.name,
      fileData,
      link,
      createdAt: now,
      updatedAt: now,
      contentSystem,
      knowledgeUnderstanding,
    };

    onMaterialAdded(newMaterial);
    
    setSchoolType("middle");
    setGrade("1");
    setUnit("");
    setTitle("");
    setAuthor("");
    setContent("");
    setUploadedFile(null);
    setThumbnail("");
    setFileType("");
    setFileData("");
    setLink("");
    setContentSystem("");
    setKnowledgeUnderstanding("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          자료 업로드
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>탐구자료 업로드</DialogTitle>
          <DialogDescription>
            새로운 탐구자료를 업로드합니다. 학교구분과 학년을 선택해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="research-schoolType">학교구분</Label>
              <Select value={schoolType} onValueChange={(value: "middle" | "high") => setSchoolType(value)}>
                <SelectTrigger id="research-schoolType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="middle">중학교</SelectItem>
                  <SelectItem value="high">고등학교</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="research-grade">학년</Label>
              <Select value={grade} onValueChange={(value: "1" | "2" | "3") => setGrade(value)}>
                <SelectTrigger id="research-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1학년</SelectItem>
                  <SelectItem value="2">2학년</SelectItem>
                  <SelectItem value="3">3학년</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">단원명</Label>
            <Input
              id="unit"
              placeholder="예: 1단원"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="research-contentSystem2">내용체계</Label>
            <Select value={contentSystem} onValueChange={(value) => {
              setContentSystem(value);
              setKnowledgeUnderstanding("");
            }}>
              <SelectTrigger id="research-contentSystem2">
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="수와 연산">수와 연산</SelectItem>
                <SelectItem value="변화와 관계">변화와 관계</SelectItem>
                <SelectItem value="도형과 측정">도형과 측정</SelectItem>
                <SelectItem value="자료와 가능성">자료와 가능성</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {contentSystem && (
            <div className="space-y-2">
              <Label htmlFor="research-knowledge2">지식·이해</Label>
              <Select value={knowledgeUnderstanding} onValueChange={setKnowledgeUnderstanding}>
                <SelectTrigger id="research-knowledge2">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {curriculumKnowledge[contentSystem as keyof typeof curriculumKnowledge].map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              placeholder="자료 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">작성자 (선택)</Label>
            <Input
              id="author"
              placeholder="비워두면 MASTER로 등록됩니다"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">내용 (파일에 대한 설명)</Label>
            <Textarea
              id="content"
              placeholder="탐구자료에 대한 설명을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="research-link">링크 (선택사항)</Label>
            <Input
              id="research-link"
              type="url"
              placeholder="https://example.com"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uploadFile">파일 업로드 (모든 형식)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="uploadFile"
                type="file"
                accept="*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <Upload className="w-4 h-4 text-muted-foreground" />
            </div>
            {uploadedFile && (
              <p className="text-sm text-muted-foreground">
                업로드됨: {uploadedFile.name} ({fileType})
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
            업로드
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GradeResearch({ 
  grade, 
  schoolType, 
  gradeNum, 
  materials,
  isLoggedIn,
  onDelete,
  onEdit
}: { 
  grade: string; 
  schoolType: "middle" | "high"; 
  gradeNum: string;
  materials: ResearchMaterial[];
  isLoggedIn: boolean;
  onDelete: (id: string) => void;
  onEdit: (material: ResearchMaterial) => void;
}) {
  const filteredMaterials = materials.filter(
    (m) => m.schoolType === schoolType && m.grade === gradeNum
  );

  const allResearches = filteredMaterials.map((m) => ({
    id: m.id,
    title: m.title,
    author: m.author,
    date: m.date,
    views: m.views,
    unit: m.unit,
    thumbnail: m.thumbnail,
    knowledgeUnderstanding: m.knowledgeUnderstanding,
  }));

  const [selectedMaterial, setSelectedMaterial] = useState<ResearchMaterial | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleViewMaterial = (materialId: string) => {
    const material = materials.find((m) => m.id === materialId);
    if (material) {
      if (material.link) {
        window.open(material.link, '_blank');
        const updated = materials.map((m) =>
          m.id === materialId ? { ...m, views: m.views + 1 } : m
        );
        localStorage.setItem("researchMaterials", JSON.stringify(updated));
      } else if (material.fileType === 'html' && material.fileData) {
        const blob = new Blob([material.fileData], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        const updated = materials.map((m) =>
          m.id === materialId ? { ...m, views: m.views + 1 } : m
        );
        localStorage.setItem("researchMaterials", JSON.stringify(updated));
      } else {
        setSelectedMaterial(material);
        setViewDialogOpen(true);
        const updated = materials.map((m) =>
          m.id === materialId ? { ...m, views: m.views + 1 } : m
        );
        localStorage.setItem("researchMaterials", JSON.stringify(updated));
      }
    }
  };

  const getGradientColor = (index: number) => {
    const gradients = [
      "from-blue-400 to-indigo-600",
      "from-purple-400 to-pink-600",
      "from-green-400 to-teal-600",
      "from-orange-400 to-red-600",
      "from-cyan-400 to-blue-600",
      "from-amber-400 to-orange-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div>
      <h4 className="mb-4 text-muted-foreground">{grade}</h4>
      <div>
        <div className="grid grid-cols-3 gap-6">
          {allResearches.map((research, index) => (
            <Card
              key={research.id}
              className="overflow-hidden border-0 shadow-sm bg-secondary hover:shadow-md transition-shadow cursor-pointer relative group"
            >
              <div onClick={() => handleViewMaterial(research.id)}>
                <div className="aspect-video bg-accent relative overflow-hidden">
                  {research.thumbnail ? (
                    <>
                      <ImageWithFallback
                        src={research.thumbnail}
                        alt={research.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                        {research.knowledgeUnderstanding || research.unit}
                      </div>
                    </>
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getGradientColor(index)} flex items-center justify-center`}>
                      <FlaskConical className="w-16 h-16 text-white/80" />
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="mb-3 line-clamp-2">{research.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>{research.author}</span>
                      <span>{research.date}</span>
                    </div>
                    <span className="text-xs">조회 {research.views}</span>
                  </div>
                </div>
              </div>
              {isLoggedIn && (
                <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8 bg-primary hover:bg-primary/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      const editDialog = document.getElementById(`edit-research-${research.id}`);
                      if (editDialog) {
                        (editDialog as any).click();
                      }
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('이 자료를 삭제하시겠습니까?')) {
                        onDelete(research.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {isLoggedIn && (
                <EditResearchDialog 
                  material={materials.find((m) => m.id === research.id)!}
                  onMaterialUpdated={onEdit}
                  triggerId={`edit-research-${research.id}`}
                />
              )}
            </Card>
          ))}
        </div>
      </div>

      {selectedMaterial && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedMaterial.title}</DialogTitle>
              <DialogDescription>
                {selectedMaterial.author} • {selectedMaterial.unit} • {selectedMaterial.date} • 조회 {selectedMaterial.views}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedMaterial.content && (
                <div className="mb-4 p-4 bg-secondary rounded-lg">
                  <p className="text-sm">{selectedMaterial.content}</p>
                </div>
              )}
              {selectedMaterial.fileType === 'image' && selectedMaterial.fileData && (
                <img src={selectedMaterial.fileData} alt={selectedMaterial.title} className="w-full rounded-lg" />
              )}
              {selectedMaterial.fileType === 'file' && selectedMaterial.fileData && (
                <div className="text-center">
                  <a href={selectedMaterial.fileData} download={selectedMaterial.fileName} className="text-primary underline">
                    파일 다운로드: {selectedMaterial.fileName}
                  </a>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// 평가자료 탭
function EvaluationTab({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [materials, setMaterials] = useState<EvaluationMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMaterials();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchMaterials = async () => {
    try {
      const result = await evaluationsAPI.getAll();
      if (result.success) {
        setMaterials(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch evaluations:", error);
      toast.error("평가자료를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialAdded = async (newMaterial: EvaluationMaterial) => {
    try {
      const result = await evaluationsAPI.create(newMaterial);
      if (result.success) {
        setMaterials([...materials, newMaterial]);
        toast.success("자료가 등록되었습니다");
      }
    } catch (error) {
      console.error("Failed to add evaluation:", error);
      toast.error("자료 등록에 실패했습니다");
    }
  };

  const handleMaterialDeleted = async (materialId: string) => {
    try {
      const result = await evaluationsAPI.delete(materialId);
      if (result.success) {
        setMaterials(materials.filter((m) => m.id !== materialId));
        toast.success("자료가 삭제되었습니다");
      }
    } catch (error) {
      console.error("Failed to delete evaluation:", error);
      toast.error("자료 삭제에 실패했습니다");
    }
  };

  const handleMaterialUpdated = async (material: EvaluationMaterial) => {
    try {
      const result = await evaluationsAPI.update(material.id, material);
      if (result.success) {
        setMaterials(materials.map((m) => m.id === material.id ? material : m));
        toast.success("자료가 수정되었습니다");
      }
    } catch (error) {
      console.error("Failed to update evaluation:", error);
      toast.error("자료 수정에 실패했습니다");
    }
  };

  if (!isLoggedIn) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-20">
            <FileCheck className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="mb-2">로그인이 필요합니다</h3>
            <p className="text-muted-foreground">평가자료를 보시려면 로그인해주세요.</p>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileCheck className="w-6 h-6 text-primary" />
            <h2>평가자료</h2>
          </div>
          <UploadEvaluationDialog onMaterialAdded={handleMaterialAdded} />
        </div>

        <Tabs defaultValue="middle-1" className="w-full">
          <div className="mb-6">
            <h3 className="mb-3">중학교</h3>
            <TabsList className="bg-secondary">
              <TabsTrigger value="middle-1">1학년</TabsTrigger>
              <TabsTrigger value="middle-2">2학년</TabsTrigger>
              <TabsTrigger value="middle-3">3학년</TabsTrigger>
            </TabsList>
          </div>

          <div className="mb-6">
            <h3 className="mb-3">고등학교</h3>
            <TabsList className="bg-secondary">
              <TabsTrigger value="high-1">1학년</TabsTrigger>
              <TabsTrigger value="high-2">2학년</TabsTrigger>
              <TabsTrigger value="high-3">3학년</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="middle-1" className="mt-6">
            <GradeEvaluation grade="중학교 1학년" schoolType="middle" gradeNum="1" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="middle-2" className="mt-6">
            <GradeEvaluation grade="중학교 2학년" schoolType="middle" gradeNum="2" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="middle-3" className="mt-6">
            <GradeEvaluation grade="중학교 3학년" schoolType="middle" gradeNum="3" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="high-1" className="mt-6">
            <GradeEvaluation grade="고등학교 1학년" schoolType="high" gradeNum="1" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="high-2" className="mt-6">
            <GradeEvaluation grade="고등학교 2학년" schoolType="high" gradeNum="2" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
          <TabsContent value="high-3" className="mt-6">
            <GradeEvaluation grade="고등학교 3학년" schoolType="high" gradeNum="3" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

// 평가자료 수정 다이얼로그
function EditEvaluationDialog({ material, onMaterialUpdated, triggerId }: { material: EvaluationMaterial; onMaterialUpdated: (material: EvaluationMaterial) => void; triggerId: string }) {
  const [open, setOpen] = useState(false);
  const [schoolType, setSchoolType] = useState<"middle" | "high">(material.schoolType);
  const [grade, setGrade] = useState<"1" | "2" | "3">(material.grade);
  const [title, setTitle] = useState(material.title);
  const [content, setContent] = useState(material.content);
  const [type, setType] = useState(material.type);
  const [status, setStatus] = useState(material.status);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string>(material.thumbnail || "");
  const [fileType, setFileType] = useState<string>(material.fileType || "");
  const [fileData, setFileData] = useState<string>(material.fileData || "");

  useEffect(() => {
    setSchoolType(material.schoolType);
    setGrade(material.grade);
    setTitle(material.title);
    setContent(material.content);
    setType(material.type);
    setStatus(material.status);
    setThumbnail(material.thumbnail || "");
    setFileType(material.fileType || "");
    setFileData(material.fileData || "");
  }, [material]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      setFileType('image');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
        setThumbnail(dataUrl);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
      setFileType('html');
      reader.onload = (event) => {
        const htmlContent = event.target?.result as string;
        setFileData(htmlContent);
      };
      reader.readAsText(file);
    } else {
      setFileType('file');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title) {
      alert("제목을 입력해주세요.");
      return;
    }

    const now = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const updatedMaterial: EvaluationMaterial = {
      ...material,
      schoolType,
      grade,
      title,
      content,
      type,
      status,
      updatedAt: now,
      thumbnail: uploadedFile ? thumbnail : material.thumbnail,
      fileType: uploadedFile ? fileType : material.fileType,
      fileName: uploadedFile ? uploadedFile.name : material.fileName,
      fileData: uploadedFile ? fileData : material.fileData,
    };

    onMaterialUpdated(updatedMaterial);
    setOpen(false);
    setUploadedFile(null);
  };

  return (
    <>
      <button id={triggerId} className="hidden" onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>평가자료 수정</DialogTitle>
            <DialogDescription>
              자료의 내용을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-eval-schoolType">학교구분</Label>
                <Select value={schoolType} onValueChange={(value: "middle" | "high") => setSchoolType(value)}>
                  <SelectTrigger id="edit-eval-schoolType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="middle">중학교</SelectItem>
                    <SelectItem value="high">고등학교</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-eval-grade">학년</Label>
                <Select value={grade} onValueChange={(value: "1" | "2" | "3") => setGrade(value)}>
                  <SelectTrigger id="edit-eval-grade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1학년</SelectItem>
                    <SelectItem value="2">2학년</SelectItem>
                    <SelectItem value="3">3학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-eval-title">제목</Label>
              <Input
                id="edit-eval-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-eval-type">유형</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="edit-eval-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="시험">시험</SelectItem>
                    <SelectItem value="수행평가">수행평가</SelectItem>
                    <SelectItem value="퀴즈">퀴즈</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-eval-status">상태</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="edit-eval-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="예정">예정</SelectItem>
                    <SelectItem value="진행중">진행중</SelectItem>
                    <SelectItem value="완료">완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-eval-content">내용</Label>
              <Textarea
                id="edit-eval-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-eval-file">파일 업로드 (선택사항)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-eval-file"
                  type="file"
                  accept="*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <Upload className="w-4 h-4 text-muted-foreground" />
              </div>
              {uploadedFile && (
                <p className="text-sm text-muted-foreground">
                  새 파일: {uploadedFile.name} ({fileType})
                </p>
              )}
              {!uploadedFile && material.fileName && (
                <p className="text-sm text-muted-foreground">
                  현재 파일: {material.fileName}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 평가자료 업로드 다이얼로그
function UploadEvaluationDialog({ onMaterialAdded }: { onMaterialAdded: (material: EvaluationMaterial) => void }) {
  const [open, setOpen] = useState(false);
  const [schoolType, setSchoolType] = useState<"middle" | "high">("middle");
  const [grade, setGrade] = useState<"1" | "2" | "3">("1");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("시험");
  const [status, setStatus] = useState("예정");
  const [content, setContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [fileData, setFileData] = useState<string>("");
  const [link, setLink] = useState<string>("");

  const captureHtmlThumbnail = async (htmlContent: string): Promise<string> => {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.width = '1200px';
      iframe.style.height = '800px';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      iframe.onload = async () => {
        try {
          await new Promise(r => setTimeout(r, 500));
          
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc && iframeDoc.body) {
            const canvas = await html2canvas(iframeDoc.body, {
              width: 1200,
              height: 800,
              scale: 0.5,
              useCORS: true,
              allowTaint: true,
            });
            
            const thumbnailDataUrl = canvas.toDataURL('image/png');
            document.body.removeChild(iframe);
            resolve(thumbnailDataUrl);
          } else {
            document.body.removeChild(iframe);
            resolve('');
          }
        } catch (error) {
          console.error('Failed to capture thumbnail:', error);
          document.body.removeChild(iframe);
          resolve('');
        }
      };
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      setFileType('image');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
        setThumbnail(dataUrl);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
      setFileType('html');
      reader.onload = async (event) => {
        const htmlContent = event.target?.result as string;
        setFileData(htmlContent);
        
        toast.info('HTML 썸네일 생성 중...');
        const thumbnailDataUrl = await captureHtmlThumbnail(htmlContent);
        if (thumbnailDataUrl) {
          setThumbnail(thumbnailDataUrl);
          toast.success('썸네일 생성 완료!');
        } else {
          toast.error('썸네일 생성 실패');
        }
      };
      reader.readAsText(file);
    } else {
      setFileType('file');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title) {
      alert("제목을 입력해주세요.");
      return;
    }

    const now = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const newMaterial: EvaluationMaterial = {
      id: Date.now().toString(),
      schoolType,
      grade,
      title,
      content,
      type,
      date: now,
      status,
      thumbnail,
      fileType,
      fileName: uploadedFile?.name,
      fileData,
      link,
      createdAt: now,
      updatedAt: now,
    };

    onMaterialAdded(newMaterial);
    
    setSchoolType("middle");
    setGrade("1");
    setTitle("");
    setType("시험");
    setStatus("예정");
    setContent("");
    setUploadedFile(null);
    setThumbnail("");
    setFileType("");
    setFileData("");
    setLink("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          자료 업로드
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>평가자료 업로드</DialogTitle>
          <DialogDescription>
            새로운 평가자료를 업로드합니다. 학교구분과 학년을 선택해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eval-schoolType">학교구분</Label>
              <Select value={schoolType} onValueChange={(value: "middle" | "high") => setSchoolType(value)}>
                <SelectTrigger id="eval-schoolType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="middle">중학교</SelectItem>
                  <SelectItem value="high">고등학교</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eval-grade">학년</Label>
              <Select value={grade} onValueChange={(value: "1" | "2" | "3") => setGrade(value)}>
                <SelectTrigger id="eval-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1학년</SelectItem>
                  <SelectItem value="2">2학년</SelectItem>
                  <SelectItem value="3">3학년</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eval-title">제목</Label>
            <Input
              id="eval-title"
              placeholder="평가자료 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eval-type">평가 유형</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="eval-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="시험">시험</SelectItem>
                  <SelectItem value="수행평가">수행평가</SelectItem>
                  <SelectItem value="퀴즈">퀴즈</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eval-status">상태</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="eval-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="예정">예정</SelectItem>
                  <SelectItem value="진행중">진행중</SelectItem>
                  <SelectItem value="완료">��료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="eval-content">내용 (파일에 대한 설명)</Label>
            <Textarea
              id="eval-content"
              placeholder="평가자료에 대한 설명을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eval-link">링크 (선택사항)</Label>
            <Input
              id="eval-link"
              type="url"
              placeholder="https://example.com"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eval-uploadFile">파일 업로드 (모든 형식)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="eval-uploadFile"
                type="file"
                accept="*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <Upload className="w-4 h-4 text-muted-foreground" />
            </div>
            {uploadedFile && (
              <p className="text-sm text-muted-foreground">
                업로드됨: {uploadedFile.name} ({fileType})
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
            업로드
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GradeEvaluation({ 
  grade, 
  schoolType, 
  gradeNum, 
  materials,
  isLoggedIn,
  onDelete,
  onEdit
}: { 
  grade: string; 
  schoolType: "middle" | "high"; 
  gradeNum: string;
  materials: EvaluationMaterial[];
  isLoggedIn: boolean;
  onDelete: (id: string) => void;
  onEdit: (material: EvaluationMaterial) => void;
}) {
  const filteredMaterials = materials.filter(
    (m) => m.schoolType === schoolType && m.grade === gradeNum
  );

  const allEvaluations = filteredMaterials.map((m) => ({
    id: m.id,
    title: m.title,
    type: m.type,
    date: m.date,
    status: m.status,
    thumbnail: m.thumbnail,
    knowledgeUnderstanding: m.knowledgeUnderstanding,
  }));

  const [selectedMaterial, setSelectedMaterial] = useState<EvaluationMaterial | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleViewMaterial = (materialId: string) => {
    const material = materials.find((m) => m.id === materialId);
    if (material) {
      if (material.fileType === 'html' && material.fileData) {
        const blob = new Blob([material.fileData], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        setSelectedMaterial(material);
        setViewDialogOpen(true);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료":
        return "bg-green-500/10 text-green-700";
      case "진행중":
        return "bg-blue-500/10 text-blue-700";
      case "예정":
        return "bg-orange-500/10 text-orange-700";
      default:
        return "bg-gray-500/10 text-gray-700";
    }
  };

  const getGradientColor = (index: number) => {
    const gradients = [
      "from-blue-400 to-indigo-600",
      "from-purple-400 to-pink-600",
      "from-green-400 to-teal-600",
      "from-orange-400 to-red-600",
      "from-cyan-400 to-blue-600",
      "from-amber-400 to-orange-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div>
      <h4 className="mb-4 text-muted-foreground">{grade}</h4>
      <div className="grid grid-cols-3 gap-6">
        {allEvaluations.map((evaluation, index) => (
          <Card 
            key={evaluation.id} 
            className="overflow-hidden border-0 shadow-sm bg-secondary hover:shadow-md transition-shadow cursor-pointer relative group"
          >
            <div onClick={() => handleViewMaterial(evaluation.id)}>
              <div className="aspect-video bg-accent relative overflow-hidden">
                {evaluation.thumbnail ? (
                  <ImageWithFallback
                    src={evaluation.thumbnail}
                    alt={evaluation.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${getGradientColor(index)} flex items-center justify-center`}>
                    <FileCheck className="w-16 h-16 text-white/80" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs rounded shadow-sm ${getStatusColor(evaluation.status)}`}>
                    {evaluation.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="mb-3 line-clamp-2">{evaluation.title}</h3>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="px-2 py-0.5 bg-accent rounded text-xs">{evaluation.type}</span>
                  <span>{evaluation.date}</span>
                </div>
              </div>
            </div>
            {isLoggedIn && (
              <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 bg-primary hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    const editDialog = document.getElementById(`edit-eval-${evaluation.id}`);
                    if (editDialog) {
                      (editDialog as any).click();
                    }
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('이 자료를 삭제하시겠습니까?')) {
                      onDelete(evaluation.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            {isLoggedIn && (
              <EditEvaluationDialog 
                material={materials.find((m) => m.id === evaluation.id)!}
                onMaterialUpdated={onEdit}
                triggerId={`edit-eval-${evaluation.id}`}
              />
            )}
          </Card>
        ))}
      </div>

      {selectedMaterial && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedMaterial.title}</DialogTitle>
              <DialogDescription>
                {selectedMaterial.type} • {selectedMaterial.date} • {selectedMaterial.status}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4 flex gap-4 text-xs text-muted-foreground">
                {selectedMaterial.createdAt && (
                  <span>업로드: {selectedMaterial.createdAt}</span>
                )}
                {selectedMaterial.updatedAt && selectedMaterial.updatedAt !== selectedMaterial.createdAt && (
                  <span>수정: {selectedMaterial.updatedAt}</span>
                )}
              </div>
              {selectedMaterial.content && (
                <div className="mb-4 p-4 bg-secondary rounded-lg">
                  <p className="text-sm">{selectedMaterial.content}</p>
                </div>
              )}
              {selectedMaterial.fileType === 'image' && selectedMaterial.fileData && (
                <img src={selectedMaterial.fileData} alt={selectedMaterial.title} className="w-full rounded-lg" />
              )}
              {selectedMaterial.fileType === 'file' && selectedMaterial.fileData && (
                <div className="text-center">
                  <a href={selectedMaterial.fileData} download={selectedMaterial.fileName} className="text-primary underline">
                    파일 다운로드: {selectedMaterial.fileName}
                  </a>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// CBCI 설계 탭 - 계속...
function CBCITab({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [materials, setMaterials] = useState<CBCIMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMaterials();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchMaterials = async () => {
    try {
      const result = await cbciAPI.getAll();
      if (result.success) {
        setMaterials(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch CBCI:", error);
      toast.error("CBCI 자료를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialAdded = async (newMaterial: CBCIMaterial) => {
    try {
      const result = await cbciAPI.create(newMaterial);
      if (result.success) {
        setMaterials([...materials, newMaterial]);
        toast.success("자료가 등록되었습니다");
      }
    } catch (error) {
      console.error("Failed to add CBCI:", error);
      toast.error("자료 등록에 실패했습니다");
    }
  };

  const handleMaterialDeleted = async (materialId: string) => {
    try {
      const result = await cbciAPI.delete(materialId);
      if (result.success) {
        setMaterials(materials.filter((m) => m.id !== materialId));
        toast.success("자료가 삭제되었습니다");
      }
    } catch (error) {
      console.error("Failed to delete CBCI:", error);
      toast.error("자료 삭제에 실패했습니다");
    }
  };

  const handleMaterialUpdated = async (material: CBCIMaterial) => {
    try {
      const result = await cbciAPI.update(material.id, material);
      if (result.success) {
        setMaterials(materials.map((m) => m.id === material.id ? material : m));
        toast.success("자료가 수정되었습니다");
      }
    } catch (error) {
      console.error("Failed to update CBCI:", error);
      toast.error("자료 수정에 실패했습니다");
    }
  };

  if (!isLoggedIn) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-[980px] mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-20">
            <Lightbulb className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="mb-2">로그인이 필요합니다</h3>
            <p className="text-muted-foreground">CBCI 설계 자료를 보시려면 로그인해주세요.</p>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <Lightbulb className="w-6 h-6 text-primary" />
          <h2>CBCI 설계</h2>
          <span className="text-sm text-muted-foreground ml-2">Concept Based Curriculum Institute</span>
        </div>

        {/* 참고자료 섹션 */}
        <div className="mb-12">
          <h3 className="mb-4">참고자료</h3>
          <div className="grid grid-cols-3 gap-6">
            <Card 
              className="overflow-hidden border-0 shadow-sm bg-secondary hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.open('https://metahan88-droid.github.io/cbci/22%20%EC%A4%91%ED%95%99%EA%B5%90%20%EB%8B%A8%EC%9B%90%EC%84%A4%EA%B3%84%20%EC%96%91%EC%8B%9D.html', '_blank')}
            >
              <div className="aspect-video bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center">
                <Lightbulb className="w-16 h-16 text-white/80" />
              </div>
              <div className="p-6">
                <h3 className="mb-2">22개정 내용체계 설계</h3>
                <p className="text-sm text-muted-foreground">2022 개정 교육과정 내용 체계 설계 양식</p>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3>학년별 설계자료</h3>
          <UploadCBCIDialog onMaterialAdded={handleMaterialAdded} />
        </div>

        <Tabs defaultValue="middle-1" className="w-full">
          <div className="mb-6">
            <h3 className="mb-3">중학교</h3>
            <TabsList className="bg-secondary">
              <TabsTrigger value="middle-1">1학년</TabsTrigger>
              <TabsTrigger value="middle-2">2학년</TabsTrigger>
              <TabsTrigger value="middle-3">3학년</TabsTrigger>
            </TabsList>
          </div>

          <div className="mb-6">
            <h3 className="mb-3">고등학교</h3>
            <TabsList className="bg-secondary">
              <TabsTrigger value="high-1">1학년</TabsTrigger>
              <TabsTrigger value="high-2">2학년</TabsTrigger>
              <TabsTrigger value="high-3">3학년</TabsTrigger>
            </TabsList>
          </div>

          <div>
            <TabsContent value="middle-1" className="mt-6">
              <GradeCBCI grade="중학교 1학년" schoolType="middle" gradeNum="1" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
            </TabsContent>
            <TabsContent value="middle-2" className="mt-6">
              <GradeCBCI grade="중학교 2학년" schoolType="middle" gradeNum="2" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
            </TabsContent>
            <TabsContent value="middle-3" className="mt-6">
              <GradeCBCI grade="중학교 3학년" schoolType="middle" gradeNum="3" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
            </TabsContent>
            <TabsContent value="high-1" className="mt-6">
              <GradeCBCI grade="고등학교 1학년" schoolType="high" gradeNum="1" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
            </TabsContent>
            <TabsContent value="high-2" className="mt-6">
              <GradeCBCI grade="고등학교 2학년" schoolType="high" gradeNum="2" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
            </TabsContent>
            <TabsContent value="high-3" className="mt-6">
              <GradeCBCI grade="고등학교 3학년" schoolType="high" gradeNum="3" materials={materials} isLoggedIn={isLoggedIn} onDelete={handleMaterialDeleted} onEdit={handleMaterialUpdated} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </section>
  );
}

// CBCI 설계자료 수정 다이얼로그
function EditCBCIDialog({ material, onMaterialUpdated, triggerId }: { material: CBCIMaterial; onMaterialUpdated: (material: CBCIMaterial) => void; triggerId: string }) {
  const [open, setOpen] = useState(false);
  const [schoolType, setSchoolType] = useState<"middle" | "high">(material.schoolType);
  const [grade, setGrade] = useState<"1" | "2" | "3">(material.grade);
  const [unit, setUnit] = useState(material.unit || "");
  const [title, setTitle] = useState(material.title);
  const [content, setContent] = useState(material.content);
  const [description, setDescription] = useState(material.description);
  const [progress, setProgress] = useState(material.progress);
  const [deadline, setDeadline] = useState(material.deadline);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string>(material.thumbnail || "");
  const [fileType, setFileType] = useState<string>(material.fileType || "");
  const [fileData, setFileData] = useState<string>(material.fileData || "");
  const [contentSystem, setContentSystem] = useState<string>(material.contentSystem || "");
  const [knowledgeUnderstanding, setKnowledgeUnderstanding] = useState<string>(material.knowledgeUnderstanding || "");

  useEffect(() => {
    setSchoolType(material.schoolType);
    setGrade(material.grade);
    setUnit(material.unit || "");
    setTitle(material.title);
    setContent(material.content);
    setDescription(material.description);
    setProgress(material.progress);
    setDeadline(material.deadline);
    setThumbnail(material.thumbnail || "");
    setFileType(material.fileType || "");
    setFileData(material.fileData || "");
    setContentSystem(material.contentSystem || "");
    setKnowledgeUnderstanding(material.knowledgeUnderstanding || "");
  }, [material]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      setFileType('image');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
        setThumbnail(dataUrl);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
      setFileType('html');
      reader.onload = (event) => {
        const htmlContent = event.target?.result as string;
        setFileData(htmlContent);
      };
      reader.readAsText(file);
    } else {
      setFileType('file');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title || !unit) {
      alert("제목과 단원명을 입력해주세요.");
      return;
    }

    const now = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const updatedMaterial: CBCIMaterial = {
      ...material,
      schoolType,
      grade,
      unit,
      title,
      content,
      description,
      progress,
      deadline,
      updatedAt: now,
      thumbnail: uploadedFile ? thumbnail : material.thumbnail,
      fileType: uploadedFile ? fileType : material.fileType,
      fileName: uploadedFile ? uploadedFile.name : material.fileName,
      fileData: uploadedFile ? fileData : material.fileData,
      contentSystem,
      knowledgeUnderstanding,
    };

    onMaterialUpdated(updatedMaterial);
    setOpen(false);
    setUploadedFile(null);
  };

  return (
    <>
      <button id={triggerId} className="hidden" onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CBCI 설계 수정</DialogTitle>
            <DialogDescription>
              자료의 내용을 수정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cbci-schoolType">학교구분</Label>
                <Select value={schoolType} onValueChange={(value: "middle" | "high") => setSchoolType(value)}>
                  <SelectTrigger id="edit-cbci-schoolType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="middle">중학교</SelectItem>
                    <SelectItem value="high">고등학교</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cbci-grade">학년</Label>
                <Select value={grade} onValueChange={(value: "1" | "2" | "3") => setGrade(value)}>
                  <SelectTrigger id="edit-cbci-grade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1학년</SelectItem>
                    <SelectItem value="2">2학년</SelectItem>
                    <SelectItem value="3">3학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cbci-contentSystem">내용체계</Label>
              <Select value={contentSystem} onValueChange={(value) => {
                setContentSystem(value);
                setKnowledgeUnderstanding("");
              }}>
                <SelectTrigger id="edit-cbci-contentSystem">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="수와 연산">수와 연산</SelectItem>
                  <SelectItem value="변화와 관계">변화와 관계</SelectItem>
                  <SelectItem value="도형과 측정">도형과 측정</SelectItem>
                  <SelectItem value="자료와 가능성">자료와 가능성</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {contentSystem && (
              <div className="space-y-2">
                <Label htmlFor="edit-cbci-knowledge">지식·이해</Label>
                <Select value={knowledgeUnderstanding} onValueChange={setKnowledgeUnderstanding}>
                  <SelectTrigger id="edit-cbci-knowledge">
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {curriculumKnowledge[contentSystem as keyof typeof curriculumKnowledge].map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-cbci-title">제목</Label>
              <Input
                id="edit-cbci-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cbci-description">설명</Label>
              <Input
                id="edit-cbci-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cbci-progress">진행률 ({progress}%)</Label>
                <Input
                  id="edit-cbci-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cbci-deadline">마감일</Label>
                <Input
                  id="edit-cbci-deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="YYYY.MM.DD"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cbci-content">내용</Label>
              <Textarea
                id="edit-cbci-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cbci-file">파일 업로드 (선택사항)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-cbci-file"
                  type="file"
                  accept="*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <Upload className="w-4 h-4 text-muted-foreground" />
              </div>
              {uploadedFile && (
                <p className="text-sm text-muted-foreground">
                  새 파일: {uploadedFile.name} ({fileType})
                </p>
              )}
              {!uploadedFile && material.fileName && (
                <p className="text-sm text-muted-foreground">
                  현재 파일: {material.fileName}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// CBCI 설계자료 업로드 다이얼로그
function UploadCBCIDialog({ onMaterialAdded }: { onMaterialAdded: (material: CBCIMaterial) => void }) {
  const [open, setOpen] = useState(false);
  const [schoolType, setSchoolType] = useState<"middle" | "high">("middle");
  const [grade, setGrade] = useState<"1" | "2" | "3">("1");
  const [unit, setUnit] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgress] = useState(0);
  const [content, setContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [fileData, setFileData] = useState<string>("");
  const [contentSystem, setContentSystem] = useState<string>("");
  const [knowledgeUnderstanding, setKnowledgeUnderstanding] = useState<string>("");

  const captureHtmlThumbnail = async (htmlContent: string): Promise<string> => {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.width = '1200px';
      iframe.style.height = '800px';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      iframe.onload = async () => {
        try {
          await new Promise(r => setTimeout(r, 500));
          
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc && iframeDoc.body) {
            const canvas = await html2canvas(iframeDoc.body, {
              width: 1200,
              height: 800,
              scale: 0.5,
              useCORS: true,
              allowTaint: true,
            });
            
            const thumbnailDataUrl = canvas.toDataURL('image/png');
            document.body.removeChild(iframe);
            resolve(thumbnailDataUrl);
          } else {
            document.body.removeChild(iframe);
            resolve('');
          }
        } catch (error) {
          console.error('Failed to capture thumbnail:', error);
          document.body.removeChild(iframe);
          resolve('');
        }
      };
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      setFileType('image');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
        setThumbnail(dataUrl);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/html' || file.name.endsWith('.html')) {
      setFileType('html');
      reader.onload = async (event) => {
        const htmlContent = event.target?.result as string;
        setFileData(htmlContent);
        
        toast.info('HTML 썸네일 생성 중...');
        const thumbnailDataUrl = await captureHtmlThumbnail(htmlContent);
        if (thumbnailDataUrl) {
          setThumbnail(thumbnailDataUrl);
          toast.success('썸네일 생성 완료!');
        } else {
          toast.error('썸네일 생성 실패');
        }
      };
      reader.readAsText(file);
    } else {
      setFileType('file');
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFileData(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title || !unit) {
      alert("제목과 단원명을 입력해주세요.");
      return;
    }

    const now = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const newMaterial: CBCIMaterial = {
      id: Date.now().toString(),
      schoolType,
      grade,
      unit,
      title,
      content,
      description,
      deadline: deadline || now,
      progress,
      thumbnail,
      fileType,
      fileName: uploadedFile?.name,
      fileData,
      link,
      createdAt: now,
      updatedAt: now,
      contentSystem,
      knowledgeUnderstanding,
    };

    onMaterialAdded(newMaterial);
    
    setSchoolType("middle");
    setGrade("1");
    setUnit("");
    setTitle("");
    setDescription("");
    setDeadline("");
    setProgress(0);
    setContent("");
    setUploadedFile(null);
    setThumbnail("");
    setFileType("");
    setFileData("");
    setLink("");
    setContentSystem("");
    setKnowledgeUnderstanding("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          자료 업로드
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CBCI 설계자료 업로드</DialogTitle>
          <DialogDescription>
            새로운 CBCI 설계자료를 업로드합니다. 학교구분과 학년을 선택해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cbci-schoolType">학교구분</Label>
              <Select value={schoolType} onValueChange={(value: "middle" | "high") => setSchoolType(value)}>
                <SelectTrigger id="cbci-schoolType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="middle">중학교</SelectItem>
                  <SelectItem value="high">고등학교</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cbci-grade">학년</Label>
              <Select value={grade} onValueChange={(value: "1" | "2" | "3") => setGrade(value)}>
                <SelectTrigger id="cbci-grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1학년</SelectItem>
                  <SelectItem value="2">2학년</SelectItem>
                  <SelectItem value="3">3학년</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cbci-unit">단원명</Label>
            <Input
              id="cbci-unit"
              placeholder="예: 1단원"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cbci-contentSystem">내용체계</Label>
            <Select value={contentSystem} onValueChange={(value) => {
              setContentSystem(value);
              setKnowledgeUnderstanding("");
            }}>
              <SelectTrigger id="cbci-contentSystem">
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="수와 연산">수와 연산</SelectItem>
                <SelectItem value="변화와 관계">변화와 관계</SelectItem>
                <SelectItem value="도형과 측정">도형과 측정</SelectItem>
                <SelectItem value="자료와 가능성">자료와 가능성</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {contentSystem && (
            <div className="space-y-2">
              <Label htmlFor="cbci-knowledge">지식·이해</Label>
              <Select value={knowledgeUnderstanding} onValueChange={setKnowledgeUnderstanding}>
                <SelectTrigger id="cbci-knowledge">
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {curriculumKnowledge[contentSystem as keyof typeof curriculumKnowledge].map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="cbci-title">제목</Label>
            <Input
              id="cbci-title"
              placeholder="프로젝트 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cbci-description">설명</Label>
            <Input
              id="cbci-description"
              placeholder="간단한 설명을 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cbci-deadline">마감일</Label>
            <Input
              id="cbci-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cbci-progress">진행률 (%)</Label>
            <Input
              id="cbci-progress"
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cbci-content">내용 (파일에 대한 설명)</Label>
            <Textarea
              id="cbci-content"
              placeholder="설계자료에 대한 상세 설명을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cbci-uploadFile">파일 업로드 (모든 형식)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="cbci-uploadFile"
                type="file"
                accept="*"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <Upload className="w-4 h-4 text-muted-foreground" />
            </div>
            {uploadedFile && (
              <p className="text-sm text-muted-foreground">
                업로드됨: {uploadedFile.name} ({fileType})
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
            업로드
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GradeCBCI({ 
  grade, 
  schoolType, 
  gradeNum, 
  materials,
  isLoggedIn,
  onDelete,
  onEdit
}: { 
  grade: string; 
  schoolType: "middle" | "high"; 
  gradeNum: string;
  materials: CBCIMaterial[];
  isLoggedIn: boolean;
  onDelete: (id: string) => void;
  onEdit: (material: CBCIMaterial) => void;
}) {
  const filteredMaterials = materials.filter(
    (m) => m.schoolType === schoolType && m.grade === gradeNum
  );

  const allProjects = filteredMaterials.map((m) => ({
    id: m.id,
    title: m.title,
    progress: m.progress,
    deadline: m.deadline,
    description: m.description,
    thumbnail: m.thumbnail,
  }));

  const [selectedMaterial, setSelectedMaterial] = useState<CBCIMaterial | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleViewMaterial = (materialId: string) => {
    const material = materials.find((m) => m.id === materialId);
    if (material) {
      if (material.fileType === 'html' && material.fileData) {
        const blob = new Blob([material.fileData], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        setSelectedMaterial(material);
        setViewDialogOpen(true);
      }
    }
  };

  const getGradientColor = (index: number) => {
    const gradients = [
      "from-blue-400 to-indigo-600",
      "from-purple-400 to-pink-600",
      "from-green-400 to-teal-600",
      "from-orange-400 to-red-600",
      "from-cyan-400 to-blue-600",
      "from-amber-400 to-orange-600",
    ];
    return gradients[index % gradients.length];
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    return "bg-orange-500";
  };

  return (
    <div>
      <h4 className="mb-4 text-muted-foreground">{grade}</h4>
      <div className="grid grid-cols-3 gap-6">
        {allProjects.map((project, index) => (
          <Card 
            key={project.id} 
            className="overflow-hidden border-0 shadow-sm bg-secondary hover:shadow-md transition-shadow cursor-pointer relative group"
          >
            <div onClick={() => handleViewMaterial(project.id)}>
              <div className="aspect-video bg-accent relative overflow-hidden">
                {project.thumbnail ? (
                  <>
                    <ImageWithFallback
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                      {project.knowledgeUnderstanding || project.unit}
                    </div>
                    <div className="absolute top-2 left-2 bg-background/90 backdrop-blur text-foreground px-2 py-1 rounded text-xs shadow-sm">
                      {project.progress}%
                    </div>
                  </>
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${getGradientColor(index)} flex items-center justify-center`}>
                    <Lightbulb className="w-16 h-16 text-white/80" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="mb-2 line-clamp-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>마감: {project.deadline}</span>
                </div>
                <div className="w-full bg-accent rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getProgressColor(project.progress)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {isLoggedIn && (
              <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 bg-primary hover:bg-primary/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    const editDialog = document.getElementById(`edit-cbci-${project.id}`);
                    if (editDialog) {
                      (editDialog as any).click();
                    }
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('이 자료를 삭제하시겠습니까?')) {
                      onDelete(project.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            {isLoggedIn && (
              <EditCBCIDialog 
                material={materials.find((m) => m.id === project.id)!}
                onMaterialUpdated={onEdit}
                triggerId={`edit-cbci-${project.id}`}
              />
            )}
          </Card>
        ))}
      </div>

      {selectedMaterial && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedMaterial.title}</DialogTitle>
              <DialogDescription>
                {selectedMaterial.description} • 마감: {selectedMaterial.deadline} • 진행률: {selectedMaterial.progress}%
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4 flex gap-4 text-xs text-muted-foreground">
                {selectedMaterial.createdAt && (
                  <span>업로드: {selectedMaterial.createdAt}</span>
                )}
                {selectedMaterial.updatedAt && selectedMaterial.updatedAt !== selectedMaterial.createdAt && (
                  <span>수정: {selectedMaterial.updatedAt}</span>
                )}
              </div>
              <div className="mb-4">
                <div className="w-full bg-accent rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${getProgressColor(selectedMaterial.progress)}`}
                    style={{ width: `${selectedMaterial.progress}%` }}
                  ></div>
                </div>
              </div>
              {selectedMaterial.content && (
                <div className="mb-4 p-4 bg-secondary rounded-lg">
                  <p className="text-sm">{selectedMaterial.content}</p>
                </div>
              )}
              {selectedMaterial.fileType === 'image' && selectedMaterial.fileData && (
                <img src={selectedMaterial.fileData} alt={selectedMaterial.title} className="w-full rounded-lg" />
              )}
              {selectedMaterial.fileType === 'file' && selectedMaterial.fileData && (
                <div className="text-center">
                  <a href={selectedMaterial.fileData} download={selectedMaterial.fileName} className="text-primary underline">
                    파일 다운로드: {selectedMaterial.fileName}
                  </a>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// With 탭
function WithTab() {
  const collaborations = [
    {
      title: "대학 연계 실험실 프로그램",
      partner: "서울대학교",
      type: "협업",
      date: "2025.05.01 - 2025.06.30",
    },
    {
      title: "산업체 멘토링",
      partner: "삼성전자",
      type: "멘토링",
      date: "2025.03.15 - 2025.12.31",
    },
    {
      title: "국제 교류 프로그램",
      partner: "MIT",
      type: "교류",
      date: "2025.07.01 - 2025.07.15",
    },
  ];

  return (
    <section className="py-12 bg-background">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-6 h-6 text-primary" />
          <h2>With</h2>
        </div>
        <div className="space-y-4">
          {collaborations.map((collab, index) => (
            <Card key={index} className="p-6 border-0 shadow-sm bg-secondary hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">{collab.type}</span>
                    <span className="px-2 py-0.5 bg-accent text-accent-foreground text-xs rounded">{collab.partner}</span>
                  </div>
                  <h3 className="mb-2">{collab.title}</h3>
                  <p className="text-sm text-muted-foreground">{collab.date}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer({ onLogin, onSignup, isLoggedIn, onLogout }: { onLogin: () => void; onSignup: () => void; isLoggedIn: boolean; onLogout: () => void }) {
  return (
    <footer className="bg-secondary py-12 border-t border-border">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="grid grid-cols-5 gap-8 mb-8">
          <div>
            <h4 className="text-xs mb-3">수업자료</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">중1 수업자료</a></li>
              <li><a href="#" className="hover:text-foreground">중2 수업자료</a></li>
              <li><a href="#" className="hover:text-foreground">중3 수업자료</a></li>
              <li><a href="#" className="hover:text-foreground">고등 수업자료</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs mb-3">자료 및 다운로드</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">중1 탐구자료</a></li>
              <li><a href="#" className="hover:text-foreground">중2 탐구자료</a></li>
              <li><a href="#" className="hover:text-foreground">중3 탐구자료</a></li>
              <li><a href="#" className="hover:text-foreground">통합/심화 자료</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs mb-3">서비스</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">수업 설계 지원</a></li>
              <li><a href="#" className="hover:text-foreground">교사 연수</a></li>
              <li><a href="#" className="hover:text-foreground">활용 가이드</a></li>
              <li><a href="#" className="hover:text-foreground">문의하기</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs mb-3">계정</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                {!isLoggedIn && (
                  <button onClick={onSignup} className="hover:text-foreground">회원가입</button>
                )}
              </li>
              <li>
                {isLoggedIn ? (
                  <button onClick={onLogout} className="hover:text-foreground">로그아웃</button>
                ) : (
                  <button onClick={onLogin} className="hover:text-foreground">로그인</button>
                )}
              </li>
              <li><a href="#" className="hover:text-foreground">내 자료함</a></li>
              <li><a href="#" className="hover:text-foreground">다운로드 내역</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs mb-3">커뮤니티</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">교사 커뮤니티</a></li>
              <li><a href="#" className="hover:text-foreground">Q&A</a></li>
              <li><a href="#" className="hover:text-foreground">자료 공유</a></li>
              <li><a href="#" className="hover:text-foreground">교육 뉴스</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            © 2025 CBCI MATH. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
