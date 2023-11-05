import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
const app = express();
import userRoutes from "./routes/userRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import servicesRoutes from "./routes/servicesRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use("/users", userRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/services", servicesRoutes);
app.use("/payments",paymentRoutes);

userRoutes.use((request, response, next) => {
    next();
});
vehicleRoutes.use((request, response, next) => {
    next();
});
appointmentRoutes.use((request, response, next) => {
    next();
});
servicesRoutes.use((request, response, next) => {
    next();
});
paymentRoutes.use((request, response, next) => {
    next();
});

// starting the server
let PORT = 8080;
app.listen(PORT, () => {
    console.log(`Application is listening to port: ${PORT}`)
});