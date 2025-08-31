import { useState } from "react";
import { Button } from "../button/button.tsx";
import styles from "./header.module.css";
import { AddInsight } from "../add-insight/add-insight.tsx";

export const HEADER_TEXT = "Suit Tracker Insights";

type HeaderProps = {
    children?: React.ReactNode;
};

export const Header = ({ children }: HeaderProps) => {
    const [addInsightOpen, setAddInsightOpen] = useState(false);

    return (
        <>
            <header className={styles.header}>
                <div className={styles.inner}>
                    <span className={styles.logo}>{HEADER_TEXT}</span>
                    <div className={styles.controls}>
                        {children}
                        <Button
                            label="Add insight"
                            theme="secondary"
                            onClick={() => setAddInsightOpen(true)}
                        />
                    </div>
                </div>
            </header>
            <AddInsight
                open={addInsightOpen}
                onClose={() => setAddInsightOpen(false)}
            />
        </>
    );
};
