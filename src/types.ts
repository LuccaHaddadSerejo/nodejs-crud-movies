import { QueryResult } from "pg";

interface iReqMovie {
  name: string;
  description?: string | null;
  duration: number;
  price: number;
}

interface iMovie extends iReqMovie {
  id: number;
}

interface iCompleteRes {
  previousPage: string | null;
  nextPage: string | null;
  count: number;
  data: iMovie[];
}

type createdMovie = Omit<iMovie, "id">;
type movieResult = QueryResult<iMovie>;

export { iReqMovie, iMovie, createdMovie, movieResult, iCompleteRes };
