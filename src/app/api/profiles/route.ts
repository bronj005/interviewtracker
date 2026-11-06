import { handleError, ok, readJson } from "@/lib/http";
import { createProfileSchema } from "@/lib/validation";
import { createProfile, listProfiles } from "@/server/profiles";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok({ profiles: await listProfiles() });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = createProfileSchema.parse(await readJson(request));
    return ok({ profile: await createProfile(input) }, 201);
  } catch (error) {
    return handleError(error);
  }
}
