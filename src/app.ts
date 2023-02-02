import express, { Application } from "express";
import { startDatabase } from "./database";
import { createMovie, getAllMovies } from "./logic";
import { checkDescription, checkUniqueMovie } from "./middlewares";

const app: Application = express();
app.use(express.json());

app.post("/movies", checkUniqueMovie, checkDescription, createMovie);
app.get("/movies", getAllMovies);

app.listen(3000, async () => {
  await startDatabase();
  console.log("Server is running");
});
