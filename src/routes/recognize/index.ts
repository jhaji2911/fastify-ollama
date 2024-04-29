import type { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import { recognize } from '../../utils/ocr'

const recognizeImage: FastifyPluginAsync = async (fastify, _options): Promise<void> => {
    fastify.post('/', {
    schema: {
      consumes: ["application/json"],
      body: {
        type: "object",
        required: ["imageBase64"],
        properties: {
          imageBase64: { type: 'string' },
        },
      },
    },
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    // read the base64 encoded image from the request
    const { imageBase64 } = req.body as { imageBase64: string };
        
        // validate if the imageBase64 is actually a base64 encoded string
        const isBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(imageBase64);
        if (!imageBase64 || !isBase64) {
            return reply.code(400).send({
        error: 'Bad Request',
                message: 'No image uploaded or not a valid base64'
            });
    }

        // convert the base64 to buffer
        const buffer = Buffer.from(imageBase64, 'base64');

        // get the language selected by the user (if any, otherwise default to 'eng')
        const lang = 'eng';
    // recognize the text
        try {
            const text = await recognize(lang, buffer);

    // send the response
            return reply.code(200).send({
      message: 'Image to text conversion completed',
                data: { text }
    });
        } catch (err) {
            // handle OCR errors
            return reply.code(500).send({
                error: 'Internal Server Error',
                message: 'Failed to recognize text from image'
            });
        }
    });
};

export default recognizeImage;
