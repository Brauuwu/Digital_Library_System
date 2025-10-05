#!/usr/bin/env node
// usage: node hash_password.js --id 2 --password "newpass"
// or:    node hash_password.js --email user@domain --password "newpass"

const path = require('path');
const bcrypt = require('bcrypt');

function parseArg(name){
  const idx = process.argv.findIndex(a=>a===name);
  if(idx===-1) return undefined;
  return process.argv[idx+1];
}

const id = parseArg('--id');
const email = parseArg('--email');
const password = parseArg('--password');

if(!password){
  console.error('Missing --password argument');
  process.exit(2);
}
if(!id && !email){
  console.error('Provide --id or --email to identify the user');
  process.exit(2);
}

(async ()=>{
  try{
    // require the project's models (adjust path if your setup differs)
    const modelsPath = path.join(__dirname, 'src', 'models');
    const models = require(modelsPath);
    const { User } = models;
    if(!User) throw new Error('Could not load User model from ' + modelsPath);

    let user;
    if(id){
      user = await User.findByPk(id);
    }else{
      user = await User.findOne({ where: { Email: email } });
    }
    if(!user){
      console.error('User not found');
      process.exit(3);
    }

    const hash = await bcrypt.hash(password, 10);
    await user.update({ Password: hash });
    console.log(`Updated password for user ${user.Email || user.ID_NguoiDung}`);
    process.exit(0);
  }catch(err){
    console.error('Error:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
