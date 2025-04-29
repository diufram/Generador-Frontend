const User = require('./userModel');
const Sala = require('./salaModel');
const UserSala = require('./userSalaModel');

// Relación muchos a muchos entre User y Sala a través de UserSala
User.belongsToMany(Sala, { through: UserSala, foreignKey: 'user_id', as: 'salasCompartidas' });
Sala.belongsToMany(User, { through: UserSala, foreignKey: 'sala_id', as: 'usuarios' });

// Relación uno a muchos entre User y Sala (creador de la sala)
User.hasMany(Sala, { foreignKey: 'user_create', as: 'salasCreadas' });
Sala.belongsTo(User, { as: 'creador', foreignKey: 'user_create' });

// Exportar todos los modelos
module.exports = {
  User,
  Sala,
  UserSala,
};
