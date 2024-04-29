import { PromptTemplate } from '@langchain/core/prompts';
// this will analyze the response returned from both the APIs and calculate a score and other details, 
// in the next version we would be adding more features such as db connections and more

import { FastifyPluginAsync } from "fastify";
import { OllamaFunctions } from 'langchain/experimental/chat_models/ollama_functions';
import z from 'zod';
import { deepseek_coder } from '../../utils/constants';
import zodToJsonSchema from 'zod-to-json-schema';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';



const analyze: FastifyPluginAsync = async (fastify): Promise<void> => {
    
const ANALYTICAL_TEMPLATE = `
 Extract and save the relevant information from both resumes and job descriptions using NLP (Natural Language Processing) techniques. Use a scoring system to determine how well-suited the candidate is based on their skills, education, experience etc

resume: {input1}
job description: {input2}
`;

const prompt  = PromptTemplate.fromTemplate(ANALYTICAL_TEMPLATE);

const schema = z.object({
    name:z.string().describe('Name of the candidate'),
    role: z.object({
        resume_role: z.string().describe('Role mentioned in the resume'),
        job_description_role: z.string().describe('Role mentioned in the job description')
    }),
    location: z.object({
        job_location: z.string().describe(
            'Location mentioned in the job description'
             ),
        resume_location: z.string().describe(
            'Location mentioned in the resume'
        ),
        // confidence_score: z.number().describe('Confidence score in location match'),
    }),
    skills: z.object({
        job_skills: z.array(z.string()).describe('Required skills mentioned in the job description'),
        candidate_skills: z.array(z.string()).describe('Skills mentioned in the resume'),
        // confidence_score: z.number().describe('Confidence score in skills match'),
    }),
    education: z.object({
        job_education: z.string().describe(
            'Required education mentioned in the job description'
         ),
        candidate_education: z.string().describe('Education mentioned in the resume'),
        // confidence_score: z.number().describe('Confidence score in education match'),
    }),
    yearsOfExperience: z.object({
        job_experience: z.number().describe('Number of years mentioned in job description'),
        resume_experience: z.number().describe('Number of years mentioned in resume'),
        // confidence_score: z.number().describe('Confidence score in years of experience vs required years of experience')
    }),
    responsibilitiesTaken: z.object({
        job_responsibilities: z.array(z.string()).describe('Responsibilities mentioned in job description'),
        resume_responsibilities: z.array(z.string()).describe('Responsibilities taken by the candidate mentioned in resume'),
        // confidence_score: z.number().describe('Confidence score in responsibilities match')
    }),
    domain: z.string().describe('domain of the role'),
    confidence: z.number().describe('confidence score based on the analysis')

});
   
 

const model = new OllamaFunctions({
    temperature: 0.1,
    model: deepseek_coder,
}).bind({
    functions: [
      {
        name: "information_extraction",
        description: "Matches skills, education and experience with the job description and resume.",
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
          description : 'compare resume vs description, pass stringified JSON of resume and job description',
          title:'Resume vs Job Description Comparison API',         
          required:['resume', 'job_description'],
          properties:{
              resume:{type:'string'},
              job_description: {type: 'string'}

          },
        }
    },

}, async (request, reply) => {

    const { resume , job_description } = request.body as { resume: string , job_description: string };
    if(!resume || !job_description) {
        throw new Error("resume or job_description not provided");
    }
    try {
        const result = await chain.invoke({input1: resume , input2: job_description  });
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


export default analyze;

