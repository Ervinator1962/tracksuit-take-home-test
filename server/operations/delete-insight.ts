import type { HasDBClient } from "../shared.ts";
import { DatabaseError } from "../errors/DatabaseError.ts";
import type { DeleteInsight } from "$models/insight.ts";
import console from "node:console";

type Input = HasDBClient & {
  data: DeleteInsight;
};

export default (input: Input) => {
  const { 
    id
  } = input.data;

  try {
    const deleteStmt = input.db.prepare("DELETE FROM insights WHERE id = ?");
    deleteStmt.run(id);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new DatabaseError(errorMessage, error);
  }

  console.log("deleted insight from db");
}