import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import type { CreateInsight, Insight } from "$models/insight.ts";
import { withDB } from "../testing.ts";
import createInsight from "./create-insight.ts";
import { DatabaseError } from "../errors/DatabaseError.ts";

describe("creating insights in the database", () => {
  describe("valid insight data", () => {
    withDB((fixture) => {
      const insightData: CreateInsight = {
        brand: 1,
        text: "Test insight text",
      };

      let result: void;
      let insertedInsights: Insight[];

      beforeAll(() => {
        result = createInsight({ ...fixture, data: insightData });
        const rows = fixture.insights.selectAll();
        insertedInsights = rows.map((row) => ({
          ...row,
          createdAt: new Date(row.createdAt),
        }));
      });

      it("does not throw an error", () => {
        expect(result).toBeUndefined();
      });

      it("inserts the insight into the database", () => {
        expect(insertedInsights.length).toBe(1);
      });

      it("inserts insight with correct brand", () => {
        expect(insertedInsights[0].brand).toBe(insightData.brand);
      });

      it("inserts insight with correct text", () => {
        expect(insertedInsights[0].text).toBe(insightData.text);
      });

      it("inserts insight with valid id", () => {
        expect(insertedInsights[0].id).toBeGreaterThan(0);
      });

      it("inserts insight with valid createdAt date", () => {
        expect(insertedInsights[0].createdAt).toBeInstanceOf(Date);
        expect(insertedInsights[0].createdAt.getTime()).toBeGreaterThan(0);
      });
    });
  });

  describe("multiple insights", () => {
    withDB((fixture) => {
      const insightsData: CreateInsight[] = [
        { brand: 0, text: "First insight" },
        { brand: 1, text: "Second insight" },
        { brand: 2, text: "Third insight" },
      ];

      let insertedInsights: Insight[];

      beforeAll(() => {
        for (const data of insightsData) {
          createInsight({ ...fixture, data });
        }
        const rows = fixture.insights.selectAll();
        insertedInsights = rows.map((row) => ({
          ...row,
          createdAt: new Date(row.createdAt),
        }));
      });

      it("inserts all insights successfully", () => {
        expect(insertedInsights.length).toBe(insightsData.length);
      });

      it("each insight has unique id", () => {
        const ids = insertedInsights.map((insight) => insight.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });

      it("each insight has valid createdAt timestamp", () => {
        insertedInsights.forEach((insight) => {
          expect(insight.createdAt).toBeInstanceOf(Date);
          expect(insight.createdAt.getTime()).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("edge cases", () => {
    withDB((fixture) => {
      it("handles brand 0", () => {
        const insightData: CreateInsight = {
          brand: 0,
          text: "Brand 0 insight",
        };

        expect(() => {
          createInsight({ ...fixture, data: insightData });
        }).not.toThrow();

        const rows = fixture.insights.selectAll();
        const insertedInsights = rows.map((row) => ({
          ...row,
          createdAt: new Date(row.createdAt),
        }));
        expect(insertedInsights.length).toBe(1);
        expect(insertedInsights[0].brand).toBe(0);
      });
    });

    withDB((fixture) => {
      it("handles empty text", () => {
        const insightData: CreateInsight = {
          brand: 1,
          text: "",
        };

        expect(() => {
          createInsight({ ...fixture, data: insightData });
        }).not.toThrow();

        const rows = fixture.insights.selectAll();
        const insertedInsights = rows.map((row) => ({
          ...row,
          createdAt: new Date(row.createdAt),
        }));
        expect(insertedInsights.length).toBe(1);
        expect(insertedInsights[0].text).toBe("");
      });
    });

    withDB((fixture) => {
      it("handles long text", () => {
        const longText = "a".repeat(1000);
        const insightData: CreateInsight = {
          brand: 1,
          text: longText,
        };

        expect(() => {
          createInsight({ ...fixture, data: insightData });
        }).not.toThrow();

        const rows = fixture.insights.selectAll();
        const insertedInsights = rows.map((row) => ({
          ...row,
          createdAt: new Date(row.createdAt),
        }));
        expect(insertedInsights.length).toBe(1);
        expect(insertedInsights[0].text).toBe(longText);
      });
    });
  });

  describe("database errors", () => {
    withDB((fixture) => {
      it("throws DatabaseError when database operation fails", () => {
        // Mock a database failure by closing the connection
        fixture.db.close();

        const insightData: CreateInsight = {
          brand: 1,
          text: "Should fail",
        };

        expect(() => {
          createInsight({ ...fixture, data: insightData });
        }).toThrow(DatabaseError);
      });
    });
  });
});
