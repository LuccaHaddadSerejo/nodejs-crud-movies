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

export { iReqMovie, iMovie, movieCreate, movieResult };
