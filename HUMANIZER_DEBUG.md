# Humanizer API Debug Guide

## Issue: "Failed to humanize text"

### Potential Causes and Solutions:

1. **Google API Key Issues**
   - Check if `GOOGLE_API_KEY` is correctly set in `.env.local`
   - Verify the API key has proper permissions for Gemini API
   - Test with: `curl -X GET http://localhost:3000/api/health-check`

2. **Model Configuration**
   - Updated from `gemini-pro` to `gemini-1.5-flash` for better reliability
   - Added proper error handling for API key validation

3. **Network/CORS Issues**
   - Ensure development server is running on port 3000
   - Check browser console for network errors

### Fixed Files:
- `src/app/api/humanize-text/route.ts` - Enhanced error handling
- `src/app/api/humanize-with-persona/route.ts` - Updated model
- `src/app/api/test-humanize/route.ts` - New test endpoint
- `src/app/api/health-check/route.ts` - API connectivity test

### Testing Steps:
1. Restart the development server: `npm run dev`
2. Test basic connectivity: Navigate to `http://localhost:3000/api/health-check`
3. Test Google API: Navigate to `http://localhost:3000/api/test-humanize`
4. Test humanization in the UI: Go to the humanizer page

### Debug Commands:
```powershell
# Check if server is running
netstat -ano | findstr :3000

# Test health endpoint
Invoke-RestMethod -Uri "http://localhost:3000/api/health-check" -Method GET

# Test humanization
$headers = @{'Content-Type'='application/json'}
$body = @{text='Test text'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/humanize-text' -Method POST -Headers $headers -Body $body
```

### Recent Changes:
- Added comprehensive logging to track where the error occurs
- Updated model from `gemini-pro` to `gemini-1.5-flash`
- Added proper Google API key validation
- Enhanced error messages for better debugging
