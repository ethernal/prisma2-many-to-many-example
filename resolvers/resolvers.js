const { PubSub } = require("apollo-server");
const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");
const util = require("util");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
    books: async (parent, args, context, info) => {
      console.log("parent of Query->books: ", parent);

      try {
        return await prisma.book.findMany({});
      } catch (e) {
        console.error("Error in BOOKS Query: ", e);
        throw e;
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
        throw e;
      }
    },
    character: async (parent, { id }, context, info) => {
      return prisma.character.findOne({
        where: { id: id },
        include: {
          books: {
            include: { book: true },
          },
        },
      });
    },
    characters: async () => {
      try {
        return prisma.character.findMany({});
      } catch (e) {
        console.error("Error in Characters Query: ", e);
        throw e;
      }
    },

    charactersInBook: async (parent, args, context, info) => {
      try {
        return prisma.bookCharacters.findMany({
          select: {
            character: true,
          },
          where: {
            bookId: args.bookId,
          },
        });
      } catch (e) {
        console.error("Error in Characters Query: ", e);
        throw e;
      }
    },
  },

  // define Book->characters field

  Character: {
    books: async (parent, args, context, info) => {
      console.log("args", args);
      console.log(util.inspect(parent, false, null, true));

      const booksWithCharacter = await prisma.bookCharacters.findMany({
        select: { book: true },
        where: { characterId: { every: args.id } },
      });

      return [{ title: "Something" }];
    },
  },

  Book: {
    characters: async (parent, args, context, info) => {
      const characterList = await prisma.bookCharacters.findMany({
        where: {
          bookId: {
            equals: parent.id,
          },
        },
        include: {
          character: true,
        },
      });

      const characterInfo = characterList.map((character) => {
        const pureCharacter = { ...character };
        delete pureCharacter.character;

        //keep character at the bottom as this will preserve the character createdAt and modifiedAt fields although modifiedAt should be taken from the BookCharacters in general.
        return {
          ...pureCharacter,
          ...character.character,
        };
      });

      return characterInfo;
    },
  },

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
    description: "Date custom scalar type",
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

      const result = new Intl.DateTimeFormat("pl-PL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(value);
      return result;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
        // console.log("Parsing to Date");
        return new Date(+ast.value);
      }

      return null;
    },
  }),
};

module.exports = resolvers;
