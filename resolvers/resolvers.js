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
      console.log("Running Query->books");

      try {
        return await prisma.book.findMany({});
      } catch (e) {
        console.error("Error in BOOKS Query: ", e);
        throw e;
      }
    },
    book: async (obj, args, context, info) => {
      console.log("Running Query->book");

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
      console.log("id", id);
      console.log("Running Query->character");

      const character = await prisma.character.findOne({
        where: { id: id },
        include: {
          books: {
            include: { book: true },
          },
        },
      });
      console.log("character", character);

      return character;
    },
    characters: async () => {
      console.log("Running Query->characters");

      try {
        return prisma.character.findMany({});
      } catch (e) {
        console.error("Error in Characters Query: ", e);
        throw e;
      }
    },

    charactersInBook: async (parent, args, context, info) => {
      console.log("Running Query->charactersInBook");

      try {
        const characters = await prisma.bookCharacters.findMany({
          include: {
            character: true,
          },
          where: {
            bookId: args.bookId,
          },
        });
        console.log("characters", characters);
        return characters;
      } catch (e) {
        console.error("Error in Characters Query: ", e);
        throw e;
      }
    },
  },

  // define Book->characters field

  Character: {
    books: async (parent, args, context, info) => {
      console.log("Running Character->books mapping");

      // console.log("args", args);
      // console.log(util.inspect(parent, false, null, true));

      const booksWithCharacter = await prisma.bookCharacters.findMany({
        include: { book: true },
        where: { characterId: { every: args.id } },
      });

      return booksWithCharacter;
    },
  },

  Book: {
    characters: async (parent, args, context, info) => {
      console.log("Running Book->characters mapping");

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
