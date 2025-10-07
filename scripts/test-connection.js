const { MongoClient } = require('mongodb');

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://dodao:AR3allyL0ngPa5sW0rd@xui.hs.vc/countinglove?authSource=tsa';
const MONGODB_DB = process.env.MONGODB_DB || 'countinglove';

async function testConnection() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔄 Đang kết nối đến MongoDB...');
    console.log('📍 URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    await client.connect();
    console.log('✅ Kết nối MongoDB thành công!');
    
    const db = client.db(MONGODB_DB);
    console.log('📊 Database:', MONGODB_DB);
    
    // Test ping
    await db.admin().ping();
    console.log('🏓 Ping database thành công!');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections hiện có:', collections.length);
    
    if (collections.length > 0) {
      console.log('   -', collections.map(c => c.name).join(', '));
    } else {
      console.log('   - Chưa có collections nào');
    }
    
    // Test write operation
    const testCollection = db.collection('test_connection');
    const testDoc = { 
      test: true, 
      timestamp: new Date(),
      message: 'Test connection successful'
    };
    
    const result = await testCollection.insertOne(testDoc);
    console.log('✍️ Test write operation thành công!');
    console.log('   - Document ID:', result.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('🧹 Đã xóa test document');
    
    console.log('\n🎉 Database connection test hoàn thành!');
    console.log('💡 Bạn có thể chạy "npm run init-db" để khởi tạo database');
    
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:');
    console.error('   -', error.message);
    
    if (error.message.includes('authentication')) {
      console.error('\n💡 Kiểm tra lại:');
      console.error('   - Username và password');
      console.error('   - Database name và authSource');
    } else if (error.message.includes('network')) {
      console.error('\n💡 Kiểm tra lại:');
      console.error('   - Host và port');
      console.error('   - Network connection');
    }
    
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Đã đóng kết nối');
  }
}

// Run test
if (require.main === module) {
  testConnection()
    .then(() => {
      console.log('\n✅ Test hoàn thành thành công!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test thất bại:', error.message);
      process.exit(1);
    });
}

module.exports = { testConnection };