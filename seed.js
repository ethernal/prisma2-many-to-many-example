const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  log: ["info", "warn"],
});

const seedDB = async () => {
  if (process.argv[2] === "DELETE") {
    console.log("Destroying data..");
    await prisma.bookCharacters.deleteMany({});
    await prisma.character.deleteMany({});
    await prisma.book.deleteMany({});
    console.log("Data..DELETED");
  }

  console.log("Seeding DB with data..");
  console.log("Seeding Characters");

  const yoko = await prisma.character.create({
    data: {
      id: "4576b661-1531-4d86-91cc-29aa7bcfb3ba",
      name: "Yoko Nakajima",
    },
  });

  const rakshuun = await prisma.character.create({
    data: {
      id: "8a738e63-8662-47c1-9b6f-e61413f16506",
      name: "Rakshuun",
    },
  });

  const kaladin = await prisma.character.create({
    data: {
      id: "d70bf1be-2b94-4dc5-9f6f-6cc78d201e60",
      name: "Kaladin Stormblessed",
    },
  });

  const frodo = await prisma.character.create({
    data: {
      id: "1282fa12-2233-45a6-82ca-af4ddc6c9f86",
      name: "Frodo Baggins",
    },
  });

  const gollum = await prisma.character.create({
    data: {
      id: "06e4c65d-d46d-4716-9f4c-bc6672dc4d93",
      name: "Gollum",
    },
  });

  console.log("Seeding Books");

  const sa1 = await prisma.book.create({
    data: {
      id: "2b3f2881-129e-4509-a7c5-e16757da70c1",
      title: "Archives of the Stormlight",
      releaseDate: "2009-08-20",
      rating: 5,
      status: "UNKNOWN",
    },
  });

  const twk1 = await prisma.book.create({
    data: {
      id: "848fbdce-c2d2-4f7e-ab9f-8625e0723a31",
      title: "Twelve Kingdoms Volume 1",
      releaseDate: "2007-03-13",
      rating: 5,
      status: "READ",
      isbn10: "1427802572",
      isbn13: "9781598169461",
    },
  });

  const twk2 = await prisma.book.create({
    data: {
      id: "881f18b2-bcb2-4894-b9db-6d7f044f27cf",
      title:
        "Twelve Kingdoms Volume 2: Sea of Wind / Kaze no Umi, Meikyū no Kishi",
      releaseDate: "2008-03-11",
      rating: 5,
      status: "READ",
      isbn10: "1598169478",
      isbn13: "9781598169478",
    },
  });

  const lotr = await prisma.book.create({
    data: {
      id: "fbcb58b9-6d68-4817-bd8c-6bb5fbae0234",
      title: "The Lord of the Rings",
      releaseDate: "1963-05-30",
      rating: 5,
      status: "UNKNOWN",
      isbn10: "9780544003415",
      isbn13: "978-0544003415",
    },
  });

  console.log("Seeding Books <-> Characters Table");

  console.log(
    `Connecting ${yoko.name} (ID: ${yoko.id}) to book: ${twk1.title} (ID: ${twk1.id})`
  );

  await prisma.bookCharacters.create({
    data: {
      book: {
        connect: { id: twk1.id },
      },
      character: {
        connect: { id: yoko.id },
      },
    },
  });

  await prisma.bookCharacters.create({
    data: {
      book: {
        connect: { id: twk1.id },
      },
      character: {
        connect: { id: rakshuun.id },
      },
    },
  });

  await prisma.bookCharacters.create({
    data: {
      book: {
        connect: { id: twk2.id },
      },
      character: {
        connect: { id: rakshuun.id },
      },
    },
  });

  await prisma.bookCharacters.create({
    data: {
      book: {
        connect: { id: twk2.id },
      },
      character: {
        connect: { id: yoko.id },
      },
    },
  });

  await prisma.bookCharacters.create({
    data: {
      book: {
        connect: { id: lotr.id },
      },
      character: {
        connect: { id: frodo.id },
      },
    },
  });

  await prisma.bookCharacters.create({
    data: {
      book: {
        connect: { id: sa1.id },
      },
      character: {
        connect: { id: kaladin.id },
      },
    },
  });

  const validateBook = await prisma.book.findMany({
    where: { id: twk1.id },
    include: { characters: true },
  });

  console.log("Validate data:\n", JSON.stringify(...validateBook, null, 2));
};

seedDB(process.argv[0]).then(async () => {
  console.log("Closing DB connection.");
  await prisma.disconnect().then(() => {
    console.log("Seeding finished.");
    process.exit();
  });
});
