require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Item = mongoose.model('Item', new mongoose.Schema({}, {strict:false, collection:'items'}));
  
  // 1. Un-laundry all footwear & accessories
  const res1 = await Item.updateMany(
    { category: { $in: ['footwear', 'accessories'] } },
    { $set: { isLaundry: false, wearCount: 0 } }
  );
  console.log('Laundry fix applied:', res1);

  // 2. Fix 'streetwear' occasions (which crash Mongoose save due to enum validation)
  const res2 = await Item.updateMany(
    { occasion: 'streetwear' },
    { $set: { 'occasion.$[elem]': 'casual' } },
    { arrayFilters: [ { 'elem': 'streetwear' } ] }
  );
  console.log('Occasion validation fix applied:', res2);

  // Note: if an item now has duplicate "casual" strings in the array, Mongoose allows it, but we can set distinct later.
  
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
