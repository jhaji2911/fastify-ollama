import { FastifyPluginAsync } from "fastify"

const hello: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return 'hi buddy our AI agents and free and 🤣!'
  })
}

export default hello;
