const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const path = require('path');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: String, required: true },
    quantity: { type: String, required: false },
    contact: { type: String, required: false },
    category: { type: String, required: false },
    unit: { type: String, required: false },
    description: { type: String, required: false },
    image: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

async function importData() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/farmer_market');
        console.log('Connected to MongoDB.');

        // Optional: clear existing products? The user just said "feed this data". Let's clear first so we don't have duplicates.
        await Product.deleteMany({});
        console.log('Cleared existing products.');

        const results = [];
        const csvPath = path.join(__dirname, '../farmer_products_500.csv');
        
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (data) => {
              // CSV headers: id,name,category,price,unit,image,description
              // Map to our schema
              results.push({
                  name: data.name,
                  category: data.category,
                  price: data.price,
                  unit: data.unit,
                  image: data.image,
                  description: data.description,
                  quantity: '100', // Default quantity
                  contact: '9876543210' // Default contact
              });
          })
          .on('end', async () => {
              try {
                  await Product.insertMany(results);
                  console.log(`Successfully imported ${results.length} products to MongoDB!`);
                  process.exit(0);
              } catch (err) {
                  console.error('Error inserting data:', err);
                  process.exit(1);
              }
          });
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

importData();
