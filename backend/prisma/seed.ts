import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const names = ["Textbooks", "Calculators", "Electronics", "Furniture", "Stationery", "Other"];
  for (const name of names) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  await prisma.user.upsert({
    where: { email: "admin@campus.edu" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@campus.edu",
      password: await bcrypt.hash("Admin@123", 10),
      role: "ADMIN",
    },
  });
  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());