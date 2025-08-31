import { useEffect, useState, useMemo } from "react";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import { InsightsControls } from "../components/insights/insights-controls.tsx";
import styles from "./app.module.css";
import { Insight } from "../schemas/insight.ts";
import { z } from "zod";

export const App = () => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [shouldRefetchInsights, setShouldRefetchInsights] = useState(false);
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [selectedBrand, setSelectedBrand] = useState<number | "all">("all");

    // Get unique brands for filter dropdown
    const uniqueBrands = useMemo(() => {
        const brands = [...new Set(insights.map((insight) => insight.brand))];
        return brands.sort((a, b) => a - b);
    }, [insights]);

    useEffect(() => {
        fetch(`/api/insights`).then(async (res) => {
            const insights = await res.json();

            const parsed = z.array(Insight).safeParse(insights);

            if (!parsed.success) {
                throw new Error("Invalid insights: " + parsed.error?.message);
            }

            setInsights(parsed.data);
            setShouldRefetchInsights(false);
        });
    }, [shouldRefetchInsights]);

    return (
        <main className={styles.main}>
            <Header>
                <InsightsControls
                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    uniqueBrands={uniqueBrands}
                />
            </Header>
            <Insights
                className={styles.insights}
                insights={insights}
                refetchInsights={() => setShouldRefetchInsights(true)}
                sortOrder={sortOrder}
                selectedBrand={selectedBrand}
            />
        </main>
    );
};
