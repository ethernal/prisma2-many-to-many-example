const { ApolloServer } = require("apollo-server");

const typeDefs = require("./schema");
const resolvers = require("./resolvers/resolvers");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
  context: ({ req }) => {
    const fakeUser = {
      userId: "helloUser",
    };
    return { ...fakeUser };
  },
});

server
  .listen({
    port: process.env.PORT || 4000,
  })
  .then(({ url }) => {
    console.log(`Server started at ${url}`);
  });
