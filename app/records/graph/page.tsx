import Link from "next/link";
import { Suspense } from "react";
import { Article } from "@/components/lesson/Article";
import { RecordGraph } from "@/components/records/RecordGraph";
import { RecordSearch } from "@/components/records/RecordSearch";
import { recordIndex } from "@/lib/recordIndex";

export const metadata = { title: "Record graph" };

export default function RecordGraphPage() {
  return (
    <Article
      strip={[{ label: "Records" }, { label: "Relationships", marked: true }]}
      title="Record relationships"
      lead="Explore how decisions and approaches build on earlier work or try a variant. Search highlights matching records while keeping their connections in view."
    >
      <p><Link href="/records">← Search records as a list</Link></p>
      <Suspense fallback={<div className="not-prose"><RecordGraph records={recordIndex} matches={recordIndex} /></div>}>
        <RecordSearch records={recordIndex} graph />
      </Suspense>
    </Article>
  );
}
