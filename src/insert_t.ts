// --- 1. 필수 라이브러리 및 모듈 임포트 ---
import { PrismaClient, Proficiency, Position, TechStack, Difficulty, ApplicationStatus } from '@prisma/client';
import { v7 as uuidv7 } from 'uuid'; // UUID v7 함수 임포트 가정

const prisma = new PrismaClient();

// --- 2. ID 맵 정의 ---
const idMap: {
  users: Record<string, string>;
  projects: Record<string, string>;
} = {
  users: {},
  projects: {},
};

// --- 3. Mock Data 정의 (가상의 키) ---
// 제공된 4개의 데이터와 매핑
const USER_OWNER = 'chulsoo';     // idx: 0, 김철수
const USER_MEMBER = 'younghee';   // idx: 1, 이영희 (멤버로 참여)
const USER_PENDING = 'daegi';     // idx: 2, 박대기 (지원자 - 대기)
const USER_REJECTED = 'geojul';   // idx: 3, 최거절 (지원자 - 거절)

const PROJECT_DEVCONNECT = 'devconnect'; 

// ----------------------------------------------------
//                      MAIN SEEDING FUNCTION
// ----------------------------------------------------

async function main() {
  console.log('🌱 시딩 스크립트 시작 (최소 구성)...');

  // 🗑️ 기존 데이터 초기화 (안전한 시딩을 위해)
  await prisma.application.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️ 기존 데이터 초기화 완료.');

  // --------------------------------------------------
  // A. USER 데이터 삽입 (제공된 4개 데이터)
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
    const id = uuidv7();
    const user = await prisma.user.create({ data: { id, ...data } });
    idMap.users[key] = user.id;
  }
  console.log(`> 총 ${usersData.length}명의 사용자 생성 완료.`);

  // --------------------------------------------------
  // B. PROJECT 데이터 삽입 (DevConnect 프로젝트 1개)
  // --------------------------------------------------
  console.log('✅ 2/4. Project 데이터 생성 및 삽입...');

  const projectsData = [
    {
      key: PROJECT_DEVCONNECT,
      data: {
        name: "DevConnect 개발자 커뮤니티 플랫폼",
        description: "Next.js와 NestJS로 구축하는 개발자 프로젝트 매칭 플랫폼.",
        difficulty: Difficulty.ADVANCED, isOpen: true,
        recruitmentStartDate: new Date("2025-11-01T00:00:00Z"), recruitmentEndDate: new Date("2025-11-30T00:00:00Z"),
        projectStartDate: new Date("2025-12-01T00:00:00Z"), projectEndDate: new Date("2026-06-30T00:00:00Z"),
        githubRepoUrl: "https://github.com/dev-connect/platform",
        limitBE: 3, limitFE: 3, limitPM: 1, limitMobile: 0, limitAI: 0,
        minProficiency: Proficiency.SILVER, maxProficiency: Proficiency.PLATINUM,
        ownerId: idMap.users[USER_OWNER], // 김철수 (OWNER)
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
      userId: idMap.users[USER_MEMBER],   // 이영희 (MEMBER)
      projectId: idMap.projects[PROJECT_DEVCONNECT],
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
        userId: idMap.users[USER_PENDING],  // 박대기 (PENDING)
        projectId: idMap.projects[PROJECT_DEVCONNECT],
        appliedPosition: [Position.BACKEND] as any,
        status: ApplicationStatus.PENDING,
        coverLetter:"DevConnect 프로젝트의 백엔드 포지션에 지원합니다."
      },
      {
        userId: idMap.users[USER_REJECTED], // 최거절 (REJECTED)
        projectId: idMap.projects[PROJECT_DEVCONNECT],
        appliedPosition: [Position.BACKEND] as any,
        status: ApplicationStatus.REJECTED,
        coverLetter: "Spring 경험을 바탕으로 기여하고 싶었으나, 거절되었습니다."
      },
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