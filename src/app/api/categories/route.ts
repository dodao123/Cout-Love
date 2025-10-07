import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// GET /api/categories - Get all active categories
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    const categories = await db.collection('categories')
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .toArray();
    
    // Get album count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const albumCount = await db.collection('albums').countDocuments({
          _id: { $in: category.albums },
          isPublic: true
        });
        
        return {
          ...category,
          albumCount
        };
      })
    );
    
    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}