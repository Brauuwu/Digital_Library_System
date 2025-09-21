const { Book, sequelize } = require('./src/models');

(async ()=>{
  try{
    await sequelize.authenticate();
    console.log('DB connected');
    const books = await Book.findAll({ limit: 1 });
    if(!books || books.length===0){ console.log('No books found'); return; }
    const b = books[0];
    console.log('Found book id=', b.ID_Sach, 'SoLuongCon=', b.SoLuongCon, 'type=', typeof b.SoLuongCon);
    try{
      const upd = await b.update({ SoLuongCon: 5 });
      console.log('Update success:', upd.toJSON());
    }catch(err){
      console.error('Update error name=', err.name);
      if(err.errors && Array.isArray(err.errors)){
        console.error('Validation messages:', err.errors.map(e=>e.message));
      }
      console.error(err);
    }
  }catch(e){
    console.error('Fatal', e);
  }finally{
    await sequelize.close();
  }
})();