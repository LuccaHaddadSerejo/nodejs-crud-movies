import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "./database";
import { iMovie, movieResult } from "./interfaces";

const createMovie = async (req: Request, res: Response): Promise<Response> => {
  const queryString: string = format(
    `
        INSERT INTO
            movies(%I)
        VALUES
            (%L)
        RETURNING *;
    `,
    Object.keys(req.movies.movieData),
    Object.values(req.movies.movieData)
  );

  const queryResult: movieResult = await client.query(queryString);

  const newMovie: iMovie = queryResult.rows[0];

  return res.status(201).json(newMovie);
};

const getAllMovies = async (req: Request, res: Response) => {
  const queryString: string = `
    SELECT 
        *
    FROM
        movies
    `;

  const queryResult: movieResult = await client.query(queryString);

  return res.status(200).json(queryResult.rows);
};

export { createMovie, getAllMovies };
