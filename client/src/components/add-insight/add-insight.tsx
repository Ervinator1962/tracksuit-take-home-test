import { BRANDS } from "../../lib/consts.ts";
import { Button } from "../button/button.tsx";
import { Modal, type ModalProps } from "../modal/modal.tsx";
import styles from "./add-insight.module.css";

type AddInsightProps = ModalProps;

export const AddInsight = (props: AddInsightProps) => {
  const createInsight = async () => {
      const form = document.getElementById(
          "add-insight-form"
      ) as HTMLFormElement;

      const data = new FormData(form);

      const brand = data.get("brand");
      const insight = data.get("insight");

      const insightData = {
          brand,
          text: insight,
      };

      try {
          const response = await fetch("/api/insights/create", {
              method: "POST",
              body: JSON.stringify(insightData),
          });

          if (!response.ok) {
              const errorMessage = await response.text();
              throw new Error(errorMessage);
          }
      } catch (error) {
          const errorMessage =
              error instanceof Error ? error.message : String(error);
          console.error(errorMessage);
          return;
      }
  };

  return (
      <Modal {...props}>
          <h1 className={styles.heading}>Add a new insight</h1>
          <form
              id="add-insight-form"
              className={styles.form}
              onSubmit={createInsight}
          >
              <label className={styles.field}>
                  <select name="brand" className={styles["field-input"]}>
                      {BRANDS.map(({ id, name }) => (
                          <option key={id} value={id}>
                              {name}
                          </option>
                      ))}
                  </select>
              </label>
              <label className={styles.field}>
                  Insight
                  <textarea
                      name="insight"
                      className={styles["field-input"]}
                      rows={5}
                      placeholder="Something insightful..."
                  />
              </label>
              <Button
                  className={styles.submit}
                  type="submit"
                  label="Add insight"
              />
          </form>
      </Modal>
  );
};
