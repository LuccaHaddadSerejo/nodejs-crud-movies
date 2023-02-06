import { NextFunction, Request, Response } from "express";
import { client } from "./database";
import { iMovie, iReqMovie, movieCreate } from "./interfaces";

const checkIfMovieExist = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryString: string = `SELECT * FROM movies`;
  const queryResult = await client.query(queryString);
  const movies = queryResult.rows;

  const validationResult: movieCreate | undefined = movies.find(
    (movie: iMovie) => movie.id === +req.params.id
  );

  if (validationResult === undefined) {
    return res.status(404).json({ message: "Movie dont exist" });
  }

  return next();
};

const checkUniqueMovie = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryString: string = `SELECT * FROM movies`;

  const queryResult = await client.query(queryString);

  const checkIfMovieAlreadyExists = (): movieCreate | undefined => {
    const movies = queryResult.rows;
    const validationResult: movieCreate | undefined = movies.find(
      (movie: iMovie) => movie.name === req.body.name
    );

    return validationResult;
  };

  if (checkIfMovieAlreadyExists() !== undefined) {
    return res.status(409).json({ message: "Movie already exist" });
  }

  return next();
};

const checkDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const movieReq: iReqMovie = req.body;

  const checkIfDescriptionExists: number =
    Object.keys(movieReq).indexOf("description");

  const formatMovieData = (): movieCreate => {
    let dataRes = null;

    if (checkIfDescriptionExists !== -1) {
      const deposit: movieCreate = {
        ...movieReq,
      };
      dataRes = deposit;
    } else {
      const deposit: movieCreate = {
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

export { checkUniqueMovie, checkDescription, checkIfMovieExist };
