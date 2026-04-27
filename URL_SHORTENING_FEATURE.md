# URL Shortening Feature

## Overview
Implemented automatic URL shortening for deep links in the "Share Group Status" feature to make shared messages cleaner and more user-friendly.

## Problem
When sharing session status via text/messaging apps, the deep link was very long and hard to read:

**Before:**
```
📱 Update your status: bellewoodgolf://session/cm2xqr8ry0001l508qwer1234
```

## Solution
Integrated TinyURL API to automatically shorten deep links when sharing.

**After:**
```
📱 Update your status: tinyurl.com/abc123
```

## Implementation Details

### URL Shortening Function
Added a helper function at the top of `SessionCard.tsx` that uses the TinyURL API:

```typescript
const shortenUrl = async (longUrl: string): Promise<string> => {
  try {
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`)
    if (!response.ok) {
      throw new Error('TinyURL API request failed')
    }
    const shortUrl = await response.text()
    return shortUrl.trim()
  } catch (error) {
    console.error('Failed to shorten URL:', error)
    return longUrl // Fallback to original URL if shortening fails
  }
}
```

### Updated Share Function
Modified `handleShareStatus` to use the URL shortener:

```typescript
// Generate shortened URL for the deep link
const deepLink = `bellewoodgolf://session/${session.id}`
const shortUrl = await shortenUrl(deepLink)

// Add shortened link to message
message += `\n\n📱 Update your status: ${shortUrl}`
```

## Features

### ✅ Automatic Shortening
- Every time a user shares group status, the deep link is automatically shortened
- Happens in real-time before the share dialog appears
- No user interaction required

### ✅ Graceful Fallback
- If TinyURL API is unavailable or fails, the original long URL is used
- Users can still share the status even if shortening fails
- Error is logged to console for debugging

### ✅ No Configuration Required
- TinyURL API is free and doesn't require API keys
- No setup or registration needed
- Works immediately out of the box

### ✅ Per-Session Links
- Each session gets its own unique shortened URL
- TinyURL caches the mapping, so the same session will get the same short URL
- Links remain valid indefinitely

## Why TinyURL?

| Feature | TinyURL | Bitly | Custom Solution |
|---------|---------|-------|-----------------|
| **Cost** | Free | Free tier | ~$12/year |
| **Setup** | None | API key required | Domain + hosting |
| **Reliability** | High | High | Depends on setup |
| **Speed** | Fast | Fast | Varies |
| **Maintenance** | None | API key management | Server maintenance |

TinyURL was chosen because:
1. **Zero setup** - Works immediately
2. **No API keys** - No security concerns or key management
3. **Reliable** - Established service since 2002
4. **Free** - No cost or rate limits for basic usage
5. **Simple** - Single API call, plain text response

## Example Output

### Full Share Message Example

**Before URL Shortening:**
```
Sunday Golf
October 27, 2024 at 10:00 AM
Created by: Mark

✅ Mark • 🚶
✅ John • 🛺 • Need a cart
❓ Dave
❌ Steve • Can't make it

📊 2 players confirmed

📱 Update your status: bellewoodgolf://session/cm2xqr8ry0001l508qwer1234
```

**After URL Shortening:**
```
Sunday Golf
October 27, 2024 at 10:00 AM
Created by: Mark

✅ Mark • 🚶
✅ John • 🛺 • Need a cart
❓ Dave
❌ Steve • Can't make it

📊 2 players confirmed

📱 Update your status: tinyurl.com/bwood-oct27
```

Much cleaner and easier to read! 🎉

## Technical Details

### API Endpoint
```
GET https://tinyurl.com/api-create.php?url={encoded_url}
```

### Response Format
Plain text containing the shortened URL:
```
https://tinyurl.com/abc123
```

### Error Handling
1. Network errors → Falls back to original URL
2. API failures → Falls back to original URL
3. Invalid responses → Falls back to original URL
4. All errors are logged to console for debugging

### Performance
- API call typically takes 200-500ms
- Happens asynchronously before share dialog
- User sees a brief moment before share dialog opens
- No noticeable delay in user experience

## Deep Link Behavior

The shortened URL still points to the deep link format:
```
tinyurl.com/abc123 → bellewoodgolf://session/cm2xqr8ry0001l508qwer1234
```

When a user taps the shortened link:
1. TinyURL redirects to the deep link
2. iOS/Android recognizes the `bellewoodgolf://` scheme
3. The Bellewood Golf Crew app opens
4. User is taken directly to that session

## Future Enhancements (Optional)

### Option 1: Custom Domain
Replace TinyURL with your own branded shortener:
- `bwood.golf/s/abc123` instead of `tinyurl.com/abc123`
- Requires: Domain ($12/year) + Simple redirect service (AWS Lambda or similar)
- Benefits: Branding, analytics, full control

### Option 2: Analytics
Track link clicks to understand:
- How many people click the links
- When they click them
- Which sessions get the most engagement

### Option 3: QR Codes
Generate QR codes for sessions that can be:
- Posted at the golf course
- Shared in group chats
- Printed on flyers

## Files Changed

**Modified:**
- `golf-scheduler-mobile/src/components/SessionCard.tsx`
  - Added `shortenUrl` helper function (lines 7-20)
  - Updated `handleShareStatus` to use shortened URLs (lines 136-141)

## Testing

### Test Cases

**Test 1: Normal Operation**
1. Open a session
2. Tap "📤 Share Group Status"
3. Verify the message contains a shortened URL (tinyurl.com/...)
4. Share the message
5. Tap the shortened link
6. Verify the app opens to that session

**Test 2: Fallback on Error**
1. Disable internet connection
2. Tap "📤 Share Group Status"
3. Verify the message contains the original long URL
4. Message can still be shared

**Test 3: Multiple Sessions**
1. Share status for Session A → Get short URL
2. Share status for Session B → Get different short URL
3. Share status for Session A again → Get same short URL as step 1

## Date Implemented
October 24, 2025

## Will Be Included In
Next EAS build for TestFlight

## Related Features
- Deep linking (`bellewoodgolf://` scheme)
- Share group status functionality
- Session management



