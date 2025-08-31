// deno-lint-ignore-file no-explicit-any
import { Database } from "@db/sqlite";
import * as oak from "@oak/oak";
import * as path from "@std/path";
import { Port } from "../lib/utils/index.ts";
import listInsights from "./operations/list-insights.ts";
import lookupInsight from "./operations/lookup-insight.ts";
import createInsight from "./operations/create-insight.ts";
import deleteInsight from "./operations/delete-insight.ts";
import { createTable } from "./tables/insights.ts";
import console from "node:console";
import { Insight } from "$models/insight.ts";
import z from "zod";
import { setTimeout } from "node:timers";

console.log("Loading configuration");

const env = {
  port: Port.parse(Deno.env.get("SERVER_PORT")),
};

let db: Database;

const router = new oak.Router();

router.get("/_health", (ctx) => {
  ctx.response.body = "OK";
  ctx.response.status = 200;
});

router.get("/insights", (ctx: oak.Context) => {
  console.log("we hit the insights endpoint");
  const result = listInsights({ db });

  const schema = z.array(Insight);
  const parsed = schema.safeParse(result);

  ctx.assert(parsed.success, 500, "Invalid response from listInsights: " + parsed.error?.message);

  ctx.response.body = result;
  ctx.response.status = 200;
  console.log("we finished calling insights")
});

router.get("/insights/:id", (ctx: oak.Context) => {
  const params = ctx.params;

  const parse = z.object({
    id: z.coerce.number()
  }).safeParse(params);

  ctx.assert(parse.success, 400, "Invalid request body: " + parse.error?.message);

  const result = lookupInsight({ db, id: parse.data.id });

  ctx.response.body = result;
  ctx.response.status = 200;
});

router.post("/insights/create", async (ctx: oak.Context) => {
  console.log("creating insight");

  const json = await ctx.request.body.json();

  const schema = z.object({
    brand: z.coerce.number().int().min(0),
    text: z.string(),
  });
  
  const parse = schema.safeParse(json);

  ctx.assert(parse.success, 400, "Invalid request body: " + parse.error?.message);
  
  const params = parse.data;
  
  try {
    createInsight({ db, data: params });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.response.body = {
      "error": errorMessage
    };
    ctx.response.status = 500;
    return;
  }

  ctx.response.body = { 
    "message": "Insight created"
  };
  ctx.response.status = 200;
});

router.post("/insights/:id/delete", (ctx: oak.Context) => {
  console.log("deleting insight");
  const params = ctx.params;

  const parse = z.object({
    id: z.coerce.number()
  }).safeParse(params);

  ctx.assert(parse.success, 400, "Invalid request body: " + parse.error?.message);

  try {
    deleteInsight({ db, data: { id: parse.data.id } });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    ctx.response.body = {
      "error": errorMessage
    };
    
    ctx.response.status = 400;
    return;
  }

  ctx.response.body = {
    "message": "Insight deleted"
  };
  ctx.response.status = 200;
});

router.post("/data", async (ctx) => {
  // Simulate an asynchronous operation, e.g., fetching data from a database
  const data = await new Promise((resolve) => setTimeout(() => resolve("Hello from async handler!"), 1000));
  ctx.response.body = data as string;
});

async function setUpDB() {
  const dbFilePath = path.resolve("tmp", "db.sqlite3");
  
  console.log(`Opening SQLite database at ${dbFilePath}`);
  
  await Deno.mkdir(path.dirname(dbFilePath), { recursive: true });
  db = new Database(dbFilePath);
  db.exec(createTable);
};

async function setupApp() {
  console.log("Initialising server");
  await setUpDB();

  const app = new oak.Application();
  
  app.use(router.routes());
  app.use(router.allowedMethods());
  
  await app.listen({
    port: env.port,
  });

  console.log(`Started server on port ${env.port}`);
}

setupApp();
