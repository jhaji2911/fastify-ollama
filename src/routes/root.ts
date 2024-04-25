import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {

  
    return { BBDTalks: {
      isRoot: true,
      version: '1.0.0',
      description: 'talks with you, for you!, head onto /docs to explore more',
      
    } }
  })
}

export default root;
