const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel");
const Sala = require("./salaModel");

const UserSala = sequelize.define(
  "UserSala",
  {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
      primaryKey: true,
    },
    sala_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Sala,
        key: "id",
      },
      onDelete: "CASCADE",
      primaryKey: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users_sala", // Nombre de la tabla en la base de datos
    timestamps: false, // Si no tienes createdAt y updatedAt
  }
);
UserSala.belongsTo(Sala, { foreignKey: "sala_id", as: "sala" });

UserSala.addUserSala = async (user_id, sala_id) => {
  // 1. Verificar si el usuario creó la sala
  const salaCreadaPorUsuario = await Sala.findOne({
    where: { id: sala_id, user_create: user_id },
  });

  // Si el usuario creó la sala, no se realiza ninguna acción
  if (salaCreadaPorUsuario) {
    return;
  }

  // 2. Verificar si la relación entre el usuario y la sala ya existe
  const userSalaExistente = await UserSala.findOne({
    where: { user_id, sala_id },
  });

  if (userSalaExistente) {
    // 3. Si la relación existe, actualizar el campo `is_active`
    userSalaExistente.is_active = true;
    await userSalaExistente.save();
    return "Relación activada";
  } else {
    // 4. Si no existe la relación, crearla
    const nuevaRelacion = await UserSala.create({
      user_id,
      sala_id,
    });
    return nuevaRelacion;
  }
};

UserSala.getAllSalasCompartidas = async (user_id) => {
  const salasCompartidas = await UserSala.findAll({
    where: { user_id: user_id, is_active: true },
    include: [
      {
        model: Sala,
        as: 'sala',
        attributes: ['id', 'title', 'description'],
        include: [
          {
            model: User, // Incluye el creador de la sala
            as: 'creador',
            attributes: ['nombre'], // Solo traemos el nombre del creador
          }
        ]
      }
    ]
  });
  
  // Mapeamos las salas al formato deseado
  const resultado = salasCompartidas.map(userSala => ({
    id: userSala.sala.id,
    title: userSala.sala.title,
    description: userSala.sala.description,
    creador: userSala.sala.creador.nombre
  }));
  //console.log(resutl);
  return resultado
};

UserSala.delSalaCompatida = async (user_id, sala_id) => {
  try {
    // Actualiza el campo is_active en la tabla users_sala
    const result = await UserSala.update(
      { is_active: false }, // Establece is_active en falso
      {
        where: {
          user_id: user_id,
          sala_id: sala_id,
        }
      }
    );
    
    return result; // Sequelize devuelve el número de filas afectadas
  } catch (error) {
    console.error('Error al actualizar sala compartida:', error);
    throw error;
  }
};

module.exports = UserSala;
