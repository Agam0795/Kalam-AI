import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Database test: Starting connection test...');
    
    // Test environment variables
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json({
        success: false,
        error: 'MONGODB_URI environment variable not set',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    console.log('Database test: MongoDB URI found');
    
    // Test database connection
    const connection = await connectDB();
    console.log('Database test: Connection successful');
    
    // Test if we can access the connection state
    const connectionState = connection.connection.readyState;
    const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      connectionState: stateNames[connectionState] || 'unknown',
      databaseName: connection.connection.name,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
