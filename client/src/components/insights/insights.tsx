import {
    Trash2Icon,
    LightbulbIcon,
    TrendingUpIcon,
    CalendarIcon,
    HashIcon,
} from "lucide-react";
import { cx } from "../../lib/cx.ts";
import styles from "./insights.module.css";
import type { Insight } from "../../schemas/insight.ts";
import { useState, useMemo } from "react";
import { Toast } from "../toast/toast.tsx";

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

    const filteredAndSortedInsights = useMemo(() => {
        let filtered = insights;

        if (selectedBrand !== "all") {
            filtered = insights.filter(
                (insight) => insight.brand === selectedBrand
            );
        }

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

    const renderEmptyState = () => {
        if (selectedBrand !== "all") {
            return (
                <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>
                        <HashIcon size={48} />
                    </div>
                    <h3 className={styles.emptyStateTitle}>
                        No insights for Brand {selectedBrand}
                    </h3>
                    <p className={styles.emptyStateDescription}>
                        This brand doesn't have any insights yet. Try selecting
                        a different brand or create new insights.
                    </p>
                </div>
            );
        }

        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                    <LightbulbIcon size={48} />
                </div>
                <h3 className={styles.emptyStateTitle}>No insights yet</h3>
                <p className={styles.emptyStateDescription}>
                    Insights are AI-generated observations about your brand
                    performance, customer sentiment, and market trends.
                </p>
                <div className={styles.emptyStateFeatures}>
                    <div className={styles.emptyStateFeature}>
                        <TrendingUpIcon size={20} />
                        <span>Track brand performance over time</span>
                    </div>
                    <div className={styles.emptyStateFeature}>
                        <CalendarIcon size={20} />
                        <span>Get daily updates and analysis</span>
                    </div>
                    <div className={styles.emptyStateFeature}>
                        <LightbulbIcon size={20} />
                        <span>Discover actionable opportunities</span>
                    </div>
                </div>
                <p className={styles.emptyStateHint}>
                    Insights are automatically generated and will appear here
                    once available.
                </p>
            </div>
        );
    };

    return (
        <>
            <div className={cx(className)}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <LightbulbIcon
                            className={styles.headerIcon}
                            size={32}
                        />
                        <div>
                            <h1 className={styles.heading}>Insights</h1>
                            <p className={styles.subheading}>
                                AI-powered analysis of your brand performance
                                and market trends
                            </p>
                        </div>
                    </div>
                    {filteredAndSortedInsights.length > 0 && (
                        <div className={styles.stats}>
                            <span className={styles.statItem}>
                                {filteredAndSortedInsights.length} insight
                                {filteredAndSortedInsights.length !== 1
                                    ? "s"
                                    : ""}
                            </span>
                        </div>
                    )}
                </div>

                <div className={styles.list}>
                    {filteredAndSortedInsights?.length
                        ? filteredAndSortedInsights.map(
                              ({ id, text, createdAt, brand }) => (
                                  <div className={styles.insight} key={id}>
                                      <div className={styles["insight-meta"]}>
                                          <div
                                              className={styles["brand-badge"]}
                                          >
                                              <HashIcon
                                                  size={16}
                                                  className={styles.brandIcon}
                                              />
                                              <span
                                                  className={
                                                      styles["brand-label"]
                                                  }
                                              >
                                                  Brand {brand}
                                              </span>
                                          </div>
                                          <div
                                              className={
                                                  styles["insight-meta-details"]
                                              }
                                          >
                                              <div
                                                  className={
                                                      styles["date-display"]
                                                  }
                                              >
                                                  <CalendarIcon
                                                      size={14}
                                                      className={
                                                          styles.dateIcon
                                                      }
                                                  />
                                                  <div>
                                                      <span
                                                          className={
                                                              styles[
                                                                  "date-label"
                                                              ]
                                                          }
                                                      >
                                                          Created
                                                      </span>
                                                      <span
                                                          className={
                                                              styles[
                                                                  "date-value"
                                                              ]
                                                          }
                                                      >
                                                          {formatDate(
                                                              createdAt
                                                          )}
                                                      </span>
                                                  </div>
                                              </div>
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
                        : renderEmptyState()}
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
