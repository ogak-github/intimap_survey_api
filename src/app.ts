import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import meraukeRoutes from "./routes/merauke_routes";
import { swaggerDocumentation } from "./swagger";

const app = express();
const port = 3000;

app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(compression());
swaggerDocumentation(app);
app.use("/api", meraukeRoutes);


app.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}....`);
});
