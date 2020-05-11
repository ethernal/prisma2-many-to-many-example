const hasFullICU = (() => {
  try {
    const january = new Date(9e8);
    const spanish = new Intl.DateTimeFormat("es", { month: "long" });
    return spanish.format(january) === "enero";
  } catch (err) {
    return false;
  }
})();

console.log(hasFullICU);

console.log(new Date("2020-05-06"));
