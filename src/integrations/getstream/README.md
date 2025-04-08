
# GetStream.io Integration

This integration uses GetStream.io for real-time communication in Spaces.

## Setup

1. Sign up for a GetStream.io account at https://getstream.io/
2. Create a new Stream App in the dashboard
3. Add your Stream API key to your environment variables:

```
VITE_GETSTREAM_API_KEY=your_api_key_here
```

4. For production, you should set up server-side token generation with a Stream secret
