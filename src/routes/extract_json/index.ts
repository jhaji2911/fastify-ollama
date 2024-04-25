import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { OllamaFunctions } from "langchain/experimental/chat_models/ollama_functions";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { FastifyPluginAsync } from "fastify";

const extractjson : FastifyPluginAsync = async (fastify) => {
// Define a schema for the input data
const EXTRACTION_TEMPLATE = `Extract and save the relevant entities mentioned in the following text together with their properties.

text:
{input}
`;

const prompt = PromptTemplate.fromTemplate(EXTRACTION_TEMPLATE);


const schema = z.object({
        name: z.string().describe("The name of a person"),
        education: z.number().describe("The person's education"),
        skills: z.array(z.string()).describe("The person's top three skills"),
        experience: z.object({
            years: z.number(),
            company: z.string()
        }).describe("Experience details"),
        location: z.string().describe("The location of the person"),
        email: z.string().email().describe("The email address of a person"),
        canBeConsidered: z.boolean().describe("Whether this entity could be considered in further analysis"),
      });

  const model = new OllamaFunctions({
    temperature: 0.1,
    model: "mus",
  }).bind({
    functions: [
      {
        name: "information_extraction",
        description: "Extracts the relevant information from the text given.",
        parameters: {
          type: "object",
          properties: zodToJsonSchema(schema),
        },
      },
    ],
    function_call: {
      name: "information_extraction",
    },
});

// Use a JsonOutputFunctionsParser to get the parsed JSON response directly.
const chain = await prompt.pipe(model).pipe(new JsonOutputFunctionsParser());


fastify.post('/',{
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
    if(!prompt) {
        throw new Error("No prompt provided");
    }
    try {
        const result = await chain.invoke({input: prompt  });
        reply.send(result);
    }
    catch(error) {
  // Handle any errors that occur during the API request
    reply.code(500).send({ message: `Error: ${error}` });
    }
   
  });


}

export default extractjson;