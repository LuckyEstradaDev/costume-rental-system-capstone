import app from "./app.js";

export const startServer = () => {
  app.listen(5000, () => {
    console.log("Listening");
  });
};
