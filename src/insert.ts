import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding from input.json...');

  const inputPath = path.join(__dirname, 'input.json');
  const inputFile = fs.readFileSync(inputPath, 'utf-8');
  const data = JSON.parse(inputFile);

  // --- User Data ---
  if (data.users && data.users.length > 0) {
    console.log('Seeding users...');
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
            ...user,
            portfolio: user.portfolio || undefined,
        },
        create: {
            ...user,
            portfolio: user.portfolio || undefined,
        },
      });
    }
    console.log(`${data.users.length} users seeded.`);
  }

  // --- Project Data ---
  if (data.projects && data.projects.length > 0) {
    console.log('Seeding projects...');
    for (const project of data.projects) {
      await prisma.project.upsert({
        where: { id: project.id },
        update: {
            ...project,
            recruitmentStartDate: project.recruitmentStartDate ? new Date(project.recruitmentStartDate) : null,
            recruitmentEndDate: project.recruitmentEndDate ? new Date(project.recruitmentEndDate) : null,
            projectStartDate: new Date(project.projectStartDate),
            projectEndDate: new Date(project.projectEndDate),
        },
        create: {
            ...project,
            recruitmentStartDate: project.recruitmentStartDate ? new Date(project.recruitmentStartDate) : null,
            recruitmentEndDate: project.recruitmentEndDate ? new Date(project.recruitmentEndDate) : null,
            projectStartDate: new Date(project.projectStartDate),
            projectEndDate: new Date(project.projectEndDate),
        },
      });
    }
    console.log(`${data.projects.length} projects seeded.`);
  }

  // --- ProjectMember Data ---
  if (data.projectMembers && data.projectMembers.length > 0) {
    console.log('Seeding project members...');
    for (const member of data.projectMembers) {
      await prisma.projectMember.upsert({
        where: { id: member.id },
        update: member,
        create: member,
      });
    }
    console.log(`${data.projectMembers.length} project members seeded.`);
  }

  // --- Application Data ---
  if (data.applications && data.applications.length > 0) {
    console.log('Seeding applications...');
    for (const app of data.applications) {
      await prisma.application.upsert({
        where: { userId_projectId: { userId: app.userId, projectId: app.projectId } },
        update: app,
        create: app,
      });
    }
    console.log(`${data.applications.length} applications seeded.`);
  }

  console.log('Seeding from input.json finished.');
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
