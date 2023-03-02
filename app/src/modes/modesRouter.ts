import { z } from "zod";
import { createTRPCRouter } from "../server/api/trpc";
import { publicProcedure } from "./../server/api/trpc";
import { classicModeRouter } from "./classic/backend/_index";
import { availableModes, modesUIRegistry } from "./modesUIRegistry";

// TODO: TRPC procedure to resolve mode UI props
// When done, pass the result to the Play page's PlayMode component
const resolveMode = publicProcedure
  .input(
    z.object({
      mode: z.enum(availableModes),
    })
  )
  .query(async ({ ctx, input }) => {
    const modeUIConfig = {};
    const modeUI = modesUIRegistry[input.mode];
    // TODO: Fetch mode config from DB and return it as props

    return { modeUIProps: modeUIConfig };
  });

export const modesRouter = createTRPCRouter({
  resolveMode,
  classicMode: classicModeRouter,
  // Register additional mode backend routers here
});
