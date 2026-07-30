import { z } from "zod";

const createMessageSchema = z.object({
  body: z.object({
    instanceId: z.string().optional(),
    agentId: z.string().optional(), // Required if instanceId is missing
    role: z.enum(["USER", "ASSISTANT", "SYSTEM"], {
      required_error: "Role is required",
    }),
    content: z.string({
      required_error: "Content is required",
    }).min(1, "Content cannot be empty"),
    docummentsUrls: z.array(z.string()).optional(),
    docummentsPaths: z.array(z.string()).optional(),
    voiceUrls: z.array(z.string()).optional(),
    voicePaths: z.array(z.string()).optional(),
  }),
});

const getMessagesSchema = z.object({
  query: z.object({
    instanceId: z.string().optional(),
    agentId: z.string().optional(), // Filter latest by agent
  }),
  params: z.object({
    instance_id: z.string().optional(),
  }),
});

export const MessageValidation = {
  createMessageSchema,
  getMessagesSchema,
};
