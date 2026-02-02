#!/usr/bin/env node
import { scrapeTweet, TweetData } from './scraper.js';

function formatRaw(tweet: TweetData): string {
  const lines = [
    `${tweet.author} (${tweet.handle})`,
    `${tweet.timestamp}`,
    '',
    tweet.text,
    '',
    `❤️ ${tweet.likes}  🔁 ${tweet.retweets}`,
  ];
  if (tweet.media.length) lines.push(`📷 ${tweet.media.length} media`);
  lines.push('', tweet.url);
  return lines.join('\n');
}

function showHelp(): void {
  console.log(`
kai-tweet - Extract tweet content from X/Twitter URLs

Usage:
  kai-tweet <url> [options]

Options:
  --raw       Plain text output instead of JSON
  --help, -h  Show this help message

Examples:
  kai-tweet https://x.com/user/status/123456
  kai-tweet https://twitter.com/user/status/123456 --raw
`);
}

function isValidUrl(url: string): boolean {
  return /^https?:\/\/(x\.com|twitter\.com)\/\w+\/status\/\d+/.test(url);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    showHelp();
    process.exit(0);
  }
  
  const url = args.find(a => !a.startsWith('-'));
  const raw = args.includes('--raw');
  
  if (!url || !isValidUrl(url)) {
    console.error('Error: Please provide a valid X/Twitter URL');
    console.error('Example: https://x.com/user/status/123456789');
    process.exit(1);
  }
  
  try {
    const tweet = await scrapeTweet(url);
    console.log(raw ? formatRaw(tweet) : JSON.stringify(tweet, null, 2));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();
