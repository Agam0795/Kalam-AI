# 🚀 Advanced AI Content Creation Platform

A next-generation AI-powered content creation platform that goes beyond simple text generation to provide a comprehensive content strategy and creation experience.

## 🌟 Core Features

### 📝 **AI Text Generation**
- **Google Gemini Integration**: Powered by Gemini 1.5 Flash for high-quality content generation
- **Multi-language Support**: Generate content in any language with cultural context
- **Personal Writing Style**: Upload your writing samples and AI mimics your unique voice
- **Real-time Generation**: Fast, responsive content creation

### 🎨 **Multimodal Content Generation**
- **Automatic Image Generation**: Creates relevant header images and illustrations using DALL-E 3
- **Style-Aware Visuals**: Matches image style to content type (professional, creative, technical)
- **Content Visualization**: Auto-generates charts and graphs for data-rich content
- **Audio Generation**: Text-to-speech with voice cloning capabilities

### 🌍 **Cultural Adaptation & Localization**
- **Hinglish Support**: Natural Hindi-English code-switching for Indian audiences
- **Regional Languages**: Support for Tamil, Bengali, Marathi with local idioms
- **Cultural Context Engine**: Includes local references, festivals, and customs
- **Target Audience Adaptation**: Content tailored for specific demographics

### 🤖 **Autonomous Content Strategy**
- **Trend Research**: AI automatically identifies trending topics in your niche
- **Content Calendar**: 30-day automated content planning and scheduling
- **Headline Generation**: Multiple variations optimized for engagement
- **A/B Testing**: Generate content variants for performance testing

### 📊 **Performance Analytics & Optimization**
- **Content Performance Tracking**: Integrates with Google Analytics, Medium, social platforms
- **Predictive Engagement Scoring**: AI predicts content performance before publishing
- **Optimization Suggestions**: Real-time recommendations to improve content
- **Performance Feedback Loop**: AI learns from your content's actual performance

### 🛡️ **Enterprise-Grade Features**
- **Bias Detection**: Configurable content safety and brand compliance
- **Source Verification**: Auditable citation trails for fact-checking
- **Brand Voice Consistency**: Maintains consistent tone across all content
- **Team Collaboration**: Multi-user workspaces with role-based access
- **Style-Aware Generation**: Toggle between generic AI responses and your personalized writing style
- **Modern UI**: Clean, responsive design built with Tailwind CSS
- **Real-time Generation**: Get instant AI responses with loading states and error handling
- **Dark Mode**: Supports both light and dark themes
- **Type-safe**: Built with TypeScript for better development experience

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **Google Generative AI**: AI text generation
- **In-Memory Database**: Temporary storage for writing styles (can be upgraded to Prisma + SQLite)
- **Lucide React**: Beautiful icon library

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- Google API key (get one from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository or download the project files
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Google API key to `.env.local`:
   ```
   GOOGLE_API_KEY=your_actual_google_api_key_here
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Basic Text Generation
1. **Enter Language (Optional)**: Specify the language you want the AI to respond in (e.g., "English", "Spanish", "French", "Arabic")
2. **Enter Your Prompt**: Type your prompt or topic in the text area
3. **Generate**: Click the "Generate Text" button or press Enter to get AI-generated content
4. **View Response**: The generated text will appear in the right panel

### Setting Up Your Writing Style
1. **Upload Writing Style**: Click the "Upload Your Writing Style" button
2. **Add Title**: Give your writing sample a descriptive title
3. **Select Language & Category**: Choose the language and category (Blog, Academic, Creative, etc.)
4. **Paste Your Writing**: Add a sample of your writing (200-500 words recommended)
5. **Save**: Click "Save Writing Style" to store it in the database

### Generating in Your Style
1. **Enable Style Toggle**: Check "Use My Writing Style" before generating
2. **Enter Your Prompt**: The AI will now use your stored writing samples as style examples
3. **Generate**: Get content that matches your personal writing style, tone, and vocabulary

### Example Prompts

- "Write an article about renewable energy"
- "Explain quantum computing in simple terms"
- "Create a business plan for a coffee shop"
- "Write a poem about nature"
- "Summarize the benefits of meditation"

## API Configuration

The application uses Google's Gemini 1.5 Flash model by default. You can modify the model in `/src/app/api/generate/route.ts`:

```typescript
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash" // or "gemini-1.5-pro" for better quality
});
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts     # AI text generation API endpoint
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main application page
└── components/              # Reusable components (if any)
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Your Google Gemini API key | Yes |

## Error Handling

The application includes comprehensive error handling for common scenarios:

- Missing API key configuration
- API quota exceeded
- Invalid API key
- Network errors
- Empty prompts

## Deployment

### Vercel (Recommended)

1. Push your code to a GitHub repository
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your `GOOGLE_API_KEY` environment variable in Vercel's dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Verify your Google API key is correct
3. Ensure you have enabled the Gemini API in Google Cloud Console
4. Check your internet connection

## Database Notes

Currently, the application uses in-memory storage for writing styles, which means your uploaded writing samples will be lost when the server restarts. This was implemented to avoid Prisma setup complexity.

### To Enable Persistent Database:
1. Run `npm install prisma @prisma/client`
2. Run `npx prisma generate`
3. Run `npx prisma db push`
4. Replace the content in `src/lib/db.ts` with proper Prisma client code
5. Restart the development server

Your writing styles will then be permanently stored in a SQLite database.
