const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// NOTE: You must download your Service Account Key from Firebase Console:
// Project Settings > Service accounts > Generate new private key
// Save it as 'serviceAccountKey.json' in this folder.
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Error: serviceAccountKey.json not found!');
    console.log('Please download it from Firebase Console and place it in the backend folder.');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importData() {
    const results = [];
    const csvPath = path.join(__dirname, '../farmer_products_500.csv');
    
    console.log('📖 Reading CSV...');
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
          results.push({
              name: data.name,
              category: data.category,
              price: parseFloat(data.price) || 0,
              unit: data.unit || 'kg',
              image_url: data.image || null,
              description: data.description || '',
              stock_quantity: 100,
              farmer_id: 'SYSTEM_GEN', // Placeholder
              created_at: admin.firestore.FieldValue.serverTimestamp()
          });
      })
      .on('end', async () => {
          console.log(`🚀 Importing ${results.length} products...`);
          
          const batch = db.batch();
          results.forEach((product) => {
              const docRef = db.collection('products').doc();
              batch.set(docRef, product);
          });
          
          try {
              await batch.commit();
              console.log('✅ Successfully imported all products to Firestore!');
              process.exit(0);
          } catch (err) {
              console.error('❌ Error importing to Firestore:', err);
              process.exit(1);
          }
      });
}

importData();
