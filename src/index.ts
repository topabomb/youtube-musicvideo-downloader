import * as htmlparser2 from 'htmlparser2';
import { readFileSync } from 'fs';
import { downloader } from './downloader';
import { program } from 'commander';
import fetch from 'node-fetch';
program
  .option('-d, --dir <value>', 'output dir', './download')
  .option(
    '-i, --input <value>',
    'input html file or kworb.net url',
    'https://kworb.net/youtube/topvideos_female_group.html'
    //'./YouTube - Most Viewed Music Videos by Female Groups.html'
  )
  .option('-s, --skip <value>', 'skip n rows')
  .option('-q, --quality <value>', 'max video quality', '1080');
program.parse();
const options = program.opts();
console.log('options', options);

const links = new Set<string>();
let html: string;
if (options.input.trim().startsWith('https://')) {
  console.log(`fetching url:${options.input}`);
  const resp = await fetch(options.input.trim());
  if (!resp.ok || resp.status != 200) throw new Error(`fetch ${options.input} error.`);
  html = await resp.text();
} else html = readFileSync(options.input, { encoding: 'utf-8' }).toString();
const parser = new htmlparser2.Parser({
  onopentag(tag, attributes) {
    if (tag === 'a' && 'href' in attributes && attributes['href'].startsWith('video/')) {
      links.add(attributes['href'].substring('video/'.length, attributes['href'].length - '.html'.length));
    } else if (tag === 'a' && 'href' in attributes && attributes['href'].startsWith('../video/')) {
      links.add(attributes['href'].substring('../video/'.length, attributes['href'].length - '.html'.length));
    }
  },
});
parser.write(html);
parser.end();
console.log('links count is', links.size);
let current = 1;
const skipN = options.skip ? Number(options.skip) : undefined;
const quality = Number(options.quality);
for (const key of links) {
  try {
    if (skipN && current < skipN) continue;
    const file = await downloader.download(key, options.dir, {
      videoFormat: (formats) => {
        const mp4s = formats.filter((x) => x.container == 'mp4');
        mp4s.sort((a, b) => (b.width == a.width ? b.fps - a.fps : b.width - a.width));
        const hit = mp4s.find((x) => x.height <= quality);
        console.log('selected video format:', hit.qualityLabel, hit.height, hit.fps);
        return hit;
      },
    });
    console.log(`${current}/${links.size} downloaded(${key}) to ${file}`);
  } catch (err) {
    if ((err as Error).message.includes('Video unavailable')) console.log(`Video(${key}) unavailable.`);
    else if ((err as Error).message.includes('Status code: 410')) console.log(`Video(${key}) code 410.`);
    else if ((err as Error).message.includes('write EPIPE')) console.log(`Video(${key}) write EPIPE.`);
    else if ((err as Error).message.includes('check timeout error.')) console.log(`Video(${key}) timeout.`);
    else if ((err as Error).message.includes('This is a private video. Please sign in to verify that you may see it.'))
      console.log(`Video(${key}) private.`);
    else {
      console.error((err as Error).message);
      break;
    }
  } finally {
    current += 1;
  }
}
