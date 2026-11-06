import { handleError, ok, readJson } from "@/lib/http";
import { updateProfileSchema } from "@/lib/validation";
import { deleteProfile, updateProfile } from "@/server/profiles";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const input = updateProfileSchema.parse(await readJson(request));
    return ok({ profile: await updateProfile(id, input) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    await deleteProfile(id);
    return ok({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
