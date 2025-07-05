# Craftora - AI Code Generator

An AI-powered web development tool that generates HTML, CSS, and JavaScript code using natural language prompts. Built with React, TypeScript, and the Gemini API.

## Features

- 🤖 AI-powered code generation with Gemini 2.5 Pro
- 💬 Interactive chat interface for iterative development  
- 📱 Mobile-responsive design with 4-tab navigation
- 👥 Team API key management (personal keys via api.json)
- 📊 Training dataset collection for custom c2 model
- 📁 Code history and project management
- 🎨 Live preview with syntax highlighting
- 📦 ZIP download for generated projects

## Quick Start

### Local Development

1. **Setup the environment:**
   ```bash
   node setup-local.js
   npm install
   ```

2. **Configure your API key:**
   - Get your Gemini API key from https://aistudio.google.com/app/apikey
   - Edit `api.json` and replace `YOUR_GEMINI_API_KEY_HERE` with your key

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in your browser:**
   - Go to http://localhost:5000
   - Use the Config panel to verify your API key is working



## API Key Management

### Team Setup
- Each team member uses their personal Gemini API key
- Keys are stored in individual `api.json` files (gitignored)
- No sharing of API keys between team members
- Fallback support for environment variables

### Priority Order
1. `api.json` file (highest priority)
2. Environment variables (`GEMINI_API_KEY` or `GOOGLE_API_KEY`)  
3. Fallback templates (when no key available)

## Usage

### Generating Code
1. Enter a prompt (max 100 characters) in the main input
2. Click "Generate Code" or use the quick examples
3. View the generated HTML, CSS, and JavaScript
4. Use the live preview to see the result
5. Download as ZIP or continue chatting to iterate

### Chat Mode
- After generating code, switch to chat mode for improvements
- Ask for modifications, bug fixes, or new features
- Maintains conversation context for better results

### Dataset Collection
- All generated code is automatically saved for training
- Organized in `generated-code-dataset/` with timestamped folders
- Export training data via the Dataset panel
- Includes prompts, code, and metadata

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend  
├── shared/          # Shared TypeScript schemas
├── generated-code-dataset/  # Training data collection
├── api.json         # Personal API configuration (create from api.example.json)
├── api.example.json # Template for API configuration
└── setup-local.js   # Local development setup script
```

## Troubleshooting

### "Failed to update API" error
- Run `node setup-local.js` to create necessary files
- Manually copy: `cp api.example.json api.json`
- Verify file permissions and JSON format

### "No API key found" error  
- Check if `api.json` exists with valid `apiKey`
- Verify key starts with "AIza..." 
- Use the Config panel to update your key

See [API_SETUP.md](./API_SETUP.md) for detailed setup instructions.

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, TypeScript
- **AI:** Google Gemini 2.5 Pro API
- **Storage:** In-memory with file-based dataset collection
- **Build:** Vite for development and production

## License

MIT License