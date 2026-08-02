import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";


console.log(process.env.DATABASE_URL);


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});


const prisma = new PrismaClient({
  adapter,
});


async function main() {

  const users = await prisma.user.findMany();

  console.log("Database connected ✅");

  console.log(users);

}


main()
.catch(console.error)
.finally(async () => {
  await prisma.$disconnect();
});