import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { OllamaFunctions } from "langchain/experimental/chat_models/ollama_functions";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { FastifyPluginAsync } from "fastify";
import { deepseek_coder } from "../../utils/constants";

const extract_resume_json : FastifyPluginAsync = async (fastify) => {
// Define a schema for the input data
const EXTRACTION_TEMPLATE = `Extract and save the relevant entities mentioned in the following resume together with their properties.

text:
{input}
`;

const prompt = PromptTemplate.fromTemplate(EXTRACTION_TEMPLATE);


const schema = z.object({
        name: z.string().describe("The name of a person"),
        education: z.string().describe("The person's education"),
        domains: z.array(z.string()).describe("extract domains of the project in which the person has worked"),
        skills: z.array(z.string()).describe("The person's top three skills"),
        experience: z.object({
            years: z.number(),
            company: z.string()
        }).describe("Experience details"),
        yearsOfExperience: z.number().describe("The number of years of experience"),
        phoneNumber: z.string().regex(/^\d+$/).describe("The person's phone number"),
        location: z.string().describe("The location of the person"),
        email: z.string().email().describe("The email address of a person"),
        canBeConsidered: z.boolean().describe("experience should be more than 3 years"),

      });

  const model = new OllamaFunctions({
    temperature: 0.1,
    model: deepseek_coder,
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
        reply.send({
          model: deepseek_coder, 
          success: true,
          error: false,
          output: result,
          
         });
    }
    catch(error) {
  // Handle any errors that occur during the API request
  reply.code(500).send({ 
    success: false,
    error: true,
    message: `Error: ${error}` });
}
   
  });


}

export default extract_resume_json;