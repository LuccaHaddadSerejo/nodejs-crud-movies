import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "./database";
import { iMovie, movieResult, iCompleteRes } from "./types";

const createMovie = async (req: Request, res: Response): Promise<Response> => {
  const dataKeys = Object.keys(req.movies.movieData);
  const dataValues = Object.values(req.movies.movieData);
  const queryString: string = format(
    `
      INSERT INTO movies (%I)
      VALUES (%L)
      RETURNING *;
    `,
    dataKeys,
    dataValues
  );

  const queryResult: movieResult = await client.query(queryString);

  const newMovie: iMovie = queryResult.rows[0];

  return res.status(201).json(newMovie);
};

const getAllMovies = async (req: Request, res: Response): Promise<Response> => {
  const getPage = () => {
    let page: number = 1;
    let requestDeposit: any = undefined;
    if (req.query.page !== undefined && typeof req.query.page !== typeof 1) {
      requestDeposit = +req.query.page;
    }
    if (Number.isNaN(requestDeposit) || requestDeposit <= 0) {
      page = 1;
    } else {
      page = requestDeposit;
    }
    return page;
  };

  const getPerPage = () => {
    let perPage: number = 5;
    let requestDeposit: any = undefined;
    if (
      req.query.perPage !== undefined &&
      typeof req.query.perPage !== typeof 5
    ) {
      requestDeposit = +req.query.perPage;
    }
    if (Number.isNaN(requestDeposit) || requestDeposit <= 0) {
      perPage = 5;
    } else {
      perPage = requestDeposit;
    }
    return perPage;
  };

  const page: number = getPage();
  const perPage: number = getPerPage();
  const offset: number = perPage * (page - 1);

  const sort: string | undefined = req.query.sort + "";
  const order: string | undefined = req.query.order + "";
  const sortOptions: string[] = ["price", "duration"];
  const orderOptions: string[] = ["desc", "asc"];

  const queryCount: string = `SELECT COUNT(*) FROM movies`;

  let queryString: string = "";
  if (sort === undefined || sortOptions.includes(sort) === false) {
    queryString = format(
      `
      SELECT * FROM movies
      LIMIT (%s) 
      OFFSET (%s);
      `,
      perPage,
      offset
    );
  } else if (
    sortOptions.includes(sort) &&
    orderOptions.includes(order) === false
  ) {
    queryString = format(
      `
      SELECT * FROM movies
      ORDER BY %s ASC
      LIMIT (%s) 
      OFFSET (%s);
      `,
      sort,
      perPage,
      offset
    );
  } else {
    queryString = format(
      `
      SELECT * FROM movies
      ORDER BY %s %s
      LIMIT (%s) 
      OFFSET (%s);
      `,
      sort,
      order,
      perPage,
      offset
    );
  }

  const queryStringResult: movieResult = await client.query(queryString);
  const queryCountResult = await client.query(queryCount);

  const previousPage: number | null = page - 1;
  const nextPage: number = page + 1;

  const getUrl: string | undefined = req.get("host");
  const rowsRetrieved: number = queryStringResult.rows.length + offset;
  const databaseRowsCount: number = queryCountResult.rows[0].count;

  const completeResult: iCompleteRes = {
    previousPage:
      page === undefined || page === 1
        ? null
        : `${getUrl}/movies?page=${previousPage}&perPage=${perPage}`,
    nextPage:
      databaseRowsCount <= rowsRetrieved
        ? null
        : `${getUrl}/movies?page=${nextPage}&perPage=${perPage}`,
    count: queryStringResult.rowCount,
    data: queryStringResult.rows,
  };

  return res.status(200).json(completeResult);
};

const patchMovie = async (req: Request, res: Response): Promise<Response> => {
  const id: number = +req.params.id;
  const dataKeys = Object.keys(req.body);
  const dataValues = Object.values(req.body);

  const queryString: string = format(
    `
    UPDATE movies
    SET (%I) = ROW(%L)
    WHERE id = $1
    RETURNING *;
    `,
    dataKeys,
    dataValues,
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
  const queryString = `DELETE FROM movies WHERE id = $1 RETURNING *;`;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  await client.query(queryConfig);
  return res.status(204).json();
};

export { createMovie, getAllMovies, deleteMovie, patchMovie };
