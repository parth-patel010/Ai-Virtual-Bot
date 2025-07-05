# Team API Setup Guide

This guide explains how each team member can set up their personal Gemini API key for Craftora.

## Local Development Setup

If you downloaded the project files to run locally:

1. **Run the setup script:**
   ```bash
   node setup-local.js
   ```
   This creates necessary files and directories.

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Get your Gemini API key:**
   - Visit https://aistudio.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key

4. **Update your configuration:**
   - Open `api.json` (created by setup script)
   - Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key
   - Save the file

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Quick Setup (if setup script fails)

1. **Manually copy the example file:**
   ```bash
   cp api.example.json api.json
   ```

2. **Follow steps 3-5 above**

## Configuration File Structure

```json
{
  "gemini": {
    "apiKey": "your-actual-api-key-here",
    "model": "gemini-2.0-flash-exp",
    "maxTokens": 4096,
    "temperature": 0.7
  },
  "team": {
    "description": "Each team member can add their own Gemini API key here",
    "instructions": ["..."]
  },
  "fallback": {
    "enabled": true,
    "description": "Template responses when no API key is provided"
  }
}
```

## Using the Interface

### Desktop
- Click the gear icon (⚙️) in the top-right header
- Opens the API Configuration panel
- Shows current status and allows key updates

### Mobile
- Tap the "Config" tab at the bottom
- Same configuration interface as desktop

## Key Priority Order

The system checks for API keys in this order:
1. **api.json file** (highest priority)
2. **Environment variables** (GEMINI_API_KEY or GOOGLE_API_KEY)
3. **Fallback templates** (when no key is available)

## Security Notes

- ✅ Each team member has their own personal API key
- ✅ Keys are stored locally in your `api.json` file
- ✅ The `api.json` file is gitignored (won't be committed)
- ✅ API keys are never shared between team members
- ⚠️ Never commit your `api.json` file to version control
- ⚠️ Keep your API key private and secure

## Troubleshooting

### "Failed to update API" error (Local Development)
This usually happens when running downloaded files locally:

1. **Run the setup script:**
   ```bash
   node setup-local.js
   ```

2. **Check file permissions:**
   - Make sure you can write files in the project directory
   - Try running with elevated permissions if needed

3. **Manually create api.json:**
   ```bash
   cp api.example.json api.json
   ```
   Then edit api.json with your API key

4. **Verify the file structure:**
   - Make sure api.json is in the root directory (same level as package.json)
   - Check that the JSON format is valid

### "No API key found" error
- Check if `api.json` exists and has a valid `apiKey` value
- Verify the key is correct (starts with "AIza...")
- Try the configuration interface to update your key

### API calls failing
- Verify your Gemini API key is active at https://aistudio.google.com/
- Check your API quota and billing settings
- Ensure the key has the correct permissions

### Configuration interface not showing key
- The interface never displays your actual API key for security
- It only shows whether a key is configured or not
- Source shows where the key is coming from (api.json vs environment)

## Dataset Collection

When you generate code with your API key:
- All generated code is automatically saved to `generated-code-dataset/`
- This creates training data for your potential c2 model
- You can export this data via the Dataset panel
- Each generation includes: prompt, HTML, CSS, JS, and metadata

## Support

If you have issues with setup:
1. Check this guide again
2. Verify your API key at Google AI Studio
3. Try using the configuration interface
4. Ask a team member who has it working