import { recordIndex } from "@/lib/recordIndex";
import { queryFrom, searchRecords } from "@/lib/search";

export function GET(request: Request) {
  const records = searchRecords(recordIndex, queryFrom(new URL(request.url).searchParams));
  return Response.json({ records }, { headers: { "Access-Control-Allow-Origin": "*" } });
}
