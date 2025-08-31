import { ChevronDownIcon } from "lucide-react";
import styles from "./insights-controls.module.css";

type InsightsControlsProps = {
    selectedBrand: number | "all";
    setSelectedBrand: (brand: number | "all") => void;
    sortOrder: "newest" | "oldest";
    setSortOrder: (order: "newest" | "oldest") => void;
    uniqueBrands: number[];
};

export const InsightsControls = ({
    selectedBrand,
    setSelectedBrand,
    sortOrder,
    setSortOrder,
    uniqueBrands,
}: InsightsControlsProps) => {
    return (
        <div className={styles.controls}>
            <div className={styles.controlGroup}>
                <label htmlFor="brand-filter" className={styles.label}>Brand:</label>
                <div className={styles.selectWrapper}>
                    <select
                        id="brand-filter"
                        value={selectedBrand}
                        onChange={(e) =>
                            setSelectedBrand(
                                e.target.value === "all"
                                    ? "all"
                                    : Number(e.target.value)
                            )
                        }
                        className={styles.select}
                    >
                        <option value="all">All</option>
                        {uniqueBrands.map((brand) => (
                            <option key={brand} value={brand}>
                                {brand}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon className={styles.selectIcon} size={14} />
                </div>
            </div>
            
            <div className={styles.controlGroup}>
                <label htmlFor="sort-order" className={styles.label}>Sort:</label>
                <div className={styles.selectWrapper}>
                    <select
                        id="sort-order"
                        value={sortOrder}
                        onChange={(e) =>
                            setSortOrder(
                                e.target.value as "newest" | "oldest"
                            )
                        }
                        className={styles.select}
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                    <ChevronDownIcon className={styles.selectIcon} size={14} />
                </div>
            </div>
        </div>
    );
}; 