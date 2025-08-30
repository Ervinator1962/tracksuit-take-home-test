import { useEffect, useState } from "react";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import styles from "./app.module.css";
import { Insight } from "../schemas/insight.ts";
import { z } from "zod";

export const App = () => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [shouldRefetchInsights, setShouldRefetchInsights] = useState(false);
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
            <Header />
            <Insights
                className={styles.insights}
                insights={insights}
                refetchInsights={() => setShouldRefetchInsights(true)}
            />
        </main>
    );
};
