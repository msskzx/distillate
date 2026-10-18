import { Suspense } from "react";
import { Article } from "@/components/lesson/Article";
import { RecordSearch } from "@/components/records/RecordSearch";
import { recordIndex } from "@/lib/recordIndex";

export const metadata = { title: "Records" };

export default function RecordsPage() {
  return (
    <Article
      eyebrow="Records"
      title="Records"
      lead="Challenges, obstacles and detours met during work, each with its outcome, the conditions it held under and its evidence. Agents search the same records through /api/records."
    >
      <Suspense>
        <RecordSearch records={recordIndex} />
      </Suspense>
    </Article>
  );
}
