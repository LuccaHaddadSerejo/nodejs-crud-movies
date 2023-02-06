import express, { Application } from "express";
import { startDatabase } from "./database";
import { createMovie, deleteMovie, getAllMovies, patchMovie } from "./logic";
import {
  checkDescriptionValue,
  checkIfMovieExists,
  checkMovieName,
} from "./middlewares";

const app: Application = express();

app.use(express.json());

app.post("/movies", checkMovieName, checkDescriptionValue, createMovie);
app.get("/movies", getAllMovies);
app.delete("/movies/:id", checkIfMovieExists, deleteMovie);
app.patch("/movies/:id", checkIfMovieExists, checkMovieName, patchMovie);

app.listen(3000, async () => {
  await startDatabase();
  console.log("Server is running");
});
