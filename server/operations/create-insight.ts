import type { HasDBClient } from "../shared.ts";
import type * as insightsTable from "$tables/insights.ts";
import { DatabaseError } from "../errors/DatabaseError.ts";
import type { CreateInsight } from "$models/insight.ts";
import console from "node:console";

type Input = HasDBClient & {
  data: CreateInsight;
};

export default (input: Input) => {
  const { 
    brand,
    text
  } = input.data;

  const createdAt = new Date();

  const createdAtString = createdAt.toISOString();

  try {
    input.db.sql<insightsTable.Row>`
      INSERT OR IGNORE INTO insights 
      (brand, createdAt, text) 
      VALUES (${brand}, ${createdAtString}, ${text});
    `;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new DatabaseError(errorMessage, error);
  }

  console.log("inserted new insight into db");
}