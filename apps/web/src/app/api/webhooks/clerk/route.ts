// Clerk webhooks have been removed. Auth is now handled by NextAuth.
export async function POST() {
  return new Response("Not found", { status: 404 });
}
