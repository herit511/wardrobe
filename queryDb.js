require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Item = mongoose.model('Item', new mongoose.Schema({}, {strict:false, collection:'items'}));
  const badItems = await Item.find({_id: {$in: [
    '69b454f5d054fec5e90b0d95', 
    '69bbc062da30c4edc8bdd22b', 
    '69b45abc5b1b1498ef5b3c85', 
    '69b7ee4949741a073c8cad0d', 
    '69b7f9f3701dc13751ceaebe'
  ]}});
  console.log(JSON.stringify(badItems.map(i => i.toObject()), null, 2));
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
