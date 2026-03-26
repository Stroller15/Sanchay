import { prisma } from "./index";

async function main() {
  console.info("Seeding database...");

  // Add seed data here
  // Example:
  // await prisma.user.upsert({
  //   where: { email: "seed@example.com" },
  //   update: {},
  //   create: {
  //     clerkId: "seed_clerk_id",
  //     email: "seed@example.com",
  //     name: "Seed User",
  //   },
  // });

  console.info("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
