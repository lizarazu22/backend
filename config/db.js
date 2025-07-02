const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'ignacio', // 👈 Esto especifica la base que querés usar
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado');
  } catch (err) {
    console.error(err);
    process.exit(1); // Salir de la aplicación si falla la conexión
  }
};

module.exports = connectDB;
