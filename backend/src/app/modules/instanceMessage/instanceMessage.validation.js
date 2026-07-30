import { z } from "zod";

const createInstanceSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    agentId: z.string({
      required_error: "Agent ID is required",
    }),
  }),
});

const updateInstanceSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty"),
  }),
});

export const InstanceMessageValidation = {
  createInstanceSchema,
  updateInstanceSchema,
};
