import { BRANDS } from "../../lib/consts.ts";
import { Button } from "../button/button.tsx";
import { Modal, type ModalProps } from "../modal/modal.tsx";
import { Toast } from "../toast/toast.tsx";
import { useState, useEffect } from "react";
import styles from "./add-insight.module.css";

type AddInsightProps = ModalProps & {
    refetchInsights: () => void;
};

export const AddInsight = (props: AddInsightProps) => {
    const [toastMessage, setToastMessage] = useState("");
    const [createStatus, setCreateStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");
    const [formData, setFormData] = useState({
        brand: "",
        text: "",
    });
    const [isFormValid, setIsFormValid] = useState(false);

    // Validate form whenever formData changes
    useEffect(() => {
        const isValid = formData.brand !== "" && formData.text.trim() !== "";
        setIsFormValid(isValid);
    }, [formData]);

    const handleInputChange = (field: "brand" | "text", value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const createInsight = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Double-check validation before submission
        if (!isFormValid) {
            return;
        }

        try {
            setCreateStatus("loading");
            const response = await fetch("/api/insights/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const json = await response.json();
                const errorMessage = json.error;
                throw new Error(errorMessage);
            }

            setToastMessage("Insight created successfully!");
            setCreateStatus("success");
        } catch (error) {
            setCreateStatus("error");

            let toastMessage = "Failed to create insight";

            if (error instanceof Error) {
                toastMessage += `: ${error.message}`;
            }
            setToastMessage(toastMessage);
        } finally {
            setFormData({ brand: "", text: "" });
            props.refetchInsights();
            props.onClose();
        }
    };

    return (
        <>
            <Modal {...props}>
                <h1 className={styles.heading}>Add a new insight</h1>
                <form
                    id="add-insight-form"
                    className={styles.form}
                    onSubmit={createInsight}
                >
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Brand</span>
                        <select
                            name="brand"
                            className={styles["field-input"]}
                            value={formData.brand}
                            onChange={(e) =>
                                handleInputChange("brand", e.target.value)
                            }
                            required
                        >
                            <option value="">Select a brand...</option>
                            {BRANDS.map(({ id, name }) => (
                                <option key={id} value={id}>
                                    {name}
                                </option>
                            ))}
                        </select>
                        {formData.brand === "" && (
                            <span className={styles.fieldError}>
                                Please select a brand
                            </span>
                        )}
                    </label>
                    <label className={styles.field}>
                        <span className={styles.fieldLabel}>Insight</span>
                        <textarea
                            name="insight"
                            className={styles["field-input"]}
                            rows={5}
                            placeholder="Something insightful..."
                            value={formData.text}
                            onChange={(e) =>
                                handleInputChange("text", e.target.value)
                            }
                            required
                        />
                        {formData.text.trim() === "" && (
                            <span className={styles.fieldError}>
                                Please enter an insight
                            </span>
                        )}
                    </label>
                    <Button
                        className={styles.submit}
                        type="submit"
                        label="Add insight"
                        disabled={!isFormValid || createStatus === "loading"}
                    />
                </form>
            </Modal>

            <Toast
                message={toastMessage}
                type={createStatus === "success" ? "success" : "error"}
                isVisible={
                    createStatus === "success" || createStatus === "error"
                }
                onClose={() => setCreateStatus("idle")}
                duration={5000}
            />
        </>
    );
};
