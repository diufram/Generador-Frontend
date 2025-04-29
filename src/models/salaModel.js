const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel"); // Relación con User

const Sala = sequelize.define(
  "Sala",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    diagram: {
      type: DataTypes.JSON,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    user_create: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "salas",
    timestamps: false,
  }
);

Sala.belongsTo(User, { as: 'creador', foreignKey: 'user_create' });


// Métodos estáticos
Sala.getSala = async function (sala_id) {
  return await this.findAll({
    where: {
      id: sala_id,
      is_active: true,
    },
  });
};

Sala.editSala = async function (title, description, id) {
  const result = await this.update(
    {
      title, // Asigna el nuevo valor del título
      description, // Asigna el nuevo valor de la descripción
    },
    {
      where: { id: id }, // Condición para identificar la sala a actualizar
    }
  );
  return result[0] > 0
    ? "Sala actualizada exitosamente"
    : "No se encontró la sala";
};

Sala.delSala = async function (sala_id) {
  // Usar Sequelize para actualizar el campo `is_active`
  const result = await Sala.update(
    { is_active: false }, // Cambia el campo `is_active` a false
    {
      where: { id: sala_id }, // Condición para identificar la sala a actualizar
    }
  );

  // `result` es un array donde el primer valor es el número de filas afectadas
  return result[0] > 0
    ? "Sala desactivada exitosamente"
    : "No se encontró la sala";
};

// Crear una nueva sala
Sala.createSala = async function (title, description, user_create) {
  const sala = await this.create({ title, description, user_create });
  return sala.id; // Devuelve el id de la sala creada
};

// Obtener todas las salas de un usuario
Sala.getAllSalasUser = async function (user_id) {
  return await this.findAll({
    where: {
      user_create: user_id,
      is_active: true,
    },
  });
};



// Obtener el diagrama de una sala
Sala.getDiagrama = async function (sala_id) {
  const sala = await this.findOne({
    where: { id: sala_id },
    attributes: ["diagram"],
  });
  return sala ? sala.diagram : null;
};

// Guardar un nuevo diagrama para una sala
Sala.saveDiagrama = async function (sala_id, diagrama) {
  const sala = await this.findOne({ where: { id: sala_id } });
  if (sala) {
    sala.diagram = diagrama;
    await sala.save(); // Guardar los cambios
    return sala;
  }
  return null;
};

module.exports = Sala;
