import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../config/initMongoDB';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('adminToken')?.value;
    console.log('Verify API - Token received:', token ? 'Yes' : 'No');

    if (!token) {
      console.log('No token provided');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { adminAccount: string };
    console.log('Token decoded successfully:', decoded);
    
    const { db } = await connectToDatabase();
    const admin = await db.collection('admins').findOne({ 
      adminAccount: decoded.adminAccount 
    });

    if (!admin) {
      console.log('Admin not found in database for account:', decoded.adminAccount);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('Admin found:', admin.adminAccount);
    return NextResponse.json({
      success: true,
      admin: {
        adminAccount: admin.adminAccount,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}