// Temporary in-memory storage for writing styles
// Replace with actual database when Prisma is working

interface WritingStyle {
  id: string;
  title: string;
  content: string;
  language?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface GeneratedContent {
  id: string;
  prompt: string;
  generatedText: string;
  language?: string;
  usedWritingStyle: boolean;
  createdAt: Date;
}

// In-memory storage (will be lost on server restart)
// eslint-disable-next-line prefer-const
let writingStyles: WritingStyle[] = [];
// eslint-disable-next-line prefer-const
let generatedContent: GeneratedContent[] = [];

export const db = {
  writingStyle: {
    create: async (data: { data: Omit<WritingStyle, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const newStyle: WritingStyle = {
        id: Math.random().toString(36).substring(2, 15),
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      writingStyles.push(newStyle);
      return newStyle;
    },
    findMany: async (options?: {
      where?: { language?: string };
      orderBy?: { createdAt: 'desc' | 'asc' };
      take?: number;
      select?: Record<string, boolean>;
    }) => {
      let filtered = [...writingStyles];
      
      if (options?.where?.language) {
        filtered = filtered.filter(style => style.language === options.where?.language);
      }
      
      if (options?.orderBy?.createdAt === 'desc') {
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      
      if (options?.take) {
        filtered = filtered.slice(0, options.take);
      }
      
      return filtered;
    },
    findUnique: async (options: { where: { id: string } }) => {
      return writingStyles.find(style => style.id === options.where.id) || null;
    },
    delete: async (options: { where: { id: string } }) => {
      const index = writingStyles.findIndex(style => style.id === options.where.id);
      if (index > -1) {
        writingStyles.splice(index, 1);
      }
    },
  },
  generatedContent: {
    create: async (data: { data: Omit<GeneratedContent, 'id' | 'createdAt'> }) => {
      const newContent: GeneratedContent = {
        id: Math.random().toString(36).substring(2, 15),
        ...data.data,
        createdAt: new Date(),
      };
      generatedContent.push(newContent);
      return newContent;
    },
  },
};

export const prisma = db;
