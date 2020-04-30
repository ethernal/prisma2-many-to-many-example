const { ApolloServer, gql } = require("apollo-server");
const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");

const typeDefs = gql`
  scalar Date

  enum Status {
    READING
    READ
    INTERESTED
    NOT_INTERESTED
    UNKNOWN
  }

  type Character {
    id: ID
    name: String
  }

  type Book {
    id: ID!
    title: String
    releaseDate: Date
    rating: Int
    status: Status
    characters: [Character]
  }

  type Query {
    books: [Book]
    book(id: ID): Book
  }
`;

const books = [
  {
    id: "123456789",
    title: "Twelve Kingdoms",
    releaseDate: "2000-10-10",
    rating: 5,
  },
  {
    id: "23456789",
    title: "Archives of the Stormlight",
    releaseDate: "2009-08-20",
    rating: 5,
  },
  {
    id: "3456789",
    title: "Lord of the Rings",
    releaseDate: "1963-05-30",
    rating: 5,
  },
];

const resolvers = {
  Query: {
    books: () => {
      return books;
    },
    book: (obj, args, context, info) => {
      const { id } = args;
      const foundBook = books.find((book) => {
        return book.id === id;
      });
      return foundBook;
    },
  },

  Date: new GraphQLScalarType({
    name: "Date",
    description: "It's a date field.",
    parseValue(value) {
      // value from the client
      return new Date(value);
    },
    serialize(value) {
      //value sent to the client
      return value.getTime();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});

server
  .listen({
    port: process.env.PORT || 4000,
  })
  .then(({ url }) => {
    console.log(`Server started at ${url}`);
  });
