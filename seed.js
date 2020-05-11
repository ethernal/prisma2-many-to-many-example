const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  log: ["query", "info", "warn"],
});

const seedDB = async () => {
  // console.log(
  //   await prisma.book.create({
  //     data: {
  //       title: "Twelve Kingdoms",
  //       releaseDate: "2000-10-10",
  //       rating: 5,
  //       status: "UNKNOWN",
  //     },
  //   })
  // ),
  //   await prisma.book.create({
  //     data: {
  //       title: "Archives of the Stormlight",
  //       releaseDate: "2009-08-20",
  //       rating: 5,
  //       status: "UNKNOWN",
  //     },
  //   }),
  await prisma.book.create({
    data: {
      title: "The Lord of the Rings",
      releaseDate: "1963-05-30",
      rating: 5,
      status: "UNKNOWN",
      isbn10: "9780544003415",
      isbn13: "978-0544003415",
    },
  });
};

seedDB();

prisma.disconnect().then(() => {
  process.exit();
});
