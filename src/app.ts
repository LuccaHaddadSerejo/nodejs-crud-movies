import express, { Application } from "express";
import { startDatabase } from "./database";
import { createMovie, deleteMovie, getAllMovies, patchMovie } from "./logic";
import {
  checkDescription,
  checkIfMovieExist,
  checkUniqueMovie,
} from "./middlewares";

const app: Application = express();

app.use(express.json());

app.post("/movies", checkUniqueMovie, checkDescription, createMovie);
app.get("/movies", getAllMovies);
app.delete("/movies/:id", checkIfMovieExist, deleteMovie);
app.patch("/movies/:id", checkIfMovieExist, checkUniqueMovie, patchMovie);

app.listen(3000, async () => {
  await startDatabase();
  console.log("Server is running");
});
