import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { OllamaFunctions } from "langchain/experimental/chat_models/ollama_functions";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { FastifyPluginAsync } from "fastify";
import { deepseek_coder, llama3_ai, mistral_ai } from "../../utils/constants";

const extract_JD_resume : FastifyPluginAsync = async (fastify) => {
// Define a schema for the input data
const EXTRACTION_TEMPLATE = `Extract and save the relevant entities mentioned in the following job descriptions together with their properties.

text:
{input}
`;

const prompt = PromptTemplate.fromTemplate(EXTRACTION_TEMPLATE);

// currently this is based on requirements we have in the JD this can be different too
const schema = z.object({
        role: z.string().describe("The role mentioned in the job description"),
        education: z.string().describe("Minimum education required for the role"),
        location: z.string().describe("work location mentioned in the text"),
        skills: z.array(z.string()).describe("Extract top 7 skills mentioned in the job description"),
        responsibilities: z.array(z.string()).describe("Extract top 10 responsibilities mentioned in job description"),
        yearsOfExperience: z.number().describe("Years mentioned in the title"),

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

export default extract_JD_resume;