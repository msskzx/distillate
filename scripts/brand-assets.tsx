import fs from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { Logo } from "../components/Logo";

const directory = new URL("../public/brand/", import.meta.url);
await fs.mkdir(directory, { recursive: true });
const light = renderToStaticMarkup(<Logo ink="#2e2219" accent="#9c3b22" />);
const dark = renderToStaticMarkup(<Logo ink="#ece2cd" accent="#e3906f" />);
const adaptive = renderToStaticMarkup(<Logo />).replace(
  ">",
  "><style>svg{--ink:#2e2219;--accent:#9c3b22}@media(prefers-color-scheme:dark){svg{--ink:#ece2cd;--accent:#e3906f}}</style>",
);
for (const [name, svg] of [["light", light], ["dark", dark]] as const) {
  await fs.writeFile(new URL(`logo-${name}.svg`, directory), svg);
  for (const size of [192, 512]) {
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(new URL(`logo-${name}-${size}.png`, directory).pathname);
  }
}
await fs.writeFile(new URL("../app/icon.svg", import.meta.url), adaptive);
await sharp(Buffer.from(light)).resize(512, 512).png().toFile(new URL("../public/logo.png", import.meta.url).pathname);
await sharp(Buffer.from(light)).resize(180, 180).png().toFile(new URL("../app/apple-icon.png", import.meta.url).pathname);
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => sharp(Buffer.from(light)).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + i * 16;
  header[entry] = size;
  header[entry + 1] = size;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
await fs.writeFile(new URL("../app/favicon.ico", import.meta.url), Buffer.concat([header, ...images]));
