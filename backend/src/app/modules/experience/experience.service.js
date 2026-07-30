import { QueryBuilder } from "../../utils/QueryBuilder.js";

export const ExperienceService = {
  createExperience: async (prisma, data) => {
    return prisma.experience.create({
      data,
    });
  },

  getAllExperiences: async (prisma, query) => {
    const experienceQuery = new QueryBuilder(query)
      .search(["userQuery", "aiResponse", "content"])
      .filter()
      .paginate()
      .sort("createdAt", {});

    const [data, total] = await Promise.all([
      prisma.experience.findMany(experienceQuery.build()),
      prisma.experience.count({ where: experienceQuery.where }),
    ]);

    return {
      meta: experienceQuery.getMeta(total),
      data,
    };
  },

  getExperienceById: async (prisma, id) => {
    return prisma.experience.findUnique({
      where: { id },
    });
  },

  updateExperience: async (prisma, id, data) => {
    return prisma.experience.update({
      where: { id },
      data,
    });
  },

  deleteExperience: async (prisma, id) => {
    return prisma.experience.delete({
      where: { id },
    });
  },
};
