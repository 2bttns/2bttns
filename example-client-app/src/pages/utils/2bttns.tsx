import twobttns from "@2bttns/controller";

export const twobttnsController = new twobttns.Controller({
  appId: "example-client-app",
  secret: "OVTGng6GC4kT2zGINR/brqO1AaVam+EcTvX/74CmzH4=",
  url: "http://localhost:3001",
});

// const test = twobttnsController.api
//   .path("/example/hello")
//   .method("get")
//   .create();
// test({ text: "hello" }).then((res) => {
//   console.log(res);
// });