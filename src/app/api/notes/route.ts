import { handleError, ok, readJson } from "@/lib/http";
import { saveNoteSchema } from "@/lib/validation";
import { saveNote } from "@/server/counts";

/** PUT /api/notes  { profileId, date, note }  — empty note clears it. */
export async function PUT(request: Request) {
  try {
    const input = saveNoteSchema.parse(await readJson(request));
    return ok({ count: await saveNote(input) });
  } catch (error) {
    return handleError(error);
  }
}
