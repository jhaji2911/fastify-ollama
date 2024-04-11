import { FastifyPluginAsync } from "fastify";
import axios from 'axios';

const mistral: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: { type: 'string' },
          model: { type: 'string', default: 'mistral:7b-instruct' },
          stream: { type: 'boolean', default: false },
        }
      }
    },
  }, async function (request, reply) {
    const body = request.body; // Access the request body here

    const thirdPartyUrl = 'http://localhost:11434/api/generate'; // Replace with the actual third-party URL

    try {
      // Make a proxy request to the third-party URL with the request body
      const response = await axios.post(thirdPartyUrl, body, {
        headers: {
          'Content-Type': 'application/json'
        },
      });

      // Check if the response from the third-party API is successful
      if (response.status === 200) {
        const data = response.data.response;
        reply.send(data); // Send the data from the third-party API to the client
      } else {
        reply.code(response.status).send({ message: `Error: ${response.statusText}` });
      }
    } catch (error) {
      // Handle any errors that occur during the API request
      reply.code(500).send({ message: `Error: ${error}` });
    }
  });
};

export default mistral;
