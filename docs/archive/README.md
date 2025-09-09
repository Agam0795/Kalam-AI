# 🤖 Kalam AI - Advanced Text Generation & Humanization Platform

A sophisticated AI-powered text generation and humanization platform built with Next.js 15, TypeScript, and multiple AI providers including Google Gemini and OpenRouter.

![Kalam AI](https://img.shields.io/badge/Kalam-AI-blue?style=for-the-badge&logo=openai)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 Core Functionality
- **AI Text Generation** - Powered by Google Gemini API
- **Advanced Text Humanization** - Transform AI text into natural, human-like content
- **Dual Chat System** - Google Gemini + OpenRouter alternative providers
- **AI Persona Management** - Create and manage writing style personas
- **Linguistic Analysis** - 5-dimensional style analysis and fingerprinting
- **Multi-language Support** - Generate content in multiple languages

### 🛠️ Technical Features
- **Next.js 15** with App Router and TypeScript
- **Real-time Chat** with conversation history
- **Responsive Design** with Tailwind CSS
- **MongoDB Integration** for persona storage
- **Advanced Error Handling** and debugging tools
- **API Testing Suite** with comprehensive diagnostics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Google Gemini API key
- OpenRouter API key (optional, for alternative models)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Agam0795/Kalam-AI.git
   cd Kalam-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Google/Gemini API Key
   GOOGLE_API_KEY=your_google_api_key_here
   
   # Alternative API Key (OpenRouter)
   ALTERNATIVE_API_KEY=your_openrouter_key_here
   
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Next.js Configuration
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or use the startup script
   ./start.bat  # Windows
   ./start.sh   # Linux/Mac
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Application Structure

### Pages
- **`/`** - Home page with main text generation interface
- **`/chat`** - Basic Google Gemini chat interface
- **`/enhanced-chat`** - Multi-provider chat with model selection
- **`/humanizer`** - Advanced text humanization tool
- **`/personas`** - AI persona management dashboard
- **`/debug`** - API testing and diagnostics

### API Endpoints
- **`/api/generate`** - Main text generation
- **`/api/chat`** - Google Gemini chat
- **`/api/chat-alternative`** - OpenRouter alternative APIs
- **`/api/humanize-text`** - Basic text humanization
- **`/api/humanize-with-persona`** - Persona-enhanced humanization
- **`/api/personas`** - Persona CRUD operations
- **`/api/health-check`** - System health monitoring

## 🎨 Text Humanization

The advanced text humanization feature transforms AI-generated content using sophisticated linguistic analysis:

### Humanization Principles
- **Sentence Structure Variation** - Mix short and long sentences for natural rhythm
- **Personality Injection** - Add distinct voice and tone characteristics
- **Colloquial Language** - Use contractions and natural expressions
- **Active Voice Priority** - Convert passive constructions to active voice
- **Subtle Imperfections** - Add natural human writing patterns
- **Concrete Examples** - Replace abstract statements with specific details

### Persona Integration
- Create custom writing personas from sample texts
- 5-dimensional linguistic fingerprinting
- Style emulation and adaptation
- Vocabulary and tone matching

## 🧠 AI Providers

### Google Gemini (Primary)
- Model: `gemini-1.5-flash`
- Fast response times
- High-quality text generation
- Advanced reasoning capabilities

### OpenRouter (Alternative)
- Multiple model options:
  - Llama 3.1 8B Instruct
  - Gemma 2 9B Instruct
  - Phi-3 Mini 128K Instruct
- Fallback option for Gemini
- Cost-effective alternatives

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── chat/              # Chat pages
│   ├── humanizer/         # Text humanizer
│   └── personas/          # Persona management
├── components/            # React components
│   ├── ChatBot.tsx        # Basic chat interface
│   ├── EnhancedChatBot.tsx # Multi-provider chat
│   ├── TextHumanizer.tsx  # Humanization interface
│   └── Navigation.tsx     # Site navigation
├── lib/                   # Utility libraries
│   ├── mongodb.ts         # Database connection
│   ├── styleAnalyzer.ts   # Linguistic analysis
│   └── advancedStyleAnalyzer.ts # Enhanced analysis
└── models/                # Database models
    └── StylePersona.ts    # Persona schema
```

### Key Technologies
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, MongoDB, Mongoose
- **AI/ML**: Google Generative AI, OpenRouter API
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with responsive design

## 🔍 Debugging

Access the debug interface at `/debug` to test:
- API connectivity
- Google API integration
- Humanization functionality
- System health status

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Gemini API key | ✅ Yes |
| `ALTERNATIVE_API_KEY` | OpenRouter API key | ❌ Optional |
| `MONGODB_URI` | MongoDB connection string | ✅ Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | ✅ Yes |
| `NEXTAUTH_URL` | Application URL | ✅ Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful text generation
- OpenRouter for alternative AI model access
- Next.js team for the excellent framework
- Tailwind CSS for beautiful styling
- MongoDB for reliable data storage

## 🐛 Known Issues & Solutions

- **"Failed to humanize text"** - Ensure Google API key is properly configured and has Gemini API access
- **Build errors** - Run `npm install` to ensure all dependencies are installed
- **Port conflicts** - Default port is 3000, change in `next.config.js` if needed

## 📞 Support

If you encounter any issues or have questions:
1. Check the `/debug` page for API connectivity
2. Review the console logs for error details
3. Ensure all environment variables are correctly set
4. Create an issue on GitHub with detailed error information

---

Built with ❤️ by [Agam0795](https://github.com/Agam0795)
