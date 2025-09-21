require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const borrowRoutes = require('./routes/borrows');
const authorRoutes = require('./routes/authors');
const publisherRoutes = require('./routes/publishers');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/borrows', borrowRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/publishers', publisherRoutes);

const PORT = process.env.PORT || 4000;

async function start(){
  try{
    await sequelize.authenticate();
    console.log('DB connected');
  await sequelize.sync({ alter: true });
  // bind to 0.0.0.0 explicitly so IPv4 loopback (127.0.0.1) works on Windows
  app.listen(PORT, '0.0.0.0', ()=>console.log(`Server running on ${PORT} (bound to 0.0.0.0)`));
  }catch(err){
    console.error(err);
  }
}

start();
