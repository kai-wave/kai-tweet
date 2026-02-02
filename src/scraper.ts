import { chromium, Browser, Page } from 'playwright';

export interface TweetData {
  author: string;
  handle: string;
  text: string;
  timestamp: string;
  media: string[];
  likes: number;
  retweets: number;
  url: string;
}

export interface ScrapeOptions {
  timeout?: number;
  headless?: boolean;
}

function normalizeUrl(url: string): string {
  return url.replace('twitter.com', 'x.com');
}

function parseCount(text: string | null): number {
  if (!text) return 0;
  const clean = text.toLowerCase().replace(/,/g, '');
  if (clean.includes('k')) return Math.round(parseFloat(clean) * 1000);
  if (clean.includes('m')) return Math.round(parseFloat(clean) * 1000000);
  return parseInt(clean, 10) || 0;
}

export async function scrapeTweet(url: string, options: ScrapeOptions = {}): Promise<TweetData> {
  const { timeout = 15000, headless = true } = options;
  const normalizedUrl = normalizeUrl(url);
  
  let browser: Browser | null = null;
  
  try {
    browser = await chromium.launch({ headless });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    await page.goto(normalizedUrl, { waitUntil: 'domcontentloaded', timeout });
    
    // Wait for tweet article to render
    await page.waitForSelector('article[data-testid="tweet"]', { timeout });
    
    // Extract tweet data
    const data = await page.evaluate(() => {
      const article = document.querySelector('article[data-testid="tweet"]');
      if (!article) throw new Error('Tweet not found');
      
      // Author info
      const userNameEl = article.querySelector('[data-testid="User-Name"]');
      const authorSpans = userNameEl?.querySelectorAll('span') || [];
      let author = '', handle = '';
      
      for (const span of authorSpans) {
        const text = span.textContent?.trim() || '';
        if (text.startsWith('@')) handle = text;
        else if (text && !text.includes('·') && !text.includes('Verified') && text.length > 1) {
          if (!author) author = text;
        }
      }
      
      // Tweet text
      const textEl = article.querySelector('[data-testid="tweetText"]');
      const text = textEl?.textContent?.trim() || '';
      
      // Timestamp
      const timeEl = article.querySelector('time');
      const timestamp = timeEl?.getAttribute('datetime') || '';
      
      // Media
      const media: string[] = [];
      article.querySelectorAll('[data-testid="tweetPhoto"] img, video source').forEach(el => {
        const src = el.getAttribute('src') || el.getAttribute('poster');
        if (src && !src.includes('profile_images')) media.push(src);
      });
      
      // Engagement metrics
      const getLinkCount = (testId: string) => {
        const el = article.querySelector(`[data-testid="${testId}"]`);
        return el?.textContent?.trim() || '0';
      };
      
      const likes = getLinkCount('like');
      const retweets = getLinkCount('retweet');
      
      return { author, handle, text, timestamp, media, likes, retweets };
    });
    
    return {
      ...data,
      likes: parseCount(data.likes as unknown as string),
      retweets: parseCount(data.retweets as unknown as string),
      url: normalizedUrl
    };
    
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message.includes('timeout') || message.includes('Timeout')) {
      throw new Error('Timeout: Tweet took too long to load (possibly private or deleted)');
    }
    if (message.includes('Tweet not found')) {
      throw new Error('Tweet not found: May be deleted, private, or from a suspended account');
    }
    throw new Error(`Failed to scrape tweet: ${message}`);
  } finally {
    if (browser) await browser.close();
  }
}
