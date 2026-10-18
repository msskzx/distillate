import fs from "fs";
import { buildIndex, readRecordSources } from "../lib/records";

fs.writeFileSync("records.json", buildIndex(readRecordSources()));
console.log("records.json written");
