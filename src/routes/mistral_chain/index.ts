import { mistral_ai, ollama_endpoint } from "../../utils/constants";
import { Ollama } from "@langchain/community/llms/ollama";
import { FastifyPluginAsync } from "fastify";

const mistralchain: FastifyPluginAsync = async (fastify) => {
    const ollama = new Ollama({
        baseUrl: ollama_endpoint, // Default value
        model: mistral_ai, 
      });
  
      fastify.post("/",{
          schema:{
              body:{
                type:'object',
                required:['prompt'],
                properties:{
                    prompt:{type:'string'},

                },
              }
          },

      }, async (request, reply) => {
    const { prompt } = request.body as { prompt: string };
    if (!prompt) {
      throw new Error("No prompt provided");
    }
    
    try {
      const result = await ollama.stream(prompt);
    return reply.send(result)
   } catch (error) {
      console.log(error);
      reply.code(500).send({ error: "An error occurred" });
    }
  });
};

export default mistralchain;