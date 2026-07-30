import DevBuildError from "../../lib/DevBuildError.js";

export const AgenManagementService = {
  createAgent: async (prisma, userId, data) => {
    return prisma.agent.create({
      data: {
        ...data,
        userId,
      },
    });
  },

  getAgents: async (prisma) => {
    return prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  getAgentById: async (prisma, userId, id) => {
    const agent = await prisma.agent.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!agent) {
      throw new DevBuildError("Agent not found", 404);
    }

    return agent;
  },

  updateAgent: async (prisma, userId, id, data) => {
    const agent = await prisma.agent.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!agent) {
      throw new DevBuildError("Agent not found", 404);
    }

    return prisma.agent.update({
      where: { id },
      data,
    });
  },

  deleteAgent: async (prisma, userId, id) => {
    const agent = await prisma.agent.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!agent) {
      throw new DevBuildError("Agent not found", 404);
    }

    return prisma.agent.delete({
      where: { id },
    });
  },
};
