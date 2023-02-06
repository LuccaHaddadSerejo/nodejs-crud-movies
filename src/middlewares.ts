import { NextFunction, Request, Response } from "express";
import { client } from "./database";
import { iMovie, iReqMovie, createdMovie } from "./types";

const checkIfMovieExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryString: string = `SELECT * FROM movies`;
  const queryResult = await client.query(queryString);
  const movies = queryResult.rows;

  const validationResult: createdMovie | undefined = movies.find(
    (movie: iMovie) => movie.id === +req.params.id
  );

  if (validationResult === undefined) {
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
  const queryString: string = `SELECT * FROM movies`;

  const queryResult = await client.query(queryString);

  const checkIfMovieAlreadyExists = (): createdMovie | undefined => {
    const movies = queryResult.rows;
    const validationResult: createdMovie | undefined = movies.find(
      (movie: iMovie) => movie.name === req.body.name
    );

    return validationResult;
  };

  if (checkIfMovieAlreadyExists() !== undefined) {
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
