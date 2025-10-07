import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../config/initMongoDB';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    const { adminAccount, password } = await request.json();

    if (!adminAccount || !password) {
      return NextResponse.json(
        { error: 'Admin account and password are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const admin = await db.collection('admins').findOne({ adminAccount });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, admin.hashPassword);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await db.collection('admins').updateOne(
      { _id: admin._id },
      { $set: { lastLogin: new Date() } }
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin._id,
        adminAccount: admin.adminAccount 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        admin: {
          adminAccount: admin.adminAccount,
          lastLogin: admin.lastLogin
        }
      },
      { status: 200 }
    );

    // Set HTTP-only cookie with more permissive settings for development
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/' // Ensure cookie is available for all paths
    });

    console.log('Cookie set successfully');
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}