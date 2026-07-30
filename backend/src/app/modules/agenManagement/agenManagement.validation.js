import { z } from "zod";

const createAgentSchema = z.object({
    body: z.object({
        agentName: z.string().min(1, { message: "agentName is required" }),
        identity: z.string().min(1, { message: "identity is required" }),
        behavior: z.string().min(1, { message: "behavior is required" }),
    }),
});

const updateAgentSchema = z.object({
    body: z.object({
        agentName: z.string().optional(),
        identity: z.string().optional(),
        behavior: z.string().optional(),
    }),
});

export const AgenManagementValidation = {
    createAgentSchema,
    updateAgentSchema,
};
