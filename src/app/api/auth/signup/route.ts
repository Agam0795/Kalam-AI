import { NextRequest, NextResponse } from 'next/server';

interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name }: SignupRequest = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // In a real app, you would:
    // 1. Check if user already exists
    // 2. Hash the password using bcrypt
    // 3. Save user to database
    // 4. Send welcome email (optional)

    // For now, simulate successful signup
    // You can replace this with actual database logic later
    
    // Simulate checking if user exists
    if (email === 'existing@example.com') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Simulate successful user creation
    const user = {
      id: Math.random().toString(36).substring(2),
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
