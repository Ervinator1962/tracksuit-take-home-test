import { expect } from "jsr:@std/expect";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import type { DeleteInsight, Insight } from "$models/insight.ts";
import { withDB } from "../testing.ts";
import deleteInsight from "./delete-insight.ts";
import { DatabaseError } from "../errors/DatabaseError.ts";

describe("deleting insights from the database", () => {
  describe("existing insight", () => {
    withDB((fixture) => {
      const insightData = {
        brand: 1,
        text: "Test insight to delete",
        createdAt: new Date().toISOString(),
      };

      let result: void;
      let insightsBeforeDelete: Insight[];
      let insightsAfterDelete: Insight[];

      beforeAll(() => {
        // Insert an insight first
        fixture.insights.insert([insightData]);
        
        // Get insights before deletion
        const rowsBefore = fixture.insights.selectAll();
        insightsBeforeDelete = rowsBefore.map((row) => ({
          ...row,
          createdAt: new Date(row.createdAt),
        }));

        // Delete the insight
        const deleteData: DeleteInsight = { id: insightsBeforeDelete[0].id };
        result = deleteInsight({ ...fixture, data: deleteData });

        // Get insights after deletion
        const rowsAfter = fixture.insights.selectAll();
        insightsAfterDelete = rowsAfter.map((row) => ({
          ...row,
          createdAt: new Date(row.createdAt),
        }));
      });

      it("does not throw an error", () => {
        expect(result).toBeUndefined();
      });

      it("removes the insight from the database", () => {
        expect(insightsAfterDelete.length).toBe(insightsBeforeDelete.length - 1);
      });

      it("deletes the correct insight by id", () => {
        const deletedId = insightsBeforeDelete[0].id;
        const insightStillExists = insightsAfterDelete.some(
          (insight) => insight.id === deletedId
        );
        expect(insightStillExists).toBe(false);
      });
    });
  });

  describe("multiple insights deletion", () => {
    withDB((fixture) => {
      const insightsData = [
        { brand: 0, text: "First insight", createdAt: new Date().toISOString() },
        { brand: 1, text: "Second insight", createdAt: new Date().toISOString() },
        { brand: 2, text: "Third insight", createdAt: new Date().toISOString() },
      ];

      let insightsBeforeDelete: Insight[];
      let insightsAfterDelete: Insight[];

      beforeAll(() => {
        // Insert multiple insights
        fixture.insights.insert(insightsData);
        
        // Get insights before deletion
        const rowsBefore = fixture.insights.selectAll();
        insightsBeforeDelete = rowsBefore.map((row) => ({
          ...row,
          createdAt: new Date(row.createdAt),
        }));

        // Delete the first insight
        const deleteData: DeleteInsight = { id: insightsBeforeDelete[0].id };
        deleteInsight({ ...fixture, data: deleteData });

        // Get insights after deletion
        const rowsAfter = fixture.insights.selectAll();
        insightsAfterDelete = rowsAfter.map((row) => ({
          ...row,
          createdAt: new Date(row.createdAt),
        }));
      });

      it("deletes only the specified insight", () => {
        expect(insightsAfterDelete.length).toBe(insightsBeforeDelete.length - 1);
      });

      it("keeps other insights intact", () => {
        const remainingIds = insightsAfterDelete.map((insight) => insight.id);
        const expectedRemainingIds = insightsBeforeDelete
          .slice(1)
          .map((insight) => insight.id);
        
        expect(remainingIds).toEqual(expectedRemainingIds);
      });

      it("preserves insight data for remaining insights", () => {
        const remainingInsights = insightsAfterDelete;
        const expectedRemainingInsights = insightsBeforeDelete.slice(1);
        
        remainingInsights.forEach((insight, index) => {
          expect(insight.brand).toBe(expectedRemainingInsights[index].brand);
          expect(insight.text).toBe(expectedRemainingInsights[index].text);
        });
      });
    });
  });

  describe("non-existent insight", () => {
    withDB((fixture) => {
      let result: void;
      let insightsCount: number;

      beforeAll(() => {
        // Try to delete a non-existent insight
        const deleteData: DeleteInsight = { id: 999 };
        result = deleteInsight({ ...fixture, data: deleteData });
        
        // Check how many insights exist (should be 0)
        const rows = fixture.insights.selectAll();
        insightsCount = rows.length;
      });

      it("does not throw an error", () => {
        expect(result).toBeUndefined();
      });

      it("does not affect existing insights", () => {
        expect(insightsCount).toBe(0);
      });
    });
  });

  describe("edge cases", () => {
    withDB((fixture) => {
      it("handles id 0", () => {
        const deleteData: DeleteInsight = { id: 0 };
        
        expect(() => {
          deleteInsight({ ...fixture, data: deleteData });
        }).not.toThrow();
      });

      it("handles very large id", () => {
        const deleteData: DeleteInsight = { id: Number.MAX_SAFE_INTEGER };
        
        expect(() => {
          deleteInsight({ ...fixture, data: deleteData });
        }).not.toThrow();
      });
    });
  });

  describe("database errors", () => {
    withDB((fixture) => {
      it("throws DatabaseError when database operation fails", () => {
        // Mock a database failure by closing the connection
        fixture.db.close();

        const deleteData: DeleteInsight = { id: 1 };

        expect(() => {
          deleteInsight({ ...fixture, data: deleteData });
        }).toThrow(DatabaseError);
      });
    });
  });
});
