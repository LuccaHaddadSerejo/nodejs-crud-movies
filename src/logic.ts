import { query, Request, Response } from "express";
import { QueryConfig } from "pg";
import format, { config } from "pg-format";
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
  const perPage: any =
    req.query.perPage === undefined ||
    +req.query.perPage > 5 ||
    +req.query.perPage <= 0
      ? 5
      : req.query.perPage;

  const page: any =
    req.query.page === undefined || +req.query.page <= 0 ? 0 : req.query.page;

  const offset: number = page * perPage;

  const sort: string | undefined = req.query.sort + "";
  const order: string | undefined = req.query.order + "";
  const sortOptions: string[] = ["price", "duration"];
  const orderOptions: string[] = ["desc", "asc"];

  const queryCount: string = `SELECT COUNT(*) FROM movies`;

  let queryString: string = "";
  if (sort === undefined || sortOptions.includes(sort) === false) {
    queryString = format(
      `SELECT * FROM movies
       LIMIT %s 
       OFFSET %s;
      `,
      perPage,
      offset
    );
  } else if (
    sortOptions.includes(sort) &&
    orderOptions.includes(order) === false
  ) {
    queryString = format(
      `SELECT * FROM movies
      ORDER BY %s ASC
      LIMIT %s 
      OFFSET %s;
      `,
      sort,
      perPage,
      offset
    );
  } else {
    queryString = format(
      `SELECT * FROM movies
       ORDER BY %s %s
       LIMIT %s 
       OFFSET %s;
      `,
      sort,
      order,
      perPage,
      offset
    );
  }

  const queryStringResult: movieResult = await client.query(queryString);
  const queryCountResult = await client.query(queryCount);

  const previousPage: number | null = !Number.isNaN(+req.query.page!)
    ? +req.query.page! - 1
    : null;
  const nextPage: number = !Number.isNaN(+req.query.page!)
    ? +req.query.page! + 1
    : 1;

  const getUrl: string | undefined = req.get("host");
  const itensRetrieved: number = queryStringResult.rows.length + offset;
  const databaseItensCount: number = queryCountResult.rows[0].count;

  const treatedResult: iPaginationMoviesRes = {
    previousPage:
      page === undefined || page === 0
        ? null
        : `${getUrl}/movies?page=${previousPage}&perPage=${perPage}`,
    nextPage:
      databaseItensCount <= itensRetrieved
        ? null
        : `${getUrl}/movies?page=${nextPage}&perPage=${perPage}`,
    count: queryStringResult.rowCount,
    data: queryStringResult.rows,
  };

  return res.status(200).json(treatedResult);
};

const patchMovie = async (req: Request, res: Response): Promise<Response> => {
  const id: number = +req.params.id;
  const data = Object.values(req.body);
  const keys = Object.keys(req.body);

  const queryString: string = format(
    `
      UPDATE
        movies
      SET (%I) = ROW(%L)
      WHERE
        id = $1
      RETURNING *;
  `,
    keys,
    data,
    id
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: movieResult = await client.query(queryConfig);

  return res.status(200).json(queryResult.rows[0]);
};

const deleteMovie = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id;
  const querString = `DELETE FROM movies WHERE id = %s RETURNING *;`;
  const queryConfig: QueryConfig = {
    text: querString,
    values: [id],
  };
  await client.query(queryConfig);
  return res.status(204).json();
};

export { createMovie, getAllMovies, deleteMovie, patchMovie };
