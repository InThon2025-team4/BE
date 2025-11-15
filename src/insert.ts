import { PrismaClient, Proficiency, Difficulty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// 구 Proficiency 값을 새 값으로 매핑
const mapProficiency = (oldValue: string): Proficiency => {
  const proficiencyMap: Record<string, Proficiency> = {
    BEGINNER: Proficiency.BRONZE,
    INTERMEDIATE: Proficiency.GOLD,
    EXPERT: Proficiency.PLATINUM,
    BRONZE: Proficiency.BRONZE,
    SILVER: Proficiency.SILVER,
    GOLD: Proficiency.GOLD,
    PLATINUM: Proficiency.PLATINUM,
    DIAMOND: Proficiency.DIAMOND,
    UNKNOWN: Proficiency.UNKNOWN,
  };
  return proficiencyMap[oldValue] || Proficiency.UNKNOWN;
};

// Difficulty 매핑
const mapDifficulty = (value: string): Difficulty => {
  const difficultyMap: Record<string, Difficulty> = {
    BEGINNER: Difficulty.BEGINNER,
    INTERMEDIATE: Difficulty.INTERMEDIATE,
    ADVANCED: Difficulty.ADVANCED,
    UNKNOWN: Difficulty.UNKNOWN,
  };
  return difficultyMap[value] || Difficulty.UNKNOWN;
};

// isOpen 계산
const calculateIsOpen = (project: any): boolean => {
  const now = new Date();
  const recruitmentEnd = project.recruitmentEndDate ? new Date(project.recruitmentEndDate) : null;
  const projectStart = new Date(project.projectStartDate);

  if (recruitmentEnd && now > recruitmentEnd) {
    return false;
  }
  if (now >= projectStart) {
    return false;
  }
  return true;
};

// 딜레이 함수
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('Start seeding from input.json...');

  const inputPath = path.join(__dirname, 'input.json');
  const inputFile = fs.readFileSync(inputPath, 'utf-8');
  const data = JSON.parse(inputFile);

  // --- 1. User Data (먼저 삽입) ---
  if (data.User && data.User.length > 0) {
    console.log(`Seeding ${data.User.length} users...`);
    
    const transformedUsers = data.User.map((user: any) => ({
      id: user.id,
      supabaseUid: user.supabaseUid,
      authProvider: user.authProvider,
      email: user.email,
      name: user.name,
      phone: user.phone,
      githubId: user.githubId,
      profileImageUrl: user.profileImageUrl || null,
      proficiency: mapProficiency(user.proficiency || 'UNKNOWN'),
      portfolio: user.portfolio || null,
      techStacks: user.techStacks || [],
      positions: user.positions || [],
    }));

    try {
      await prisma.user.createMany({
        data: transformedUsers,
        skipDuplicates: true,
      });
      console.log(`✓ ${transformedUsers.length} users seeded.`);
    } catch (error) {
      console.error(`✗ Failed to seed users:`, error.message);
    }
  }

  await delay(100);

  // --- 2. Project Data (User 이후) ---
  if (data.Project && data.Project.length > 0) {
    console.log(`Seeding ${data.Project.length} projects...`);
    
    const transformedProjects = data.Project.map((project: any) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      difficulty: mapDifficulty(project.difficulty || 'UNKNOWN'),
      isOpen: calculateIsOpen(project),
      recruitmentStartDate: project.recruitmentStartDate ? new Date(project.recruitmentStartDate) : null,
      recruitmentEndDate: project.recruitmentEndDate ? new Date(project.recruitmentEndDate) : null,
      projectStartDate: new Date(project.projectStartDate),
      projectEndDate: new Date(project.projectEndDate),
      githubRepoUrl: project.githubRepoUrl || null,
      limitBE: project.limitBE || 0,
      limitFE: project.limitFE || 0,
      limitPM: project.limitPM || 0,
      limitMobile: project.limitMobile || 0,
      limitAI: project.limitAI || 0,
      minProficiency: mapProficiency(project.minProficiency || 'UNKNOWN'),
      maxProficiency: mapProficiency(project.maxProficiency || 'UNKNOWN'),
      ownerId: project.ownerId,
    }));

    try {
      await prisma.project.createMany({
        data: transformedProjects,
        skipDuplicates: true,
      });
      console.log(`✓ ${transformedProjects.length} projects seeded.`);
    } catch (error) {
      console.error(`✗ Failed to seed projects:`, error.message);
    }
  }

  await delay(100);

  // --- 3. ProjectMember Data (User, Project 이후) ---
  if (data.ProjectMember && data.ProjectMember.length > 0) {
    console.log(`Seeding ${data.ProjectMember.length} project members...`);
    
    const transformedMembers = data.ProjectMember.map((member: any) => ({
      id: member.id,
      userId: member.userId,
      projectId: member.projectId,
      role: member.role || [],
    }));

    try {
      await prisma.projectMember.createMany({
        data: transformedMembers,
        skipDuplicates: true,
      });
      console.log(`✓ ${transformedMembers.length} project members seeded.`);
    } catch (error) {
      console.error(`✗ Failed to seed project members:`, error.message);
    }
  }

  await delay(100);

  // --- 4. Application Data (User, Project 이후) ---
  if (data.Application && data.Application.length > 0) {
    console.log(`Seeding ${data.Application.length} applications...`);
    
    const transformedApplications = data.Application.map((app: any) => ({
      userId: app.userId,
      projectId: app.projectId,
      appliedPosition: app.appliedPosition || [],
      status: app.status || 'PENDING',
      coverLetter: app.coverLetter || null,
    }));

    try {
      await prisma.application.createMany({
        data: transformedApplications,
        skipDuplicates: true,
      });
      console.log(`✓ ${transformedApplications.length} applications seeded.`);
    } catch (error) {
      console.error(`✗ Failed to seed applications:`, error.message);
    }
  }

  console.log('✓ Seeding from input.json finished successfully.');
}

main()
  .catch((e) => {
    console.error('An error occurred during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
