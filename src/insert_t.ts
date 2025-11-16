// --- 1. 필수 라이브러리 및 모듈 임포트 ---
import { PrismaClient, Proficiency, Position, TechStack, Difficulty, ApplicationStatus } from '@prisma/client';
// uuid 라이브러리에서 v7 함수를 임포트한다고 가정
import { v7 as uuidv7 } from 'uuid'; 

const prisma = new PrismaClient();

// --- 2. ID 맵 정의 (관계 연결을 위해 실제 생성된 UUID를 저장할 객체) ---
// 이전 목데이터의 가상 ID를 키로, 실제 DB에 삽입된 UUID를 값으로 저장합니다.
const idMap: {
  users: Record<string, string>;
  projects: Record<string, string>;
} = {
  users: {},
  projects: {},
};

// --- 3. Mock Data 정의 (관계 ID 대신 가상의 키 사용) ---
// 이 키들은 실제 UUID가 아닌, 스크립트 내에서 관계를 맺어주기 위한 식별자입니다.
const USER_OWNER = 'chulsoo';
const USER_MEMBER = 'younghee';
const USER_PENDING = 'daegi';
const USER_REJECTED = 'geojul';

const PROJECT_DEVCONNECT = 'devconnect';
const PROJECT_DIARY = 'diary';


// ----------------------------------------------------
//                    MAIN SEEDING FUNCTION
// ----------------------------------------------------

async function main() {
  console.log('🌱 시딩 스크립트 시작...');

  // --------------------------------------------------
  // A. USER 데이터 삽입
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
  ];

  for (const { key, data } of usersData) {
    const id = uuidv7(); // UUID v7 생성
    const user = await prisma.user.create({ data: { id, ...data } });
    idMap.users[key] = user.id; // 생성된 실제 ID를 맵에 저장
  }
  console.log(`> 총 ${usersData.length}명의 사용자 생성 완료.`);

  // --------------------------------------------------
  // B. PROJECT 데이터 삽입
  // --------------------------------------------------
  console.log('✅ 2/4. Project 데이터 생성 및 삽입...');

  const projectsData = [
    {
      key: PROJECT_DEVCONNECT,
      data: {
        name: "개발자 매칭 플랫폼 'DevConnect'", description: "NestJS와 Next.js를 이용한 사이드 프로젝트 매칭 서비스입니다.",
        difficulty: Difficulty.INTERMEDIATE, isOpen: true,
        recruitmentStartDate: new Date("2025-11-10T00:00:00Z"), recruitmentEndDate: new Date("2025-11-30T00:00:00Z"),
        projectStartDate: new Date("2025-12-01T00:00:00Z"), projectEndDate: new Date("2026-02-28T00:00:00Z"),
        githubRepoUrl: "https://github.com/chulsoo-kim/devconnect",
        limitBE: 2, limitFE: 2, limitPM: 1, limitMobile: 0, limitAI: 0,
        minProficiency: Proficiency.SILVER, maxProficiency: Proficiency.GOLD,
        ownerId: idMap.users[USER_OWNER], // User 1 (김철수) ID 연결
      }
    },
    {
      key: PROJECT_DIARY,
      data: {
        name: "Flutter 감성 다이어리 앱", description: "Flutter와 Firebase를 이용한 모바일 다이어리 앱 프로젝트입니다.",
        difficulty: Difficulty.BEGINNER, isOpen: true,
        recruitmentStartDate: new Date("2025-11-15T00:00:00Z"), recruitmentEndDate: new Date("2025-12-15T00:00:00Z"),
        projectStartDate: new Date("2025-12-20T00:00:00Z"), projectEndDate: new Date("2026-03-31T00:00:00Z"),
        githubRepoUrl: null,
        limitBE: 1, limitFE: 0, limitPM: 0, limitMobile: 2, limitAI: 0,
        minProficiency: Proficiency.BRONZE, maxProficiency: Proficiency.UNKNOWN,
        ownerId: idMap.users[USER_MEMBER], // User 2 (이영희) ID 연결
      }
    }
  ];

  for (const { key, data } of projectsData) {
    const id = uuidv7(); // UUID v7 생성
    const project = await prisma.project.create({ data: { id, ...data } });
    idMap.projects[key] = project.id; // 생성된 실제 ID를 맵에 저장
  }
  console.log(`> 총 ${projectsData.length}개의 프로젝트 생성 완료.`);

  // --------------------------------------------------
  // C. PROJECTMEMBER 데이터 삽입
  // --------------------------------------------------
  console.log('✅ 3/4. ProjectMember 데이터 생성 및 삽입...');

  await prisma.projectMember.create({
    data: {
      userId: idMap.users[USER_MEMBER],   // 이영희(User 2)
      projectId: idMap.projects[PROJECT_DEVCONNECT], // DevConnect (Project 1)
      role: [Position.FRONTEND],
      joinedAt: new Date("2025-11-15T14:00:00Z")
    }
  });
  console.log(`> 1개의 프로젝트 멤버 생성 완료.`);

  // --------------------------------------------------
  // D. APPLICATION 데이터 삽입
  // --------------------------------------------------
  console.log('✅ 4/4. Application 데이터 생성 및 삽입...');

  await prisma.application.createMany({
    data: [
      {
        // 박대기(User 3) -> DevConnect (Pending)
        userId: idMap.users[USER_PENDING],
        projectId: idMap.projects[PROJECT_DEVCONNECT],
        appliedPosition: ['BACKEND', 'AI'] as any,
        status: ApplicationStatus.PENDING,
        coverLetter: "안녕하세요, 박대기입니다. 백엔드 및 AI 포지션에 지원합니다."
      },
      {
        // 최거절(User 4) -> DevConnect (Rejected)
        userId: idMap.users[USER_REJECTED],
        projectId: idMap.projects[PROJECT_DEVCONNECT],
        appliedPosition: ['BACKEND'] as any,
        status: ApplicationStatus.REJECTED,
        coverLetter: "10년차 스프링 개발자입니다. 백엔드 지원합니다."
      }
    ]
  });
  console.log(`> 2개의 지원서 생성 완료.`);

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