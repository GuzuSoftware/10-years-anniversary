import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const assets = [
  '1.webp', '3.webp', '3b.webp', '5a.webp', '5b.webp',
  '2017 esküvő.webp', '2018 fotózás.webp', '2019 Balatonfüred.webp', '2020 Béke park.webp', '2021 Orfű.webp',
  '2022 Crikvenica.webp', '2023 Makó.webp', '2024 Orfű.webp', '2025 Senj.webp', '2026 Kaposvár.webp',
];
const base = new URL('../public/assets/feladvany/', import.meta.url);
const missing = assets.filter((asset) => !existsSync(new URL(asset, base)));
if (missing.length) throw new Error(`Missing optimized assets: ${missing.join(', ')}`);
if (!existsSync(new URL('netflix-qr.svg', base))) throw new Error('Missing Netflix QR code asset');
for (const asset of assets) {
  const metadata = await sharp(fileURLToPath(new URL(asset, base))).metadata();
  if (metadata.orientation !== undefined) throw new Error(`Unapplied orientation metadata: ${asset}`);
}
const component = readFileSync(new URL('../src/components/Game.astro', import.meta.url), 'utf8');
if (component.includes('Ajándékkártya feloldása') || component.includes('data-action="open-gift"')) throw new Error('Intermediate gift unlock button still exists');
if (component.includes('year-label')) throw new Error('Timeline years are still permanently displayed');
if (!component.includes('<h1>Egy közös történet</h1>')) throw new Error('Intro title is not the approved title');
if (!component.includes('10 év tíz pillanat.') || !component.includes('Emlékszel, milyen időrendben történtek?')) throw new Error('Timeline title structure is incomplete');
if (!component.includes('data-action="third-gift">Érdekel az ajándék')) throw new Error('Third puzzle requires the explicit gift button');
if (component.includes('setTimeout')) throw new Error('Third puzzle still uses timed automatic progression');
if (!component.includes("classList.toggle('show-info')")) throw new Error('Info popover does not use position-preserving toggle');
if (!component.includes('Én ezt nem tudtam volna.')) throw new Error('Timeline gift success message is incorrect');
if (!component.includes("asset('netflix-qr.svg')")) throw new Error('Netflix card does not load the generated QR code');
if (!component.includes('class="gift-inner ${state.giftFlipped?\'is-flipped\':\'\'}"')) throw new Error('Gift card is missing its independently rotating inner layer');
if (!component.includes("addEventListener('transitionend'")) throw new Error('Gift card does not wait for the visible flip animation');
if (component.includes('${progress()}')) throw new Error('Progress bar is still rendered');
if (!component.includes('fotó rólunk ősszel a bétel udvarán')) throw new Error('Third puzzle alternative text is outdated');
if (!component.includes('data-finale-piece') || !component.includes('finalePuzzleDragSetup')) throw new Error('Finale puzzle drag interaction is missing');
if (component.includes('data-action="complete-finale"')) throw new Error('Finale still exposes a completion shortcut');
console.log(`${assets.length} optimized image references and orientations verified`);
