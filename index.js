const { ApolloServer, gql, PubSub } = require("apollo-server");
const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");
const util = require("util");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const typeDefs = gql`
  scalar Date

  enum Status {
    READING
    READ
    INTERESTED
    NOT_INTERESTED
    UNKNOWN
  }

  enum CharacterRole {
    NOT_SET
    PROTAGONIST
    ANTAGONIST
    DEUTERAGONIST
    TETRIARY
    LOVE_INTEREST
    CONFIDANT
    FOIL
  }

  enum CharacterType {
    NOT_SET
    DYNAMIC
    STATIC
    STOCK
    SYMBOLIC
    ROUND
  }

  type Character {
    id: ID
    name: String
    roleInBook: CharacterRole
    typeInBook: CharacterType
  }

  type Book {
    id: ID
    title: String!
    releaseDate: Date
    rating: Int
    status: Status
    isbn10: String
    isbn13: String
    characters: [Character]
    createdAt: Date
  }

  type Query {
    books: [Book]
    book(id: ID): Book
  }

  input CharacterInput {
    id: ID
  }

  input BookInput {
    id: ID
    title: String
    releaseDate: Date
    rating: Int
    status: Status
    isbn10: String
    isbn13: String
    characters: [CharacterInput]
  }

  type BookCharacters {
    book: Book
    character: Character
    roleInBook: CharacterRole
    typeInBook: CharacterType
  }

  type Mutation {
    addBook(book: BookInput): [Book]
  }

  type Subscription {
    bookAdded: Book
  }
`;

const pubsub = new PubSub();
const BOOK_ADDED = "BOOK_ADDED";

const resolvers = {
  Subscription: {
    bookAdded: {
      subscribe: () => {
        return pubsub.asyncIterator([BOOK_ADDED]);
      },
    },
  },

  Query: {
    books: async () => {
      try {
        return await prisma.book.findMany({});
      } catch (e) {
        console.error("Error in BOOKS Query: ", e);
      }
    },
    book: async (obj, args, context, info) => {
      try {
        const { id, title } = args;
        return await prisma.book.findOne({
          where: {
            id: id,
          },
        });
      } catch (e) {
        console.error("Error in BOOK Query: ", e);
      }
    },
  },

  // define Book->characters field

  Book: {
    Character: {
      roleInBook: async (parent, args, context, info) => {
        console.log("args in role", args);
        console.log("parent", parent);

        return await prisma.bookCharacters.findMany({
          where: { id: parent.id },
        });
      },
    },
  },

  Book: {
    characters: async (obj, args, context, info) => {
      console.log(obj.title);
      console.log(obj.id + "\n");
      // console.log(util.inspect(info, false, null, true));

      const charactersList = await prisma.character.findMany({
        where: {
          books: {
            some: {
              bookId: {
                equals: obj.id,
              },
            },
          },
        },
      });

      return charactersList;
    },
  },

  // Character: {
  //   roleInBook: (parent, args, context, info) => {
  //     // console.log("parent:", parent);
  //     // console.log("info", util.inspect(info, true, null, true));

  //     return null;
  //   },
  // },

  Mutation: {
    addBook: async (obj, { book }, context, info) => {
      try {
        const newBook = await prisma.book.create({
          data: {
            ...book,
          },
        });

        pubsub.publish(BOOK_ADDED, { bookAdded: newBook });

        const allBooks = await prisma.book.findMany({});

        return allBooks;
      } catch (e) {
        console.error(e);
        return [];
      }
    },
  },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "It's a date field.",
    parseValue(value) {
      // value from the client
      return new Intl.DateTimeFormat("pl-PL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(value);
    },
    serialize(value) {
      // value sent to the client

      const dateTime = new Date(value);

      const result = new Intl.DateTimeFormat("pl-PL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(dateTime);
      return result;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
        // console.log("Parsing to Date");
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
