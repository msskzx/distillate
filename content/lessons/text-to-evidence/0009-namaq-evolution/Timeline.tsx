type Milestone = {
  date: string;
  title: string;
  change: string;
  commits: string[];
};

const milestones: Milestone[] = [
  {
    date: "12–13 July 2025",
    title: "A bilingual learning portal takes shape",
    change:
      "The first goal was broad: a homepage, navigation, translation, Arabic learning, articles, categories, data fetching, privacy and analytics.",
    commits: [
      "1f017b89 · init project, added homepage, navbar, footer, translation",
      "ceeaad73 · feat: add SWR data fetching and Prisma database setup",
    ],
  },
  {
    date: "14–22 July 2025",
    title: "People become the organizing unit",
    change:
      "People, relations, titles, battles and articles arrive, followed by Qur’an, hadith, poems and special-topic pages. RTL and theming become product concerns.",
    commits: [
      "ca47a34d · feat: added person table, relations, people pages, routes, adjusted seed, translations, rtl",
      "6eb1ce73 · feat: added quran pages which consume api, added hadtih, poems pages…",
    ],
  },
  {
    date: "23–31 July 2025",
    title: "History becomes visual and navigable",
    change:
      "Personal and battle timelines expand to the homepage; battles gain maps, events gain their own pages, and the homepage receives a stronger hero and navigation.",
    commits: [
      "1aaa7d42 · feat: added timeline, battle timeline for person",
      "7d00be3c · feat: show battles on google maps",
    ],
  },
  {
    date: "2–15 August 2025",
    title: "The relationship graph becomes the main interaction",
    change:
      "Neo4j and a directed graph grow into connected-component exploration, ancestor queries, typeahead search, filters, pills, pan and zoom.",
    commits: [
      "d2727dfa · feat: added neo4j with auradb",
      "bcda6c86 · feat: show person connected component up to 3 hops…",
    ],
  },
  {
    date: "18–30 August 2025",
    title: "The catalogue sprawls, then hints at consolidation",
    change:
      "Books, charities, Arabic pages and a history page broaden the library, while Neo4j replaces the relational people-relations table and the old graph canvas is removed.",
    commits: [
      "1963ceaa · feat: books table… removed people relations table (using neo4j only)",
      "a8879c1e · feat: added history page, still have to improve it",
    ],
  },
  {
    date: "1 January 2026",
    title: "The scope narrows",
    change:
      "A plainly named scope-narrowing change resets the direction. The next visible wave concentrates on people, graphs, provenance and learning loops.",
    commits: [
      "e9dda7ca · narrow down scope",
      "8619ba7f · feat: homepage update after scope narrow down",
    ],
  },
  {
    date: "8–18 August 2026",
    title: "Trust moves into the data pipeline",
    change:
      "Canonical people validation, sync, tests and provenance schemas turn historical sources and claim evidence into first-class infrastructure.",
    commits: [
      "8852747e · feat(pipeline): add canonical people data validation, sync pipeline, tests, and documentation",
      "ab441fc6 · feat(provenance): add historical sources, claim evidence schemas, APIs, and profile UI",
    ],
  },
  {
    date: "21–31 August 2026",
    title: "Separate graphs become one historical network",
    change:
      "People, titles, events and battles are synced into Neo4j, ranked and laid out together; graph routes and APIs converge on one full-network view.",
    commits: [
      "17a09e06 · feat(graph): add /graphs/people and combine /graphs into one full-network view",
      "7a1c4f2c · feat(graph): unify graph API across all types and fix node collision",
    ],
  },
  {
    date: "7–10 September 2026",
    title: "The graph turns into an exploration workspace",
    change:
      "A shared relationship model, stable precomputed layout, branch-aware expansion and a viewport workspace make exploration persistent and intentional.",
    commits: [
      "384adf16 · feat(graph): add viewport workspace shell for /graphs",
      "a3864431 · feat(graph): wire the exploration model into GraphCanvas, stabilize node layout",
    ],
  },
  {
    date: "9–19 September 2026",
    title: "Evidence separates from profiles",
    change:
      "Historical evidence is modeled independently, authored in batches and projected into a validated catalog. Claims must support current values, not merely decorate profiles.",
    commits: [
      "b77167cc · feat(data): model historical evidence independently of profiles",
      "6ac149d8 · feat(history): a claim must back a value the model holds today",
    ],
  },
  {
    date: "24–30 September 2026",
    title: "Source reading becomes a production workflow",
    change:
      "The source-book reader is rebuilt, dozens of Siyar entries are extracted, old seed layers retire, and a page store plus ordered book index replace copied per-person text.",
    commits: [
      "094d4691 · feat(reader): rebuild the source book reader",
      "106c69da · feat(history): source manifest + page store (steps 1–2 of the migration) (#220)",
    ],
  },
  {
    date: "27–28 September 2026",
    title: "The knowledge base becomes a quiz",
    change:
      "A question generator, solo assembly, multi-topic UI and a reviewed question bank turn the catalog into an active recall experience.",
    commits: [
      "92e086cb · feat(quiz): add the question-generation engine (#131)",
      "ad7455e7 · feat(quiz): add reviewed question bank (#137)",
    ],
  },
  {
    date: "4–9 October 2026",
    title: "A reviewed, quote-anchored model emerges",
    change:
      "Spans, records, reviews, revisions and approved inference support profiles, scenes, isnad chains, commentary links and hadith pages grounded in quoted text.",
    commits: [
      "6e198c68 · feat(model): match, resolve and render a span by quote (#310)",
      "089b06d6 · feat(model): review records, revisions, and the reviewed-only set for prod (#318)",
      "da735ea2 · feat(hadith): show the isnad as a diagram and switch between full text and bubbles (#344)",
    ],
  },
  {
    date: "9–16 October 2026",
    title: "Qur’an study becomes comparative and structural",
    change:
      "Side-by-side surahs, qira’at, ordering, openings, oaths, themes, prophet timelines, repetition matrices and a Madinah reader establish a dedicated exploration suite.",
    commits: [
      "cfc59392 · feat(quran): compare two surahs side by side, with a Quran navbar entry (#362)",
      "275d6fd3 · feat(quran): /quran/order and /quran/openings… (#372)",
    ],
  },
  {
    date: "18–20 October 2026",
    title: "Shared language grows into branch trees",
    change:
      "Shared openings and similar ayat move from lists to word trees, root-aware comparison and free-text quiz questions. The product adopts a bilingual, printed-book identity.",
    commits: [
      "adc74b34 · feat(quran): word tree of ayat that share their opening words (#398)",
      "ca7ff6a6 · feat(home): bilingual homepage, printed-book navbar and the Namaq logo (#405)",
      "46588195 · feat(branches): split tree nodes on every mark, next-ayah leaves, quiz leaf rule (#416)",
    ],
  },
  {
    date: "24–25 October 2026",
    title: "The Qur’an tools become one study environment",
    change:
      "Tuhfat al-Atfal adds a tajwid shelf; branch nodes gain context overlays and exact path controls; the 1441 Madinah mushaf arrives in its own Hafs font.",
    commits: [
      "39605667 · feat(quran): add Tuhfat al-Atfal under a new tajwid shelf (#426)",
      "e3c585c4 · feat(quran): read the 1441 Madinah mushaf… (#455)",
    ],
  },
  {
    date: "26–28 October 2026",
    title: "Recall becomes social and phone-first",
    change:
      "A Cloudflare Durable Object powers shared quiz rooms, synchronized reveal and leaderboards; the room UI is reshaped around phones, timers and waiting states.",
    commits: [
      "abbb9474 · feat(quiz): party quiz on a Cloudflare Durable Object (#461)",
      "3d28b896 · feat(party): phone-first room… (#464)",
    ],
  },
  {
    date: "28 October 2026",
    title: "Namaq gains a wordless signature",
    change:
      "A calligraphic tree-and-nun icon carries the brand into navigation, browser and home-screen icons, manifests and Arabic link previews.",
    commits: ["fe46a914 · feat(brand): wordless Namaq icon and Arabic link previews (#467)"],
  },
  {
    date: "29 October 2026",
    title: "Branch trees become a unified, stable language map",
    change:
      "Phrase trees appear inside ayat, zoom passes ayah endings, controls converge and member trees share one inventory. The last two PRs keep overlapping trees together and render ayah boundaries without phrase boxes.",
    commits: [
      "b54b564d · feat(quran): add phrase trees inside ayat (#468)",
      "d12c527a · feat(quran): unify branch tree inventory (#472)",
      "6e91c82e · fix(quran): keep overlapping branch trees together (#473)",
      "1fb7958e · fix(quran): render ayah boundaries without phrase boxes (#474)",
    ],
  },
];

export function Timeline() {
  return (
    <ol className="not-prose relative m-0 list-none p-0 before:absolute before:inset-y-3 before:start-[0.42rem] before:w-px before:bg-rule sm:before:start-1/2">
      {milestones.map((milestone, index) => (
        <li
          key={`${milestone.date}-${milestone.title}`}
          className={`relative mb-5 ps-8 sm:w-1/2 sm:ps-0 ${index % 2 ? "sm:ms-auto sm:ps-8" : "sm:pe-8 sm:text-end"}`}
        >
          <span
            aria-hidden="true"
            className={`absolute top-4 size-3 rounded-full border-[3px] border-accent bg-paper outline outline-2 outline-paper ${index % 2 ? "start-[0.05rem] sm:-start-[0.35rem]" : "start-[0.05rem] sm:-end-[0.4rem] sm:start-auto"}`}
          />
          <div className="border-s-[3px] border-accent bg-paper-deep px-4 py-3 text-start sm:border-s-0 sm:border-t-[3px]">
            <p className="m-0 font-mono text-xs text-accent [font-variant-numeric:lining-nums_tabular-nums]">{milestone.date}</p>
            <h2 className="my-1 text-xl font-medium leading-tight text-ink">{milestone.title}</h2>
            <p className="m-0 text-base leading-relaxed text-ink-soft">{milestone.change}</p>
            <details className="mt-2 text-sm text-ink-soft">
              <summary className="text-ink">Commit messages</summary>
              <ul className="mt-2 space-y-1 border-t border-rule pt-2 font-mono text-xs leading-relaxed [font-variant-numeric:lining-nums_tabular-nums]">
                {milestone.commits.map((commit) => (
                  <li key={commit}>{commit}</li>
                ))}
              </ul>
            </details>
          </div>
        </li>
      ))}
    </ol>
  );
}
