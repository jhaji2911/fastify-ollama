import type { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import { type MultipartValue } from '@fastify/multipart'

import { recognize } from '../../utils/ocr'
import { isEmpty } from '../../utils/check'

const recognizeImage: FastifyPluginAsync = async (fastify, _options): Promise<void> => {
   
  
    fastify.post('/', {
    schema: {
      consumes: ["multipart/form-data"],
      body: {
        type: "object",
        required: ["myField"],
        properties: {
          myField: { isFile: true },
        },
      },
    },
  }, async (req: FastifyRequest, reply: FastifyReply) => {
    // read the file from the request
    const data = await req.file()
    if (data === undefined) {
      return await reply.code(400).send({
        error: 'Bad Request',
        message: 'No file uploaded'
      })
    }

    // convert the file to buffer
    let buffer: Buffer
    try {
      buffer = await data.toBuffer()
    } catch (err) {
      return await reply.code(400).send({
        error: 'Bad Request',
        message: 'File size exceeded the limit'
      })
    }

    // get the language selected by the user
    const lang = !isEmpty((data.fields?.language as MultipartValue)?.value) ? (data.fields.language as MultipartValue).value : 'eng'

    // recognize the text
    const text = await recognize(lang as string, buffer)

    // send the response
    return await reply.code(200).send({
      message: 'Image to text conversion completed',
      data: {
        text
      }
    })
  })
}

export default recognizeImage;