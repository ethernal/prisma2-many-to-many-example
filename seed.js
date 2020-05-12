const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  log: ["info", "warn"],
});

const seedDB = async () => {
  if (process.argv[2] === "DELETE") {
    console.log("Destroyng data..");
    await prisma.bookCharacters.deleteMany({});
    await prisma.character.deleteMany({});
    await prisma.book.deleteMany({});
  }

  console.log("Seeding DB with data..");
  console.log("Seeding Characters");

  const yoko = await prisma.character.create({
    data: {
      name: "Yoko Nakajima",
    },
  });

  const rakshuun = await prisma.character.create({
    data: {
      name: "Rakshuun",
    },
  });

  const kaladin = await prisma.character.create({
    data: {
      name: "Kaladin Stormblessed",
    },
  });

  const frodo = await prisma.character.create({
    data: {
      name: "Frodo Baggins",
    },
  });

  const gollum = await prisma.character.create({
    data: {
      name: "Gollum",
    },
  });

  console.log("Seeding Books");

  const sa1 = await prisma.book.create({
    data: {
      title: "Archives of the Stormlight",
      releaseDate: "2009-08-20",
      rating: 5,
      status: "UNKNOWN",
    },
  });

  const twk1 = await prisma.book.create({
    data: {
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

  console.log("Validate data:");

  console.log(
    await prisma.book.findMany({
      where: { id: twk1.id },
      include: { characters: true },
    })
  );
};

seedDB(process.argv[0]).then(async () => {
  console.log("Closing DB connection.");
  await prisma.disconnect().then(() => {
    console.log("Seeding finished.");
    process.exit();
  });
});
