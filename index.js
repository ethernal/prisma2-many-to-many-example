const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
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
    releaseData: String
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
};

const server = new ApolloServer({ typeDefs, resolvers });

server
  .listen({
    port: process.env.PORT || 4000,
  })
  .then(({ url }) => {
    console.log(`Server started at ${url}`);
  });
