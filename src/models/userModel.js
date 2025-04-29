const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: false,
});



// Definir métodos estáticos
User.createUser = async function (nombre, correo, password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  const user = await this.create({ nombre, correo, password: hashedPassword });
  return user.dataValues;
};

User.getAllUsers = async function () {
  return await this.findAll({
    attributes: ['id', 'nombre', 'correo']
  });
};

User.authenticateUser = async (correo, password) => {
  // 1. Buscar el usuario por correo electrónico
  const user = await User.findOne({
    where: { correo }
  });

  // 2. Si no se encuentra el usuario, lanzar un error
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // 3. Comparar la contraseña proporcionada con la almacenada en la base de datos
  const isMatch = await bcrypt.compare(password, user.password);

  // 4. Si la contraseña no coincide, lanzar un error
  if (!isMatch) {
    throw new Error('Contraseña incorrecta');
  }

  // 5. Retornar los datos del usuario si la autenticación es exitosa
  return {
    user: {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
    }
  };
};

module.exports = User;
