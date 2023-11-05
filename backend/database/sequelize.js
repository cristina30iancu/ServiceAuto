import Sequelize from "sequelize";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/auto.db',
    define: {
        timestamps: false
    }
});

export const Users = sequelize.define("Users", {
    UserID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    Username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: {
            args: true,
            msg: 'User already exists'
        },
        validate: {
            isAlphanumeric: true,
            isLowercase: true
        }
    },
    Firstname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Lastname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: {
                min: 4,
                msg: "Password must be at least 4 character long"
            }
        }
    },
    Email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isEmail: {
                args: true,
                msg: "Please enter a valid email address"
            }
        }
    },
    Role: {
        type: Sequelize.ENUM,
        values: ['admin', 'customer'],
        defaultValue: 'customer'
    }

}, {
    timestamps: false
})

export const Vehicles = sequelize.define("Vehicles", {
    VehicleID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: true
    },
    Make: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Model: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Year: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    Fuel: {
        type: Sequelize.ENUM,
        values: ['Diesel', 'Benzină', 'Biodiesel', 'Ethanol', 'Hybrid', 'Electric'],
        defaultValue: 'Diesel'
    }
}, {
    timestamps: false
})

Users.hasMany(Vehicles, { foreignKey: 'UserID', foreignKeyConstraint: true });

export const Appointments = sequelize.define("Appointments", {
    AppointmentID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Date: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    Time: {
        type: Sequelize.TIME,
        allowNull: false
    },
    Status: {
        type: Sequelize.ENUM,
        values: ['În așteptare','Plătită', 'Acceptată', 'Anulată'],
        defaultValue: 'În așteptare'
    }

}, {
    timestamps: false
})

export const Services = sequelize.define('Services', {
    ServiceID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Price: {
        type: Sequelize.FLOAT,
        allowNull: false
    }
});

Services.belongsToMany(Appointments, {
    through: 'AppointmentService',
    as: 'appointments',
    foreignKey: 'ServiceID'
});
Appointments.belongsToMany(Services, {
    through: 'AppointmentService',
    as: 'services',
    foreignKey: 'AppointmentID'
});

Vehicles.hasMany(Appointments, { foreignKey: "VehicleID", foreignKeyConstraint: true });
Appointments.belongsTo(Vehicles,{ foreignKey: "VehicleID", foreignKeyConstraint: true });

export const Payments = sequelize.define('Payments', {
    PaymentID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Amount: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    Date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    Type: {
        type: Sequelize.ENUM,
        values: ['Cash','Credit', 'Debit', 'PayPal', 'Bank Transfer'],
        allowNull: false,
        defaultValue: 'Cash'
    }
  });
  
Appointments.hasMany(Payments, {foreignKey: "AppointmentID", foreignKeyConstraint:true});
  
sequelize.authenticate()
    .then(() => {
        console.log("Connected to the database")
    })
    .catch(err => console.log("Unable to connect to the database " + err));

sequelize
    .sync({ force: false, alter: false })
    .then(() => { console.log("Sync complete!") })
    .catch(err => console.log("Error at creating:" + err));