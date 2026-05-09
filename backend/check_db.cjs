const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://ynhyopxrrpiqiqeljkqy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7PhNUjsqgqNJc_YTbZljcQ_dFQdNfdF';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkConnection() {
  console.log('Checking Supabase connection...');
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
      console.error('Error fetching products:', error.message);
      if (error.code === '42P01') {
        console.log('Recommendation: The table "products" does not exist. Run supabase_schema.sql in the Supabase Dashboard.');
      }
    } else {
      console.log('Successfully connected to "products" table. Data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

checkConnection();
