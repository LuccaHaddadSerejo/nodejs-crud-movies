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

type movieCreate = Omit<iMovie, "id">;
type movieResult = QueryResult<iMovie>;

interface iPaginationMoviesRes {
  previousPage: string | null;
  nextPage: string | null;
  count: number;
  data: iMovie[];
}

export { iReqMovie, iMovie, movieCreate, movieResult, iPaginationMoviesRes };
