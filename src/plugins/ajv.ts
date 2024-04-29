// import Ajv from "ajv";
// import fp from "fastify-plugin";


// const ajvFilePlugin = () => {
//     const ajv = new Ajv({allErrors: true, coerceTypes: true})
//     return ajv.addKeyword({
//       keyword: 'isFile',
//       compile: (_schema, parent, _it) => {
//         parent.type = 'file'
//         delete parent.isFile
//         return () => true
//       }
//     })
//   }
// export default fp(async (fastify) => {
//   await fastify.register(ajvFilePlugin);
// });
