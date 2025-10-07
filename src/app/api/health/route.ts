import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// GET /api/health - Health check endpoint
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Test database connection
    const db = await getDatabase();
    
    // Ping database
    await db.admin().ping();
    
    // Get database stats
    const stats = await db.stats();
    
    // List collections
    const collections = await db.listCollections().toArray();
    
    // Test write operation
    const testCollection = db.collection('health_check');
    const testDoc = {
      timestamp: new Date(),
      test: true,
      message: 'Health check successful'
    };
    
    const writeResult = await testCollection.insertOne(testDoc);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: writeResult.insertedId });
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        name: db.databaseName,
        collections: collections.length,
        responseTime: `${responseTime}ms`
      },
      stats: {
        collections: collections.map(c => c.name),
        dataSize: stats.dataSize,
        indexSize: stats.indexSize,
        objects: stats.objects
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'database_connection_error'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}