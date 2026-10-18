import { Suspense } from "react";
import { Article } from "@/components/lesson/Article";
import { RecordRows, RecordSearch } from "@/components/records/RecordSearch";
import { recordIndex } from "@/lib/recordIndex";

export const metadata = { title: "Records" };

export default function RecordsPage() {
  return (
    <Article
      strip={[{ label: "Records" }, { label: `${recordIndex.length} entries` }]}
      title="Records"
      lead="Challenges, obstacles and detours met during work, each with its outcome, the conditions it held under and its evidence. Agents search the same records through /api/records."
    >
      <Suspense fallback={<div className="not-prose"><RecordRows records={recordIndex} /></div>}>
        <RecordSearch records={recordIndex} />
      </Suspense>
    </Article>
  );
}
