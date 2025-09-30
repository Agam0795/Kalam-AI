# Kalam AI - Intelligent Text Generator

A modern, AI-powered text generation platform built with Next.js 15, featuring multi-language support, style personas, and advanced linguistic analysis.

## 🚀 Features

- **AI Text Generation**: Powered by Google Gemini and OpenRouter APIs
- **Style Personas**: Create and manage custom writing styles
- **Multi-language Support**: Generate content in various languages
- **Real-time Chat**: Interactive AI conversations with persistent history
- **Academic Integration**: Search and integrate academic papers
- **Responsive Design**: Modern UI with Tailwind CSS
- **Secure Authentication**: Google OAuth and email/password support

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **AI APIs**: Google Gemini, OpenRouter
- **Deployment**: Vercel/Render/Firebase

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ai-generation/ # AI text generation
│   │   ├── auth/          # Authentication
│   │   ├── chat/          # Chat functionality
│   │   ├── personas/      # Style personas
│   │   └── utilities/     # Utility endpoints
│   ├── chat/              # Chat page
│   ├── humanizer/         # Text humanizer
│   └── personas/          # Persona management
├── components/            # React components
│   ├── chat/             # Chat-related components
│   ├── features/         # Feature components
│   ├── layout/           # Layout components
│   ├── tools/            # Tool components
│   └── ui/               # UI components
├── lib/                  # Utility libraries
│   ├── analyzers/        # Text analysis
│   └── database/         # Database connections
└── models/               # Data models
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB instance
- Google API key (for Gemini)
- OpenRouter API key (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Agam0795/Kalam-AI.git
cd Kalam-AI
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys and database connection:
```env
GOOGLE_API_KEY=your_google_api_key
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Render
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm run start`
5. Add environment variables

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Gemini API key | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `ALTERNATIVE_API_KEY` | OpenRouter API key | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [MongoDB](https://www.mongodb.com/) for database

---

Made with ❤️ by [Agam](https://github.com/Agam0795)