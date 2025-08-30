import { Trash2Icon } from "lucide-react";
import { cx } from "../../lib/cx.ts";
import styles from "./insights.module.css";
import type { Insight } from "../../schemas/insight.ts";

type InsightsProps = {
    insights: Insight[];
    refetchInsights: () => void;
    className?: string;
};

const formatDate = (date: Date) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
    });

    return formatter.format(date);
};

export const Insights = ({
    insights,
    className,
    refetchInsights,
}: InsightsProps) => {
    const deleteInsight = async (id: number) => {
        try {
            const response = await fetch(`/api/insights/${id}/delete`, {
                method: "POST",
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error("Failed to delete insight" + text);
            }
        } catch (error) {
            console.error("Failed to delete insight", error);
        }

        refetchInsights();
    };

    return (
        <div className={cx(className)}>
            <h1 className={styles.heading}>Insights</h1>
            <div className={styles.list}>
                {insights?.length ? (
                    insights.map(({ id, text, createdAt, brand }) => (
                        <div className={styles.insight} key={id}>
                            <div className={styles["insight-meta"]}>
                                <span>{brand}</span>
                                <div className={styles["insight-meta-details"]}>
                                    <span>{formatDate(createdAt)}</span>
                                    <Trash2Icon
                                        className={styles["insight-delete"]}
                                        onClick={() => deleteInsight(id)}
                                    />
                                </div>
                            </div>
                            <p className={styles["insight-content"]}>{text}</p>
                        </div>
                    ))
                ) : (
                    <p>We have no insight!</p>
                )}
            </div>
        </div>
    );
};
