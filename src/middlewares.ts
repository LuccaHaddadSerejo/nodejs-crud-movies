import { NextFunction, Request, Response } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";
import { iMovie, iReqMovie, createdMovie, movieResult } from "./types";

const checkIfMovieExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryString: string = `
    SELECT 
        * 
    FROM 
        movies 
    WHERE 
        id = $1`;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [+req.params.id],
  };

  const queryResult: movieResult = await client.query(queryConfig);
  const foundMovie: iMovie = queryResult.rows[0];

  if (!foundMovie) {
    return res
      .status(404)
      .json({ message: "The movie you are looking for does not exists" });
  }

  return next();
};

const checkMovieName = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryString: string = `
    SELECT 
        * 
    FROM 
        movies`;

  const queryResult: movieResult = await client.query(queryString);

  const searchMovie: iMovie | undefined = queryResult.rows.find(
    (movie) => movie.name.toLowerCase() === req.body.name.toLowerCase()
  );

  if (searchMovie) {
    return res.status(409).json({ message: "This movie already exists" });
  }

  return next();
};

const checkDescriptionValue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const movieReq: iReqMovie = req.body;

  const checkIfDescriptionExists: number =
    Object.keys(movieReq).indexOf("description");

  const formatMovieData = (): createdMovie => {
    let dataRes = null;

    if (checkIfDescriptionExists !== -1) {
      const deposit: createdMovie = {
        ...movieReq,
      };
      dataRes = deposit;
    } else {
      const deposit: createdMovie = {
        ...movieReq,
        description: null,
      };
      dataRes = deposit;
    }
    return dataRes;
  };

  req.movies = {
    movieData: formatMovieData(),
  };

  return next();
};

export { checkMovieName, checkDescriptionValue, checkIfMovieExists };
