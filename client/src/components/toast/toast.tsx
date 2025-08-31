import { useEffect, useState } from "react";
import { cx } from "../../lib/cx.ts";
import styles from "./toast.module.css";
import { XIcon } from "lucide-react";

export type ToastProps = {
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
};

export const Toast = ({ 
    message, 
    type, 
    isVisible, 
    onClose, 
    duration = 5000 
}: ToastProps) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className={cx(styles.toast, styles[type], isAnimating && styles.visible)}>
            <div className={styles.content}>
                <span className={styles.message}>{message}</span>
                <button 
                    className={styles.closeButton} 
                    onClick={onClose}
                    aria-label="Close toast"
                >
                    <XIcon size={16} />
                </button>
            </div>
        </div>
    );
}; 