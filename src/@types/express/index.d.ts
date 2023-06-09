import * as express from "express";
import { movieCreate } from "../../types";
import { iHandledList, iListData } from "../../types";

declare global {
  namespace Express {
    interface Request {
      movies: {
        movieData: movieCreate;
      };
    }
  }
}
