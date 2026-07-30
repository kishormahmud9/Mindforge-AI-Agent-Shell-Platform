import DevBuildError from "../../lib/DevBuildError.js";
import { InstanceMessageService } from "../instanceMessage/instanceMessage.service.js";
import axios from "axios";
import { envVars } from "../../config/env.js";

export const MessageService = {
  getMessagesByInstanceId: async (prisma, owner, instanceId, agentId) => {
    let targetInstanceId = instanceId;

    if (!targetInstanceId) {
      // Fallback to latest instance for GET
      const instance = await InstanceMessageService.getLatestInstance(
        prisma,
        owner,
        agentId
      );
      if (!instance) {
        return [];
      }
      targetInstanceId = instance.id;
    } else {
      // Verify instance belongs to user
      const instance = await prisma.instance.findFirst({
        where: { id: targetInstanceId, userId: owner.id },
      });

      if (!instance) {
        throw new DevBuildError("Instance not found", 404);
      }
    }

    return prisma.message.findMany({
      where: {
        instanceId: targetInstanceId,
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        role: true,
        content: true,
        docummentsUrls: true,
        docummentsPaths: true,
        voiceUrls: true,
        voicePaths: true,
        userRole: true,
      },
    });
  },

  createMessage: async (prisma, owner, data) => {
    const {
      instanceId,
      agentId,
      docummentsUrls,
      docummentsPaths,
      voiceUrls,
      voicePaths,
      ...messageData
    } = data;
    let targetInstanceId = instanceId;

    if (agentId) {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
      });
      if (!agent) {
        throw new DevBuildError("Agent id does not exist", 404);
      }
    }

    // If no instanceId, start a NEW context/instance
    if (!targetInstanceId) {
      if (!agentId) {
        throw new DevBuildError("agentId is required to start a new conversation", 400);
      }

      const truncatedName =
        messageData.content.split(" ").slice(0, 5).join(" ") +
        (messageData.content.split(" ").length > 5 ? "..." : "");

      const newInstance = await prisma.instance.create({
        data: {
          userId: owner.id,
          userRole: owner.role,
          agentId,
          name: truncatedName || "New Conversation",
        },
      });
      targetInstanceId = newInstance.id;
    } else {
      // Verify existing instance belongs to user
      const instance = await prisma.instance.findFirst({
        where: { id: targetInstanceId, userId: owner.id },
      });

      if (!instance) {
        throw new DevBuildError("Instance not found", 404);
      }

      // If it's a USER message and title is default, update it
      const messageCount = await prisma.message.count({
        where: { instanceId: targetInstanceId },
      });

      if (
        messageCount === 0 &&
        messageData.role === "USER" &&
        (instance.name === "New Conversation" || !instance.name)
      ) {
        const truncatedName =
          messageData.content.split(" ").slice(0, 5).join(" ") +
          (messageData.content.split(" ").length > 5 ? "..." : "");

        await prisma.instance.update({
          where: { id: targetInstanceId },
          data: { name: truncatedName },
        });
      }
    }

    await prisma.message.create({
      data: {
        ...messageData,
        instanceId: targetInstanceId,
        userRole: owner.role,
        docummentsUrls: docummentsUrls || [],
        docummentsPaths: docummentsPaths || [],
        voiceUrls: voiceUrls || [],
        voicePaths: voicePaths || [],
      },
    });
    console.log('User Id for call ai >', owner.id)
    try {
      const response = await axios.post(`${envVars.AI_URL}/chat`, {
        user_query: messageData.content,
        user_id: owner.id,
        conversation_id: targetInstanceId,
      });

      

      console.log("AI API Response:", response.data , "User data" , owner.id);

      // Extract the nested data object based on the observed response structure: response.data.data.data
      const responseData = response.data?.data?.data || response.data?.data || response.data;

      const aiResponseContent = responseData?.content || responseData?.response || responseData?.message || "No response content from AI";

      // Extract attachments if provided by the AI in the same nested level
      const docummentsUrls = responseData?.docummentsUrls || [];
      const docummentsPaths = responseData?.docummentsPaths || [];
      const voiceUrls = responseData?.voiceUrls || [];
      const voicePaths = responseData?.voicePaths || [];

      const usage = response.data?.data?.usage;
      const meta = response.data?.meta;

      const assistantMessage = await prisma.message.create({
        data: {
          instanceId: targetInstanceId,
          role: "ASSISTANT",
          content: aiResponseContent.toString(),
          userRole: "ASSISTANT",
          docummentsUrls,
          docummentsPaths,
          voiceUrls,
          voicePaths,
          promptTokens: usage?.prompt_tokens,
          completionTokens: usage?.completion_tokens,
          totalTokens: usage?.total_tokens,
          model: meta?.model,
        },
      });

      // Save Experience if not a filler word (check both user query and AI response)
      const fillerWords = [
        "ok", "okay", "yes", "no", "hmm", "hmmm", "huh", "yo", "hey", "hi",
        "hello", "thanks", "thank", "cool", "fine", "done", "right", "sure"
      ];

      const cleanUserQuery = messageData.content.trim().toLowerCase().replace(/[^\w\s]/gi, '');
      const cleanResponse = aiResponseContent.toString().trim().toLowerCase().replace(/[^\w\s]/gi, '');

      if (!fillerWords.includes(cleanUserQuery) && !fillerWords.includes(cleanResponse)) {
        await prisma.experience.create({
          data: {
            userId: owner.id,
            agentId: (await prisma.instance.findUnique({ where: { id: targetInstanceId }, select: { agentId: true } })).agentId,
            instanceId: targetInstanceId,
            userQuery: messageData.content,
            aiResponse: aiResponseContent.toString(),
            content: `${messageData.content} | ${aiResponseContent.toString()}`,
            promptTokens: usage?.prompt_tokens,
            completionTokens: usage?.completion_tokens,
            totalTokens: usage?.total_tokens,
            model: meta?.model,
          },
        });
      }

      return assistantMessage;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("AI API Error Response:", error.response.data);
        throw new DevBuildError(`AI API failed (${error.response.status}): ${JSON.stringify(error.response.data)}`, error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("AI API No Response:", error.request);
        throw new DevBuildError("No response received from AI API", 503);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("AI API Request Setup Error:", error.message);
        throw new DevBuildError(`Error setting up AI API request: ${error.message}`, 500);
      }
    }

  },

  getAllMessages: async (prisma, owner) => {
    return prisma.message.findMany({
      where: {
        instance: { userId: owner.id },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        instance: {
          select: {
            id: true,
            name: true,
            agentId: true,
            agent: {
              select: {
                agentName: true,
              },
            },
          },
        },
      },
    });
  },

  getInstances: async (prisma, owner, agentId) => {
    return InstanceMessageService.getInstances(prisma, owner, agentId);
  },
};
