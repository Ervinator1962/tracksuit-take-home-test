import { z } from "zod";

export const CreateInsight = z.object({
  brand: z.number().int().min(0),
  text: z.string(),
});

export type CreateInsight = z.infer<typeof CreateInsight>;

export const DeleteInsight = z.object({
  id: z.number().int().min(0),
});

export type DeleteInsight = z.infer<typeof DeleteInsight>;

export const Insight = CreateInsight.extend({
  id: z.number().int().min(0),
  createdAt: z.date(),
});

export type Insight = z.infer<typeof Insight>;
