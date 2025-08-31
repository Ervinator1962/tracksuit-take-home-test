import { Trash2Icon } from "lucide-react";
import { cx } from "../../lib/cx.ts";
import styles from "./insights.module.css";
import type { Insight } from "../../schemas/insight.ts";
import { useState, useMemo } from "react";
import { Toast } from "../toast/toast.tsx";
import { InsightsControls } from "./insights-controls.tsx";

type InsightsProps = {
    insights: Insight[];
    refetchInsights: () => void;
    className?: string;
    sortOrder: "newest" | "oldest";
    selectedBrand: number | "all";
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
    sortOrder,
    selectedBrand,
}: InsightsProps) => {
    const [deleteStatus, setDeleteStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");
    const [toastMessage, setToastMessage] = useState("");

    // Filter and sort insights
    const filteredAndSortedInsights = useMemo(() => {
        let filtered = insights;

        // Filter by brand
        if (selectedBrand !== "all") {
            filtered = insights.filter(
                (insight) => insight.brand === selectedBrand
            );
        }

        // Sort by date
        return filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });
    }, [insights, selectedBrand, sortOrder]);

    const deleteInsight = async (id: number) => {
        try {
            setDeleteStatus("loading");
            const response = await fetch(`/api/insights/${id}/delete`, {
                method: "POST",
            });

            if (!response.ok) {
                const json = await response.json();
                const errorMessage = json.error;
                throw new Error("Failed to delete insight: " + errorMessage);
            }

            setDeleteStatus("success");
            setToastMessage("Successfully deleted insight");
            refetchInsights();
        } catch (error) {
            console.error("Failed to delete insight", error);
            setDeleteStatus("error");
            setToastMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to delete insight"
            );
        }
    };

    return (
        <>
            <div className={cx(className)}>
                <h1 className={styles.heading}>Insights</h1>

                <div className={styles.list}>
                    {filteredAndSortedInsights?.length ? (
                        filteredAndSortedInsights.map(
                            ({ id, text, createdAt, brand }) => (
                                <div className={styles.insight} key={id}>
                                    <div className={styles["insight-meta"]}>
                                        <span>{brand}</span>
                                        <div
                                            className={
                                                styles["insight-meta-details"]
                                            }
                                        >
                                            <span>{formatDate(createdAt)}</span>
                                            <Trash2Icon
                                                className={
                                                    styles["insight-delete"]
                                                }
                                                onClick={() =>
                                                    deleteInsight(id)
                                                }
                                            />
                                        </div>
                                    </div>
                                    <p className={styles["insight-content"]}>
                                        {text}
                                    </p>
                                </div>
                            )
                        )
                    ) : (
                        <p>We have no insight!</p>
                    )}
                </div>
            </div>

            <Toast
                message={toastMessage}
                type={deleteStatus === "error" ? "error" : "success"}
                isVisible={
                    deleteStatus === "error" || deleteStatus === "success"
                }
                onClose={() => setDeleteStatus("idle")}
                duration={5000}
            />
        </>
    );
};
