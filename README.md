# kai-tweet

Extract tweet content from X/Twitter URLs using browser automation.

## Installation

```bash
npm install -g kai-tweet
```

Or use directly with npx:
```bash
npx kai-tweet https://x.com/user/status/123456
```

## Usage

```bash
# Get tweet as JSON
kai-tweet https://x.com/elonmusk/status/1234567890

# Get tweet as plain text
kai-tweet https://twitter.com/user/status/123456 --raw
```

## Output

### JSON (default)
```json
{
  "author": "Display Name",
  "handle": "@username",
  "text": "Tweet content here...",
  "timestamp": "2026-02-02T12:00:00.000Z",
  "media": ["https://pbs.twimg.com/..."],
  "likes": 1234,
  "retweets": 567,
  "url": "https://x.com/user/status/123456"
}
```

### Plain text (`--raw`)
```
Display Name (@username)
2026-02-02T12:00:00.000Z

Tweet content here...

❤️ 1234  🔁 567
📷 1 media

https://x.com/user/status/123456
```

## Library Usage

```typescript
import { scrapeTweet } from 'kai-tweet';

const tweet = await scrapeTweet('https://x.com/user/status/123456');
console.log(tweet.text);
```

## Features

- ✅ Works with both `x.com` and `twitter.com` URLs
- ✅ No Twitter login required (public tweets only)
- ✅ Extracts author, text, timestamp, media, likes, retweets
- ✅ Graceful error handling for private/deleted tweets
- ✅ 15 second timeout
- ✅ Usable as CLI or library

## Requirements

- Node.js 18+
- Playwright (auto-installs Chromium)

## License

MIT
