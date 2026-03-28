const bcrypt = require("bcryptjs");
const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);

  await prisma.user.upsert({
    where: { email: "admin@primetrade.local" },
    update: {
      name: "Platform Admin",
      role: Role.ADMIN,
      passwordHash,
    },
    create: {
      name: "Platform Admin",
      email: "admin@primetrade.local",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log("Seeded admin user: admin@primetrade.local / Admin@123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
