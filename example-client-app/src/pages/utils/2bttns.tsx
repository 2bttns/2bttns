import twobttns from "@2bttns/controller";

export const twobttnsController = new twobttns.Controller({
  appId: "example-app",
  secret: "example-secret-value",
  url: "http://localhost:3001",
});

// const test = twobttnsController.api
//   .path("/example/hello")
//   .method("get")
//   .create();
// test({ text: "hello" }).then((res) => {
//   console.log(res);
// });
