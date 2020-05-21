const { gql } = require("apollo-server");

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
    TERTIARY
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
    books: [BookCharacters]
  }

  type Book {
    id: ID
    createdAt: Date
    title: String!
    releaseDate: Date
    rating: Int
    status: Status
    isbn10: String
    isbn13: String
    characters: [Character]
  }

  type Query {
    books: [Book]
    book(id: ID): Book
    characters: [Character]
    character(id: ID): Character
    charactersInBook(bookId: ID): [Character]
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

module.exports = typeDefs;
