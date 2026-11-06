import { handleError, ok, readJson } from "@/lib/http";
import { adjustCountSchema, countsRangeSchema } from "@/lib/validation";
import { adjustCount, listCounts } from "@/server/counts";

export const dynamic = "force-dynamic";

/** GET /api/counts?from=YYYY-MM-DD&to=YYYY-MM-DD */
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const { from, to } = countsRangeSchema.parse({
      from: params.get("from") ?? "",
      to: params.get("to") ?? "",
    });
    return ok({ counts: await listCounts(from, to) });
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/counts  { profileId, date, metric, delta } */
export async function POST(request: Request) {
  try {
    const input = adjustCountSchema.parse(await readJson(request));
    return ok({ count: await adjustCount(input) });
  } catch (error) {
    return handleError(error);
  }
}
