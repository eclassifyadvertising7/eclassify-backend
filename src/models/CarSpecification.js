import { DataTypes } from 'sequelize';
import sequelize from '#config/database.js';

const CarSpecification = sequelize.define(
  'CarSpecification',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'brand'
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'model'
    },
    variant: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'variant'
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'variant_id'
    },
    exShowroomPrice: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'ex_showroom_price'
    },
    // Engine Specifications
    displacementCc: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'displacement_cc'
    },
    cylinderCount: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'cylinder_count'
    },
    valvesPerCylinder: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'valves_per_cylinder'
    },
    maxPower: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'max_power'
    },
    maxTorque: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'max_torque'
    },
    engineLocation: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'engine_location'
    },
    fuelInjectionType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'fuel_injection_type'
    },
    // Transmission
    transmissionType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'transmission_type'
    },
    gearCount: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'gear_count'
    },
    drivetrainType: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'drivetrain_type'
    },
    // Fuel & Performance
    fuelType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'fuel_type'
    },
    fuelTankCapacity: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'fuel_tank_capacity'
    },
    mileageCity: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'mileage_city'
    },
    mileageArai: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'mileage_arai'
    },
    emissionStandard: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'emission_standard'
    },
    // Dimensions
    lengthMm: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'length_mm'
    },
    widthMm: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'width_mm'
    },
    heightMm: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'height_mm'
    },
    wheelBase: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'wheel_base'
    },
    groundClearance: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'ground_clearance'
    },
    kerbWeight: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'kerb_weight'
    },
    seatingCapacity: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'seating_capacity'
    },
    doorCount: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'door_count'
    },
    // Suspension & Brakes
    frontSuspensionType: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'front_suspension_type'
    },
    rearSuspensionType: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rear_suspension_type'
    },
    frontBrakeType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'front_brake_type'
    },
    rearBrakeType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'rear_brake_type'
    },
    // Wheels & Tyres
    frontTyreSize: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'front_tyre_size'
    },
    rearTyreSize: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'rear_tyre_size'
    },
    wheelSize: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'wheel_size'
    },
    // Steering & Additional Features
    powerSteering: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'power_steering'
    },
    powerWindows: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'power_windows'
    },
    odometerType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'odometer_type'
    },
    speedometerType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'speedometer_type'
    },
    // Additional Info
    bodyType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'body_type'
    },
    // Metadata for any additional fields
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'metadata'
    },
    // Audit fields
    createdBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'created_by'
    },
    updatedBy: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'updated_by'
    },
    deletedBy: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'deleted_by'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at'
    }
  },
  {
    sequelize,
    tableName: 'car_specifications',
    timestamps: true,
    paranoid: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    hooks: {
      beforeUpdate: async (instance, options) => {
        if (options.userId && options.userName) {
          const currentUpdates = instance.updatedBy || [];
          instance.updatedBy = [
            ...currentUpdates,
            {
              userId: options.userId,
              userName: options.userName,
              timestamp: new Date().toISOString()
            }
          ];
        }
      }
    }
  }
);

CarSpecification.associate = (models) => {
  CarSpecification.belongsTo(models.CarVariant, {
    foreignKey: 'variant_id',
    as: 'carVariant'
  });

  CarSpecification.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  CarSpecification.belongsTo(models.User, {
    foreignKey: 'deleted_by',
    as: 'deleter'
  });
};

export default CarSpecification;
