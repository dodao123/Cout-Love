import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const query: Record<string, unknown> = {};
    
    if (albumId) {
      query.albumId = albumId;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const analytics = await db.collection('analytics')
      .find(query)
      .sort({ date: -1 })
      .toArray();
    
    // Aggregate data
    const aggregated = analytics.reduce((acc, item) => {
      acc.totalViews += item.views;
      acc.totalUniqueViews += item.uniqueViews;
      acc.totalTimeSpent += item.timeSpent;
      acc.totalMusicPlays += item.interactions.musicPlays;
      acc.totalNoteViews += item.interactions.noteViews;
      acc.totalShares += item.interactions.shareCount;
      
      // Aggregate photo views
      Object.entries(item.interactions.photoViews).forEach(([photoIndex, views]) => {
        (acc.photoViews as Record<string, number>)[photoIndex] = ((acc.photoViews as Record<string, number>)[photoIndex] || 0) + (views as number);
      });
      
      return acc;
    }, {
      totalViews: 0,
      totalUniqueViews: 0,
      totalTimeSpent: 0,
      totalMusicPlays: 0,
      totalNoteViews: 0,
      totalShares: 0,
      photoViews: {}
    });
    
    return NextResponse.json({
      analytics,
      aggregated
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// POST /api/analytics - Track analytics event
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const eventData = await request.json();
    
    const { albumId, eventType, data } = eventData;
    
    if (!albumId || !eventType) {
      return NextResponse.json(
        { error: 'albumId and eventType are required' },
        { status: 400 }
      );
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Find or create today's analytics record
    let analytics = await db.collection('analytics').findOne({
      albumId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!analytics) {
      const newAnalytics = {
        albumId,
        date: today,
        views: 0,
        uniqueViews: 0,
        timeSpent: 0,
        interactions: {
          photoViews: {},
          musicPlays: 0,
          noteViews: 0,
          shareCount: 0
        }
      };
      
      const result = await db.collection('analytics').insertOne(newAnalytics);
      analytics = { _id: result.insertedId, ...newAnalytics };
    }
    
    // Update based on event type
    const updateFields: Record<string, unknown> = {};
    
    switch (eventType) {
      case 'view':
        updateFields.$inc = { views: 1 };
        break;
      case 'uniqueView':
        updateFields.$inc = { uniqueViews: 1 };
        break;
      case 'timeSpent':
        updateFields.$inc = { timeSpent: data.duration || 0 };
        break;
      case 'photoView':
        updateFields.$inc = { [`interactions.photoViews.${data.photoIndex}`]: 1 };
        break;
      case 'musicPlay':
        updateFields.$inc = { 'interactions.musicPlays': 1 };
        break;
      case 'noteView':
        updateFields.$inc = { 'interactions.noteViews': 1 };
        break;
      case 'share':
        updateFields.$inc = { 'interactions.shareCount': 1 };
        break;
    }
    
    await db.collection('analytics').updateOne(
      { _id: analytics._id },
      updateFields
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}