// const mongoose = require("mongoose");

// const chartDataSchema = new mongoose.Schema(
//   {
//     timestamp: { type: Date, default: Date.now },

//     // Nutrients
//     nitrogen: { type: Number, default: 0 },
//     phosphorus: { type: Number, default: 0 },
//     potassium: { type: Number, default: 0 },

//     // Environment
//     moisture: { type: Number, default: 0 },
//     temperature: { type: Number, default: 0 },
//     ph: { type: Number, default: 7.0 },
//   },
//   { _id: false },
// );

// const historySchema = new mongoose.Schema(
//   {
//     timestamp: { type: Date, default: Date.now },
//     title: { type: String },
//     description: { type: String },
//     aiPrediction: { type: Number },
//   },
//   { _id: false },
// );

// const soilSchema = new mongoose.Schema(
//   {
//     // User & Device
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     hardwareId: {
//       type: String,
//       required: true,
//       unique: true,
//     },

//     // Latest Sensor Values (REAL-TIME)
//     nitrogen: { type: Number, default: 0 },
//     phosphorus: { type: Number, default: 0 },
//     potassium: { type: Number, default: 0 },

//     moisture: { type: Number, default: 0 },
//     temperature: { type: Number, default: 0 },
//     ph: { type: Number, default: 7.0 },

//     // Time-series data for charts
//     chartData: [chartDataSchema],

//     // Logs / events
//     history: [historySchema],
//   },
//   {
//     timestamps: true, // createdAt, updatedAt
//   },
// );

// const Soil = mongoose.model("Soil", soilSchema);

// module.exports = Soil;

// const mongoose = require("mongoose");

// // ─── Sub-schemas ───

// const chartDataSchema = new mongoose.Schema(
//   {
//     timestamp: { type: Date, default: Date.now },

//     // Motor Metrics (Matches the MOTOR_DATA structure in the React component)
//     current: { type: Number, default: 0 }, // Amperes (A)
//     temperature: { type: Number, default: 0 }, // Celsius (°C)
//     vibration: { type: Number, default: 0 }, // mm/s
//     flow: { type: Number, default: 0 }, // L/min
//   },
//   { _id: false },
// );

// const historySchema = new mongoose.Schema(
//   {
//     timestamp: { type: Date, default: Date.now },
//     title: { type: String, trim: true, required: true },
//     description: { type: String, trim: true },
//     category: {
//       type: String,
//       enum: ["alert", "info", "action", "prediction"],
//       default: "info",
//     },
//   },
//   { _id: false },
// );

// // ─── Main Schema ───

// const motorSchema = new mongoose.Schema(
//   {
//     // User & Device Identification
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },
//     hardwareId: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },

//     // Device Metadata
//     deviceName: { type: String, default: "MotoX Unit" },
//     location: { type: String, trim: true, default: "" },
//     isActive: { type: Boolean, default: true },
//     lastSeen: { type: Date, default: Date.now },

//     // Power Logic State (Matches the "Power Logic" UI section)
//     isRunning: { type: Boolean, default: false },
//     lastStartTime: { type: Date }, // Used to calculate "Uptime"

//     // Latest Sensor Values (Real-time Cache for Metric Cards)
//     current: {
//       type: Number,
//       min: 0,
//       default: 0,
//     }, // Amperes
//     temperature: {
//       type: Number,
//       min: -20,
//       max: 150,
//       default: 0,
//     }, // Celsius
//     vibration: {
//       type: Number,
//       min: 0,
//       default: 0,
//     }, // mm/s
//     flow: {
//       type: Number,
//       min: 0,
//       default: 0,
//     }, // L/min

//     // Time-series data
//     chartData: [chartDataSchema],

//     // Logs / events (e.g., "Temperature threshold alert")
//     history: [historySchema],
//   },
//   {
//     timestamps: true, // createdAt, updatedAt
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   },
// );

// // ─── Indexes ───
// motorSchema.index({ userId: 1, isActive: -1 });

// // ─── Instance Methods ───

// /**
//  * Adds a new motor reading.
//  * Updates 'latest' fields, handles 'isRunning' state, and pushes to chart history.
//  */
// motorSchema.methods.addReading = function (data, options = {}) {
//   const { updateStateOnly = false } = options;

//   // 1. Update Latest Values
//   this.current = data.current ?? this.current;
//   this.temperature = data.temperature ?? this.temperature;
//   this.vibration = data.vibration ?? this.vibration;
//   this.flow = data.flow ?? this.flow;

//   this.lastSeen = new Date();

//   // 2. Update Power State Logic (Optional, if sensor confirms on/off)
//   if (data.isRunning !== undefined) {
//     // If state changed from false to true, record start time
//     if (data.isRunning === true && this.isRunning === false) {
//       this.lastStartTime = new Date();
//       // Add to history
//       this.history.push({
//         title: "System Started",
//         description: "Motor activated via toggle or scheduler",
//         category: "action",
//         timestamp: new Date(),
//       });
//     }
//     // If state changed from true to false
//     else if (data.isRunning === false && this.isRunning === true) {
//       // Add to history
//       this.history.push({
//         title: "System Stopped",
//         description: "Motor deactivated",
//         category: "action",
//         timestamp: new Date(),
//       });
//     }
//     this.isRunning = data.isRunning;
//   }

//   // 3. Check Thresholds (Matches Frontend Alerts)
//   const tempWarning = this.temperature >= 55;
//   const vibrationWarning = this.vibration > 3.0;

//   if (tempWarning) {
//     this.history.push({
//       title: "Temperature Alert",
//       description: `High temp detected: ${this.temperature}°C`,
//       category: "alert",
//     });
//   }

//   if (vibrationWarning) {
//     this.history.push({
//       title: "Vibration Alert",
//       description: `High vibration detected: ${this.vibration} mm/s`,
//       category: "alert",
//     });
//   }

//   // 4. Push to Chart Data (Skip if only updating state, e.g., Toggle button)
//   if (!updateStateOnly) {
//     // Limit array size (e.g., keep last 2000 points to prevent 16MB doc limit)
//     if (this.chartData.length >= 2000) {
//       this.chartData.shift();
//     }

//     this.chartData.push({
//       timestamp: data.timestamp || new Date(),
//       current: this.current,
//       temperature: this.temperature,
//       vibration: this.vibration,
//       flow: this.flow,
//     });
//   }

//   // Limit history size
//   if (this.history.length > 100) {
//     this.history.shift();
//   }

//   return this.save();
// };

// // Renamed model from 'Soil' to 'Motor' to match the MotoX context
// const Motor = mongoose.model("Motor", motorSchema);

// module.exports = Motor;

const mongoose = require("mongoose");

// ─── Sub-schemas ───

const chartDataSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },

    // Motor Metrics (Matches the MOTOR_DATA structure in the React component)
    current: { type: Number, default: 0 }, // Amperes (A)
    temperature: { type: Number, default: 0 }, // Celsius (°C)
    vibration: { type: Number, default: 0 }, // mm/s
    flow: { type: Number, default: 0 }, // L/min
  },
  { _id: false },
);

const historySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ["alert", "info", "action", "prediction"],
      default: "info",
    },
  },
  { _id: false },
);

// ─── Main Schema ───

const motorSchema = new mongoose.Schema(
  {
    // User & Device Identification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    hardwareId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Device Metadata
    deviceName: { type: String, default: "MotoX Unit" },
    location: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },

    // Power Logic State (Matches the "Power Logic" UI section)
    isRunning: { type: Boolean, default: false }, // Defaults to false on creation
    lastStartTime: { type: Date }, // Used to calculate "Uptime"

    // Latest Sensor Values (Real-time Cache for Metric Cards)
    current: {
      type: Number,
      min: 0,
      default: 0,
    }, // Amperes
    temperature: {
      type: Number,
      min: -20,
      max: 150,
      default: 0,
    }, // Celsius
    vibration: {
      type: Number,
      min: 0,
      default: 0,
    }, // mm/s
    flow: {
      type: Number,
      min: 0,
      default: 0,
    }, // L/min

    // Time-series data
    chartData: [chartDataSchema],

    // Logs / events (e.g., "Temperature threshold alert")
    history: [historySchema],
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ───
motorSchema.index({ userId: 1, isActive: -1 });

// ─── Instance Methods ───

/**
 * Adds a new motor reading.
 * Updates 'latest' fields, handles 'isRunning' state, and pushes to chart history.
 */
motorSchema.methods.addReading = function (data, options = {}) {
  const { updateStateOnly = false } = options;

  // 1. Update Latest Values
  this.current = data.current ?? this.current;
  this.temperature = data.temperature ?? this.temperature;
  this.vibration = data.vibration ?? this.vibration;
  this.flow = data.flow ?? this.flow;

  this.lastSeen = new Date();

  // 2. Update Power State Logic (Optional, if sensor confirms on/off)
  if (data.isRunning !== undefined) {
    // If state changed from false to true, record start time
    if (data.isRunning === true && this.isRunning === false) {
      this.lastStartTime = new Date();
      // Add to history
      this.history.push({
        title: "System Started",
        description: "Motor activated via toggle or scheduler",
        category: "action",
        timestamp: new Date(),
      });
    }
    // If state changed from true to false
    else if (data.isRunning === false && this.isRunning === true) {
      // Add to history
      this.history.push({
        title: "System Stopped",
        description: "Motor deactivated",
        category: "action",
        timestamp: new Date(),
      });
    }
    this.isRunning = data.isRunning;
  }

  // 3. Check Thresholds (Matches Frontend Alerts)
  const tempWarning = this.temperature >= 55;
  const vibrationWarning = this.vibration > 3.0;

  if (tempWarning) {
    this.history.push({
      title: "Temperature Alert",
      description: `High temp detected: ${this.temperature}°C`,
      category: "alert",
    });
  }

  if (vibrationWarning) {
    this.history.push({
      title: "Vibration Alert",
      description: `High vibration detected: ${this.vibration} mm/s`,
      category: "alert",
    });
  }

  // 4. Push to Chart Data (Skip if only updating state, e.g., Toggle button)
  if (!updateStateOnly) {
    // Limit array size (e.g., keep last 2000 points to prevent 16MB doc limit)
    if (this.chartData.length >= 2000) {
      this.chartData.shift();
    }

    this.chartData.push({
      timestamp: data.timestamp || new Date(),
      current: this.current,
      temperature: this.temperature,
      vibration: this.vibration,
      flow: this.flow,
    });
  }

  // Limit history size
  if (this.history.length > 100) {
    this.history.shift();
  }

  return this.save();
};

// Renamed model from 'Soil' to 'Motor' to match the MotoX context
const Motor = mongoose.model("Motor", motorSchema);

module.exports = Motor;
