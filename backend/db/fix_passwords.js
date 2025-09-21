const { sequelize, User } = require('../src/models');
const bcrypt = require('bcrypt');

async function run(){
  await sequelize.authenticate();
  const users = await User.findAll();
  for(const u of users){
    const pw = u.Password || '';
    if(!pw.startsWith('$2')){ // not bcrypt
      const hash = await bcrypt.hash(pw, 10);
      u.Password = hash;
      await u.save();
      console.log(`Updated password for ${u.Email}`);
    } else {
      console.log(`Already hashed: ${u.Email}`);
    }
  }
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
