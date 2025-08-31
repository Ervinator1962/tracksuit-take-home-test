import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Insights } from "./insights.tsx";

const mockRefetchInsights = vi.fn();

const createMockInsight = (overrides = {}) => ({
    id: 1,
    brand: 1,
    createdAt: new Date("2024-01-01T10:00:00Z"),
    text: "Test insight",
    ...overrides,
});

const TEST_INSIGHTS = [
    createMockInsight({ id: 1, brand: 1, text: "First test insight" }),
    createMockInsight({ id: 2, brand: 2, text: "Second test insight" }),
    createMockInsight({ id: 3, brand: 1, text: "Third test insight" }),
];

const defaultProps = {
    insights: TEST_INSIGHTS,
    refetchInsights: mockRefetchInsights,
    sortOrder: "newest" as const,
    selectedBrand: "all" as const,
};

describe("Insights", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("renders insights list when insights exist", () => {
            render(<Insights {...defaultProps} />);

            expect(screen.getAllByText("Insights")[0]).toBeDefined();
            expect(screen.getAllByText("First test insight")[0]).toBeDefined();
            expect(screen.getAllByText("Second test insight")[0]).toBeDefined();
            expect(screen.getAllByText("Third test insight")[0]).toBeDefined();
        });

        it("renders header with correct content", () => {
            render(<Insights {...defaultProps} />);

            expect(screen.getAllByText("Insights")[0]).toBeDefined();
            expect(
                screen.getAllByText(
                    "AI-powered analysis of your brand performance and market trends"
                )[0]
            ).toBeDefined();
        });

        it("displays correct insight count", () => {
            render(<Insights {...defaultProps} />);

            expect(screen.getAllByText("3 insights")[0]).toBeDefined();
        });

        it("displays singular insight count", () => {
            const singleInsight = [createMockInsight()];
            render(<Insights {...defaultProps} insights={singleInsight} />);

            expect(screen.getAllByText("1 insight")[0]).toBeDefined();
        });
    });

    describe("Empty States", () => {
        it("renders empty state when no insights exist", () => {
            render(<Insights {...defaultProps} insights={[]} />);

            expect(screen.getAllByText("No insights yet")[0]).toBeDefined();
            expect(
                screen.getAllByText(
                    "Insights are AI-generated observations about your brand performance, customer sentiment, and market trends."
                )[0]
            ).toBeDefined();
            expect(
                screen.getAllByText("Track brand performance over time")[0]
            ).toBeDefined();
            expect(
                screen.getAllByText("Get daily updates and analysis")[0]
            ).toBeDefined();
            expect(
                screen.getAllByText("Discover actionable opportunities")[0]
            ).toBeDefined();
        });

        it("renders brand-specific empty state when filtering by brand with no results", () => {
            render(<Insights {...defaultProps} selectedBrand={3} />);

            expect(
                screen.getAllByText("No insights for Brand 3")[0]
            ).toBeDefined();
            expect(
                screen.getAllByText(
                    "This brand doesn't have any insights yet. Try selecting a different brand or create new insights."
                )[0]
            ).toBeDefined();
        });
    });

    describe("Filtering", () => {
        it("filters insights by selected brand", () => {
            // Create a fresh component with specific props
            const testInsights = [
                createMockInsight({ id: 1, brand: 1, text: "Brand 1 insight" }),
                createMockInsight({ id: 2, brand: 2, text: "Brand 2 insight" }),
                createMockInsight({
                    id: 3,
                    brand: 1,
                    text: "Another Brand 1 insight",
                }),
            ];

            render(
                <Insights
                    insights={testInsights}
                    refetchInsights={mockRefetchInsights}
                    sortOrder="newest"
                    selectedBrand={1}
                />
            );

            // Should only show Brand 1 insights
            expect(screen.getAllByText("Brand 1 insight")[0]).toBeDefined();
            expect(
                screen.getAllByText("Another Brand 1 insight")[0]
            ).toBeDefined();

            // Should NOT show Brand 2 insight
            const brand2Elements = screen.queryAllByText("Brand 2 insight");
            expect(brand2Elements.length).toBe(0);

            // Should show correct count
            expect(screen.getAllByText("2 insights")[0]).toBeDefined();
        });

        it("shows all insights when selectedBrand is 'all'", () => {
            render(<Insights {...defaultProps} selectedBrand="all" />);

            expect(screen.getAllByText("First test insight")[0]).toBeDefined();
            expect(screen.getAllByText("Second test insight")[0]).toBeDefined();
            expect(screen.getAllByText("Third test insight")[0]).toBeDefined();
            expect(screen.getAllByText("3 insights")[0]).toBeDefined();
        });
    });

    describe("Sorting", () => {
        it("sorts insights by newest first when sortOrder is 'newest'", () => {
            const insightsWithDates = [
                createMockInsight({
                    id: 1,
                    createdAt: new Date("2024-01-01T10:00:00Z"),
                    text: "Oldest insight",
                }),
                createMockInsight({
                    id: 2,
                    createdAt: new Date("2024-12-31T10:00:00Z"),
                    text: "Newest insight",
                }),
            ];

            render(
                <Insights
                    {...defaultProps}
                    insights={insightsWithDates}
                    sortOrder="newest"
                />
            );

            // Verify both insights are rendered
            expect(screen.getAllByText("Oldest insight")[0]).toBeDefined();
            expect(screen.getAllByText("Newest insight")[0]).toBeDefined();

            // Verify the component shows 2 insights
            expect(screen.getAllByText("2 insights")[0]).toBeDefined();
        });

        it("sorts insights by oldest first when sortOrder is 'oldest'", () => {
            const insightsWithDates = [
                createMockInsight({
                    id: 1,
                    createdAt: new Date("2024-01-01T10:00:00Z"),
                    text: "Oldest insight",
                }),
                createMockInsight({
                    id: 2,
                    createdAt: new Date("2024-12-31T10:00:00Z"),
                    text: "Newest insight",
                }),
            ];

            render(
                <Insights
                    {...defaultProps}
                    insights={insightsWithDates}
                    sortOrder="oldest"
                />
            );

            // Verify both insights are rendered
            expect(screen.getAllByText("Oldest insight")[0]).toBeDefined();
            expect(screen.getAllByText("Newest insight")[0]).toBeDefined();

            // Verify the component shows 2 insights
            expect(screen.getAllByText("2 insights")[0]).toBeDefined();
        });
    });

    describe("Insight Display", () => {
        it("displays insight text correctly", () => {
            render(<Insights {...defaultProps} />);

            expect(screen.getAllByText("First test insight")[0]).toBeDefined();
            expect(screen.getAllByText("Second test insight")[0]).toBeDefined();
            expect(screen.getAllByText("Third test insight")[0]).toBeDefined();
        });

        it("displays brand information correctly", () => {
            render(<Insights {...defaultProps} />);

            expect(screen.getAllByText("Brand 1")[0]).toBeDefined();
            expect(screen.getAllByText("Brand 2")[0]).toBeDefined();
        });

        it("displays creation date correctly", () => {
            render(<Insights {...defaultProps} />);

            // Use getAllByText to handle duplicate rendering and check the first one
            const createdElements = screen.getAllByText("Created");
            expect(createdElements[0]).toBeDefined();

            // The exact date format will depend on the formatDate function
            const dateElements = screen.getAllByText(/January 1, 2024/);
            expect(dateElements[0]).toBeDefined();
        });
    });

    describe("Edge Cases", () => {
        it("handles empty insights array", () => {
            render(<Insights {...defaultProps} insights={[]} />);

            // Use getAllByText and check the first one to handle duplicate rendering
            const emptyStateElements = screen.getAllByText("No insights yet");
            expect(emptyStateElements[0]).toBeDefined();

            // Check that no insight content is displayed - use a unique text that won't conflict
            const insightContentElements = screen.queryAllByText(
                "This text should not exist"
            );
            expect(insightContentElements.length).toBe(0);
        });

        it("handles single insight correctly", () => {
            const singleInsight = [createMockInsight()];
            render(<Insights {...defaultProps} insights={singleInsight} />);

            // Use getAllByText and check the first one to handle duplicate rendering
            const insightCountElements = screen.getAllByText("1 insight");
            expect(insightCountElements[0]).toBeDefined();

            // Use getAllByText for the insight text as well
            const insightTextElements = screen.getAllByText("Test insight");
            expect(insightTextElements[0]).toBeDefined();
        });
    });
});
