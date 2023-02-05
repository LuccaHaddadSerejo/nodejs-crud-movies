import { Request, Response } from "express";
import format from "pg-format";
import { QueryConfig } from "pg";
import { client } from "./database";
import { iMovie, movieResult, iPaginationMoviesRes } from "./interfaces";

const createMovie = async (req: Request, res: Response): Promise<Response> => {
  const queryString: string = format(
    `
        INSERT INTO movies (%I)
        VALUES (%L)
        RETURNING *;
    `,
    Object.keys(req.movies.movieData),
    Object.values(req.movies.movieData)
  );

  const queryResult: movieResult = await client.query(queryString);

  const newMovie: iMovie = queryResult.rows[0];

  return res.status(201).json(newMovie);
};

const getAllMovies = async (req: Request, res: Response): Promise<Response> => {
  const checkPerPageValue = (param: any) => {
    if (param === undefined || param > 5 || param <= 0) {
      return 5;
    } else {
      return param;
    }
  };

  const checkPageValue = (param: any) => {
    if (param === undefined || param <= 0) {
      return 1;
    } else {
      return param;
    }
  };

  const perPage: any = checkPerPageValue(req.query.perPage);
  let page: any = checkPageValue(req.query.page);

  const queryString: string = `SELECT * FROM movies LIMIT $1 OFFSET $2`;
  const queryCount: string = `SELECT COUNT(*) FROM movies`;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [perPage, page],
  };

  const queryResult: movieResult = await client.query(queryConfig);
  const queryCountResult: any = await client.query(queryCount);

  const previousPage: string | null =
    +req.query.page! !== 0 ? +req.query.page! - 1 + "" : null;
  const nextPage: string = +req.query.page! + 1 + "";

  const getUrl = req.get("host");
  const itensRetrieved = queryResult.rows.length + (page * perPage - 1);
  const databaseItensCount = queryCountResult.rows[0].count;
  page = page * perPage;

  const treatedResult: iPaginationMoviesRes = {
    previousPage:
      page === undefined || 1
        ? null
        : `${getUrl}/movies?page=${previousPage}&perPage=${page}`,
    nextPage:
      databaseItensCount <= itensRetrieved
        ? null
        : `${getUrl}/movies?page=${nextPage}&perPage=${perPage}`,
    count: queryResult.rowCount,
    data: queryResult.rows,
  };

  return res.status(200).json(treatedResult);
};

export { createMovie, getAllMovies };
