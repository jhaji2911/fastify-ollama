// this will generate questions from the analyzed report of the candidate

import { FastifyPluginAsync } from "fastify";
import { PromptTemplate } from "langchain/prompts";
import z from "zod";
import { deepseek_coder, llama3_ai, mistral_ai } from "../../utils/constants";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import zodToJsonSchema from "zod-to-json-schema";
import { OllamaFunctions } from "langchain/experimental/chat_models/ollama_functions";

const generate_questions :FastifyPluginAsync = async (fastify): Promise<void> => { 
    const  QUESTIONNAIRE_TEMPLATE = `
    Extract and save the relevant information from the candidate's analyzed report , where we have skills , experience, number of years, every object has resume's and job description's values in their object, 
    Evaluate and generate questions based on the data from the JSON file, extract the values in the exact format mentioned in schema

    report : {input}
    `

    const prompt = PromptTemplate.fromTemplate(QUESTIONNAIRE_TEMPLATE);

    const schema  = z.object({
        candidate: z.object({
            name: z.string().describe('Name of the candidate from the report'),
            role: z.string().describe('Role for which the candidate is applying for'),
            skills: z.array(z.string()).describe('Skills mentioned by the candidate in their resume'),
            years_of_experience: z.number().describe('Years of experience mentioned by the candidate in their resume'),
        }),
        questions: z.array(z.string()).describe("Generate at least 5 questions related to candidate's experience and skills vs required skills mentioned in the job description"),
        soft_skills_questions: z.array(z.string()).describe("Generate at least3 soft skills questions related to the role's responsibilities and requirements"),
        technical_questions: z.array(z.string()).describe("Generate at least 7 technical questions related to the role's responsibilities and requirements"),
    
    
})



const model = new OllamaFunctions({
    temperature: 0.2,
    model: deepseek_coder,
}).bind({
    functions: [
      {
        name: "information_extraction",
        description: "Extracts information from the JSON file and generates questions based on it.",
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

const chain = await prompt.pipe(model).pipe(new JsonOutputFunctionsParser());
fastify.post('/',{
    schema:{
        body:{
          type:'object',
          description : 'Generate questions based on the data from JSON file',
          title:'Question generator',         
          required:['report'],
          properties:{
            report:{type:'string'},
          },
        }
    },

}, async (request, reply) => {

    const { report } = request.body as {report: string};
    if(!report) {
        throw new Error("report not provided");
    }
    try {
        const result = await chain.invoke({ input: report });
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
};

export default generate_questions;