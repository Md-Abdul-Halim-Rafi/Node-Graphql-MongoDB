const { ApolloServer, PubSub } = require("apollo-server");
const mongoose = require("mongoose");

const resolvers = require("./graphql/resolvers/index");
const { typeDefs } = require("./graphql/typeDefs");
const { MONGODB } = require("./config");

const PORT = process.env.PORT || 3000;

const pubsub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

mongoose
  .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => server.listen({ port: PORT }))
  .then((res) => console.log(`Server with mongodb is running on ${res.url}`));
