// --- 1. 필수 라이브러리 및 모듈 임포트 ---
import { PrismaClient, Proficiency, Position, TechStack, Difficulty, ApplicationStatus } from '@prisma/client';
// uuid 라이브러리에서 v7 함수를 임포트한다고 가정
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

// --- 2. ID 맵 정의 (관계 연결을 위해 실제 생성된 UUID를 저장할 객체) ---
const idMap: {
  users: Record<string, string>;
  projects: Record<string, string>;
} = {
  users: {},
  projects: {},
};

// --- 3. Mock Data 정의 (가상의 키 사용) ---

// 🟢 User Keys
const USER_OWNER = 'chulsoo';       // 프로젝트 1 오너 (김철수)
const USER_MEMBER = 'younghee';     // 프로젝트 1 멤버 (이영희)
const USER_PENDING = 'daegi';       // 지원자 - 대기 상태 (박대기)
const USER_REJECTED = 'geojul';     // 지원자 - 거절 상태 (최거절)
const USER_NO_INFO = 'noinfo';      // ✅ 특이 케이스: 최소 정보 사용자
const USER_MAX_PROF = 'platinum';   // ✅ 특이 케이스: 최고 숙련도 사용자

// 🟢 Project Keys
const PROJECT_DEVCONNECT = 'devconnect';
const PROJECT_DIARY = 'diary';
const PROJECT_WRITEWISE = 'writewise';
const PROJECT_FITBUDDY = 'fitbuddy';
const PROJECT_CLOSED = 'closed';           // ✅ 특이 케이스: 모집 마감된 프로젝트
const PROJECT_IMMEDIATE = 'immediate';     // ✅ 특이 케이스: 오늘 시작하는 프로젝트
const PROJECT_EASY = 'easy';               // ✅ 특이 케이스: 최저 난이도 프로젝트


// ----------------------------------------------------
//                      MAIN SEEDING FUNCTION
// ----------------------------------------------------

async function main() {
  console.log('🌱 시딩 스크립트 시작...');

  // 🗑️ 기존 데이터 초기화 (안전한 시딩을 위해)
  await prisma.application.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️ 기존 데이터 초기화 완료.');

  // --------------------------------------------------
  // A. USER 데이터 삽입 (기존 4명 + 특이 케이스 2명)
  // --------------------------------------------------
  console.log('✅ 1/4. User 데이터 생성 및 삽입...');

  const usersData = [
    {
      key: USER_OWNER,
      data: {
        supabaseUid: "supa_uid_1", authProvider: "github", email: "owner@example.com", name: "김철수", phone: "010-1111-1111", githubId: "chulsoo-kim", profileImageUrl: "https://avatars.githubusercontent.com/u/10001",
        techStacks: [TechStack.NESTJS, TechStack.NEXTJS, TechStack.TYPESCRIPT], positions: [Position.BACKEND, Position.FRONTEND],
        proficiency: Proficiency.GOLD,
        portfolio: { githubUrl: "https://github.com/chulsoo-kim" } as any,
      }
    },
    {
      key: USER_MEMBER,
      data: {
        supabaseUid: "supa_uid_2", authProvider: "google", email: "member@example.com", name: "이영희", phone: "010-2222-2222", githubId: "younghee-lee", profileImageUrl: "https://avatars.githubusercontent.com/u/10002",
        techStacks: [TechStack.REACT, TechStack.TYPESCRIPT], positions: [Position.FRONTEND],
        proficiency: Proficiency.SILVER,
        portfolio: null,
      }
    },
    {
      key: USER_PENDING,
      data: {
        supabaseUid: "supa_uid_3", authProvider: "github", email: "applicant_pending@example.com", name: "박대기", phone: "010-3333-3333", githubId: "daegi-park", profileImageUrl: "https://avatars.githubusercontent.com/u/10003",
        techStacks: [TechStack.PYTHON, TechStack.DJANGO, TechStack.TENSORFLOW], positions: [Position.BACKEND, Position.AI],
        proficiency: Proficiency.GOLD,
        portfolio: { githubUrl: "https://github.com/daegi-park" } as any,
      }
    },
    {
      key: USER_REJECTED,
      data: {
        supabaseUid: "supa_uid_4", authProvider: "google", email: "applicant_rejected@example.com", name: "최거절", phone: "010-4444-4444", githubId: "rejected-choi", profileImageUrl: null,
        techStacks: [TechStack.JAVA, TechStack.SPRING], positions: [Position.BACKEND],
        proficiency: Proficiency.BRONZE,
        portfolio: null,
      }
    },
    {
      key: USER_NO_INFO, // ✅ 특이 케이스: 최소 정보 사용자
      data: {
        supabaseUid: "supa_uid_5", authProvider: "email", email: "noinfo@example.com", name: "최소정보", phone: "010-5555-5555",
        githubId: null, profileImageUrl: null, portfolio: null,
        techStacks: [], positions: [],
        proficiency: Proficiency.BRONZE,
      }
    },
    {
      key: USER_MAX_PROF, // ✅ 특이 케이스: 최고 숙련도 사용자
      data: {
        supabaseUid: "supa_uid_6", authProvider: "google", email: "platinum@example.com", name: "최고수", phone: "010-6666-6666", githubId: "platinum-dev", profileImageUrl: "https://avatars.githubusercontent.com/u/99999",
        techStacks: [TechStack.GO, TechStack.KOTLIN, TechStack.RUST], positions: [Position.BACKEND, Position.MOBILE],
        proficiency: Proficiency.PLATINUM,
        portfolio: { url: "https://platinum.dev" } as any,
      }
    },
  ];

  for (const { key, data } of usersData) {
    const id = uuidv7();
    const user = await prisma.user.create({ data: { id, ...data } });
    idMap.users[key] = user.id;
  }
  console.log(`> 총 ${usersData.length}명의 사용자 생성 완료.`);

  // --------------------------------------------------
  // B. PROJECT 데이터 삽입 (기존 4개 + 특이 케이스 3개)
  // --------------------------------------------------
  console.log('✅ 2/4. Project 데이터 생성 및 삽입...');

  const projectsData = [
    // 1. DevConnect (기본)
    {
      key: PROJECT_DEVCONNECT,
      data: {
        name: "DevConnect 개발자 커뮤니티 플랫폼",
        description: "개발자들을 위한 프로젝트 매칭 및 지식 공유 커뮤니티 플랫폼을 Next.js와 NestJS로 구축합니다.",
        difficulty: Difficulty.ADVANCED, isOpen: true,
        recruitmentStartDate: new Date("2025-11-01T00:00:00Z"), recruitmentEndDate: new Date("2025-11-30T00:00:00Z"),
        projectStartDate: new Date("2025-12-01T00:00:00Z"), projectEndDate: new Date("2026-06-30T00:00:00Z"),
        githubRepoUrl: "https://github.com/dev-connect/platform",
        limitBE: 3, limitFE: 3, limitPM: 1, limitMobile: 0, limitAI: 0,
        minProficiency: Proficiency.SILVER, maxProficiency: Proficiency.PLATINUM,
        ownerId: idMap.users[USER_OWNER],
      }
    },
    // 2. Diary (기본)
    {
      key: PROJECT_DIARY,
      data: {
        name: "Flutter 기반 개인 일기 앱 'Diary'",
        description: "사용자가 감정을 기록하고 분석할 수 있는 모바일 일기 앱을 Flutter로 개발합니다.",
        difficulty: Difficulty.INTERMEDIATE, isOpen: false,
        recruitmentStartDate: new Date("2025-09-01T00:00:00Z"), recruitmentEndDate: new Date("2025-09-30T00:00:00Z"),
        projectStartDate: new Date("2025-10-01T00:00:00Z"), projectEndDate: new Date("2026-01-30T00:00:00Z"),
        githubRepoUrl: "https://github.com/flutter-team/diary-app",
        limitBE: 1, limitFE: 0, limitPM: 1, limitMobile: 2, limitAI: 0,
        minProficiency: Proficiency.BRONZE, maxProficiency: Proficiency.GOLD,
        ownerId: idMap.users[USER_MEMBER],
      }
    },
    // 3. WriteWise (기본)
    {
      key: PROJECT_WRITEWISE,
      data: {
        name: "AI 기반 필사 연습 서비스 'WriteWise'",
        description: "AI가 문장 교정과 필사 난이도를 자동 추천해주는 웹 기반 필사 연습 플랫폼입니다.",
        difficulty: Difficulty.INTERMEDIATE, isOpen: true,
        recruitmentStartDate: new Date("2025-11-12T00:00:00Z"), recruitmentEndDate: new Date("2025-12-05T00:00:00Z"),
        projectStartDate: new Date("2025-12-10T00:00:00Z"), projectEndDate: new Date("2026-03-15T00:00:00Z"),
        githubRepoUrl: "https://github.com/jiyun-park/writewise",
        limitBE: 2, limitFE: 2, limitPM: 1, limitMobile: 0, limitAI: 1,
        minProficiency: Proficiency.SILVER, maxProficiency: Proficiency.GOLD,
        ownerId: idMap.users[USER_PENDING],
      }
    },
    // 4. FitBuddy (기본)
    {
      key: PROJECT_FITBUDDY,
      data: {
        name: "React Native 헬스케어 앱 'FitBuddy'",
        description: "개인의 운동 데이터를 기반으로 맞춤 트레이닝 루틴을 제공하는 헬스케어 모바일 앱입니다.",
        difficulty: Difficulty.ADVANCED, isOpen: true,
        recruitmentStartDate: new Date("2025-11-20T00:00:00Z"), recruitmentEndDate: new Date("2025-12-25T00:00:00Z"),
        projectStartDate: new Date("2025-12-30T00:00:00Z"), projectEndDate: new Date("2026-04-30T00:00:00Z"),
        githubRepoUrl: "https://github.com/health-lab/fitbuddy",
        limitBE: 2, limitFE: 1, limitPM: 1, limitMobile: 2, limitAI: 1,
        minProficiency: Proficiency.GOLD, maxProficiency: Proficiency.PLATINUM,
        ownerId: idMap.users[USER_REJECTED],
      }
    },
    // 5. CLOSED (✅ 특이 케이스: 모집 마감)
    {
      key: PROJECT_CLOSED,
      data: {
        name: "모집 마감된 미니 서비스 'Archive'",
        description: "이미 모집 기간이 종료되어 더 이상 지원할 수 없는 간단한 웹 아카이빙 서비스.",
        difficulty: Difficulty.BEGINNER,
        isOpen: false,
        recruitmentStartDate: new Date("2025-01-01T00:00:00Z"),
        recruitmentEndDate: new Date("2025-01-31T00:00:00Z"), // 이미 종료된 날짜
        projectStartDate: new Date("2025-02-01T00:00:00Z"), projectEndDate: new Date("2025-03-01T00:00:00Z"),
        githubRepoUrl: "https://github.com/archive/miniservice",
        limitBE: 1, limitFE: 1, limitPM: 0, limitMobile: 0, limitAI: 0,
        minProficiency: Proficiency.BRONZE, maxProficiency: Proficiency.SILVER,
        ownerId: idMap.users[USER_NO_INFO], // 최소정보 사용자 오너
      }
    },
    // 6. IMMEDIATE (✅ 특이 케이스: 오늘 시작)
    {
      key: PROJECT_IMMEDIATE,
      data: {
        name: "오늘 시작하는 긴급 프로젝트 'HotFix'",
        description: "단기적으로 긴급하게 백엔드 및 DevOps 인력을 모집하는 프로젝트.",
        difficulty: Difficulty.ADVANCED, isOpen: true,
        recruitmentStartDate: new Date(Date.now() - 86400000), // 어제 시작
        recruitmentEndDate: new Date(Date.now() + 86400000 * 7), // 일주일 후 마감
        projectStartDate: new Date(), // **오늘 날짜**
        projectEndDate: new Date(Date.now() + 86400000 * 30), // 한 달 후 종료
        githubRepoUrl: "https://github.com/urgent/hotfix",
        limitBE: 2, limitFE: 0, limitPM: 0, limitMobile: 0, limitAI: 0,
        minProficiency: Proficiency.GOLD, maxProficiency: Proficiency.PLATINUM,
        ownerId: idMap.users[USER_MAX_PROF], // 최고수 사용자 오너
      }
    },
    // 7. EASY (✅ 특이 케이스: 최저 난이도/숙련도)
    {
      key: PROJECT_EASY,
      data: {
        name: "초보자를 위한 가이드 프로젝트 'HelloDev'",
        description: "프로젝트 경험이 없는 초보자를 위한 간단한 웹 페이지 제작 가이드 프로젝트.",
        difficulty: Difficulty.BEGINNER, isOpen: true,
        recruitmentStartDate: new Date("2025-11-01T00:00:00Z"), recruitmentEndDate: new Date("2026-01-01T00:00:00Z"),
        projectStartDate: new Date("2026-01-05T00:00:00Z"), projectEndDate: new Date("2026-03-05T00:00:00Z"),
        githubRepoUrl: "https://github.com/guide/hellodev",
        limitBE: 1, limitFE: 2, limitPM: 0, limitMobile: 0, limitAI: 0,
        minProficiency: Proficiency.BRONZE, maxProficiency: Proficiency.BRONZE,
        ownerId: idMap.users[USER_OWNER],
      }
    },
  ];

  for (const { key, data } of projectsData) {
    const id = uuidv7();
    const project = await prisma.project.create({ data: { id, ...data } });
    idMap.projects[key] = project.id;
  }
  console.log(`> 총 ${projectsData.length}개의 프로젝트 생성 완료.`);

  // --------------------------------------------------
  // C. PROJECTMEMBER 데이터 삽입
  // --------------------------------------------------
  console.log('✅ 3/4. ProjectMember 데이터 생성 및 삽입...');

  await prisma.projectMember.create({
    data: {
      userId: idMap.users[USER_MEMBER],
      projectId: idMap.projects[PROJECT_DEVCONNECT],
      role: [Position.FRONTEND],
      joinedAt: new Date("2025-11-15T14:00:00Z")
    }
  });
  console.log(`> 1개의 프로젝트 멤버 생성 완료.`);

  // --------------------------------------------------
  // D. APPLICATION 데이터 삽입 (기존 2개 + 특이 케이스 3개)
  // --------------------------------------------------
  console.log('✅ 4/4. Application 데이터 생성 및 삽입...');

  await prisma.application.createMany({
    data: [
      // 1. PENDING (기존)
      {
        userId: idMap.users[USER_PENDING],
        projectId: idMap.projects[PROJECT_WRITEWISE],
        appliedPosition: [Position.FRONTEND] as any,
        status: ApplicationStatus.PENDING,
        coverLetter:"안녕하세요, 박대기입니다. Next.js 기반 프론트엔드 경험이 있으며 WriteWise 서비스 UI/UX에 관심이 많습니다."
      },
      // 2. REJECTED (기존)
      {
        userId: idMap.users[USER_REJECTED],
        projectId: idMap.projects[PROJECT_FITBUDDY],
        appliedPosition: [Position.BACKEND] as any,
        status: ApplicationStatus.REJECTED,
        coverLetter: "안녕하세요, 최거절입니다. Spring/Java를 이용한 백엔드 개발에 참여하고 싶습니다."
      },
      // 3. REJECTED (✅ 특이 케이스: 모집 마감 프로젝트에 지원 -> 거절)
      {
        userId: idMap.users[USER_NO_INFO],
        projectId: idMap.projects[PROJECT_CLOSED],
        appliedPosition: [Position.BACKEND] as any,
        status: ApplicationStatus.REJECTED,
        coverLetter: "기간이 지난 프로젝트에 실수로 지원함."
      },
      // 4. ACCEPTED (✅ 특이 케이스: 숙련도가 너무 높은 사용자가 쉬운 프로젝트에 수락됨)
      {
        userId: idMap.users[USER_MAX_PROF],
        projectId: idMap.projects[PROJECT_EASY],
        appliedPosition: [Position.FRONTEND, Position.BACKEND] as any, // 2개 포지션에 지원
        status: ApplicationStatus.ACCEPTED,
        coverLetter: "브론즈 프로젝트이지만 초보자들을 돕기 위해 참여합니다."
      },
      // 5. PENDING (✅ 특이 케이스: 오너가 다른 긴급 프로젝트에 지원)
      {
        userId: idMap.users[USER_OWNER],
        projectId: idMap.projects[PROJECT_IMMEDIATE],
        appliedPosition: [Position.BACKEND] as any,
        status: ApplicationStatus.PENDING,
        coverLetter: "긴급 프로젝트에 백엔드 인력으로 지원합니다."
      },

    ]
  });
  console.log(`> 총 5개의 지원서 생성 완료.`);

  console.log('🎉 시딩 스크립트 완료!');
}

// --- 4. 에러 처리 및 종료 로직 ---
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });