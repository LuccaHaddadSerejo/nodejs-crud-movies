import * as express from "express";
import { movieCreate } from "../../interfaces";
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
