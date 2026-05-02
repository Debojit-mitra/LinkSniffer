import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;
const DEBUG = process.env.DEBUG === 'true';

// Helper to find browser path
const getBrowserPath = (): string => {
  const browserPaths = [
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Windows fallback
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' // Mac fallback
  ];

  for (const p of browserPaths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No browser found');
};

const getBrowser = async (): Promise<Browser> => {
  return await puppeteer.launch({
    executablePath: getBrowserPath(),
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--remote-debugging-port=9222',
      '--blink-settings=imagesEnabled=false'
    ]
  });
};

app.post('/search', async (req: Request, res: Response) => {
  const { query, source = 'hollywood' } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  let browser: Browser | null = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    const results: any[] = [];

    if (source === 'hollywood' || source === 'bollywood') {
      const reParam = source === 'hollywood' ? 'vegamovies' : 'rogmovies';
      const url = `https://vglist.cv/?re=${reParam}`;
      console.log(`Navigating to ${url} for ${source} search`);
      
      await page.goto(url, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 3000));

      const redirectedUrl = page.url();
      console.log(`Redirected to: ${redirectedUrl}`);

      const parsedUrl = new URL(redirectedUrl);
      const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
      const searchUrl = `${baseUrl}/search.html?q=${encodeURIComponent(query)}`;
      
      console.log(`Navigating to search URL: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 3000));

      const movieCards = await page.$$("a[href*='/download-']");
      console.log(`Found ${movieCards.length} potential movie links`);

      for (const card of movieCards) {
        try {
          const href = await page.evaluate(el => (el as HTMLAnchorElement).href, card);
          if (!href || results.some(r => r.link === href)) continue;

          const title = await page.evaluate(el => {
            const titleEl = el.querySelector('.poster-title') as HTMLElement;
            if (titleEl) return titleEl.innerText?.trim();
            return (el as HTMLElement).innerText?.trim();
          }, card) || href.split('/').slice(-2, -1)[0].replace(/-/g, ' ');

          const image = await page.evaluate(el => {
            const imgEl = el.querySelector('img');
            return imgEl ? imgEl.getAttribute('src') : '';
          }, card);

          const quality = await page.evaluate(el => {
            const qEl = el.querySelector('.poster-quality') as HTMLElement;
            return qEl ? qEl.innerText?.trim() : '';
          }, card);

          results.push({ title, link: href, image, quality });
        } catch (e) {
          console.error('Error parsing card:', e);
        }
      }
    } else if (source === 'moviesnation') {
      const searchUrl = `https://moviesnation.health/?s=${encodeURIComponent(query)}`;
      console.log(`Navigating to search URL: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 3000));

      const movieCards = await page.$$('article.post-item');
      console.log(`Found ${movieCards.length} potential movie links`);

      for (const card of movieCards) {
        try {
          const aTag = await card.$('h3.entry-title a');
          if (!aTag) continue;

          const { href, title } = await page.evaluate(el => ({
            href: (el as HTMLAnchorElement).href,
            title: (el as HTMLElement).innerText?.trim()
          }), aTag);

          if (!href || results.some(r => r.link === href)) continue;

          const image = await page.evaluate(el => {
            const imgEl = el.querySelector('img.blog-picture');
            return imgEl ? imgEl.getAttribute('src') : '';
          }, card);

          results.push({
            title,
            link: href,
            image,
            quality: 'MoviesNation'
          });
        } catch (e) {
          console.error('Error parsing MoviesNation card:', e);
        }
      }
    }

    console.log(`Total results found: ${results.length}`);
    res.json({ results });

  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.post('/details', async (req: Request, res: Response) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ error: 'Link is required' });

  let browser: Browser | null = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    const sections: any[] = [];

    console.log(`Fetching details for: ${link}`);
    await page.goto(link, { waitUntil: 'networkidle2' });

    if (link.includes('moviesnation.health')) {
      await page.waitForSelector('.entry-content', { timeout: 20000 });
      const links = await page.$$('.entry-content a');
      
      for (const l of links) {
        const { href, text } = await page.evaluate(el => ({
          href: (el as HTMLAnchorElement).href,
          text: (el as HTMLElement).innerText?.trim() || ''
        }), l);

        if (!href) continue;

        const qualities = ['480p', '720p', '1080p', '2160p', 'Zip', 'Episode'];
        if (href.includes('bollydrive.lol') || qualities.some(q => text.includes(q))) {
          if (text && !text.includes('MoviesNation') && !text.includes('Download Daredevil')) {
            sections.push({
              header: text,
              links: [{ text: '⚡ Download [Direct]', url: href }]
            });
          }
        }
      }
    } else {
      await page.waitForSelector('.page-body', { timeout: 20000 });
      
      const elements = await page.evaluate(() => {
        const body = document.querySelector('.page-body');
        if (!body) return [];
        
        const results: any[] = [];
        const children = Array.from(body.children);
        
        children.forEach(child => {
          const el = child as HTMLElement;
          const tagName = el.tagName.toLowerCase();
          if (['h2', 'h3', 'h4', 'h5', 'p', 'hr'].includes(tagName)) {
            if (['h2', 'h3', 'h4', 'h5'].includes(tagName)) {
              const text = el.innerText?.trim();
              // Filter out long scripts or empty headers
              if (text && text.length < 500 && !text.includes('(function')) {
                results.push({ type: 'header', text });
              }
            } else if (tagName === 'p') {
              const links = Array.from(el.querySelectorAll('a')).map(a => ({
                text: (a as HTMLElement).innerText?.trim() || 'Download Link',
                url: (a as HTMLAnchorElement).href
              })).filter(l => l.text && l.text.length < 500 && !l.text.includes('(function'));
              
              if (links.length > 0) {
                results.push({ type: 'links', links });
              }
            }
          }
        });
        return results;
      });

      let currentSection: any = { header: 'General Links', links: [] };
      for (const item of elements) {
        if (item.type === 'header') {
          if (currentSection.links.length > 0) sections.push(currentSection);
          currentSection = { header: item.text, links: [] };
        } else if (item.type === 'links') {
          for (const l of item.links) {
            if (l.url && (l.url.includes('nexdrive.pro') || l.text.includes('G-Direct') || l.text.includes('V-Cloud') || l.text.includes('Batch'))) {
              currentSection.links.push(l);
            }
          }
        }
      }
      if (currentSection.links.length > 0) sections.push(currentSection);
    }

    console.log(`Extracted ${sections.length} sections`);
    res.json({ sections });

  } catch (error: any) {
    console.error('Details error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.post('/episodes', async (req: Request, res: Response) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ error: 'Link is required' });

  let browser: Browser | null = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    const episodes: any[] = [];

    console.log(`Fetching final episodes from: ${link}`);
    await page.goto(link, { waitUntil: 'networkidle2' });

    if (link.includes('bollydrive.lol/file') || link.includes('bollydrive.lol/new/file')) {
      await page.waitForSelector('button', { timeout: 10000 });
      const buttons = await page.$$('button');
      
      for (const b of buttons) {
        const { onclick, text } = await page.evaluate(el => ({
          onclick: el.getAttribute('onclick'),
          text: (el as HTMLElement).innerText?.trim() || ''
        }), b);

        if (onclick && onclick.includes('openMirrorWithLoader')) {
          const match = onclick.match(/openMirrorWithLoader\(this,\s*'([^']+)'\)/);
          if (match) {
            episodes.push({
              text: text || 'Download Link',
              url: match[1]
            });
          }
        }
      }
    } else if (link.includes('links.bollydrive.lol/archives')) {
      await page.waitForSelector('a', { timeout: 10000 });
      const anchors = await page.$$('a');
      
      for (const a of anchors) {
        const { href, text } = await page.evaluate(el => ({
          href: (el as HTMLAnchorElement).href,
          text: (el as HTMLElement).innerText?.trim() || ''
        }), a);

        if (href && (href.includes('bollydrive.lol/file') || href.includes('bollydrive.lol//file'))) {
          episodes.push({
            text: text || 'Episode Link',
            url: href
          });
        }
      }
    } else {
      await page.waitForSelector('a', { timeout: 20000 });
      const anchors = await page.$$('a');
      
      for (const a of anchors) {
        const { href, text } = await page.evaluate(el => ({
          href: (el as HTMLAnchorElement).href,
          text: (el as HTMLElement).innerText?.trim() || ''
        }), a);

        const patterns = ['vcloud.zip', 'fastdl.zip', 'filebee'];
        const textPatterns = ['Download', 'Episode', 'G-Direct', 'V-Cloud', 'Zip'];
        
        if (href && (patterns.some(p => href.includes(p)) || textPatterns.some(tp => text.includes(tp)))) {
          episodes.push({
            text: text || 'Download Link',
            url: href
          });
        }
      }
    }

    res.json({ episodes });

  } catch (error: any) {
    console.error('Episodes error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
