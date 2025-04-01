export const wait = (n: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, n * 1000);
  });
