import { GeneratePlayURLParams } from "@2bttns/sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { twobttns } from "../../utils/2bttns";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const gameId = req.query.gameId as GeneratePlayURLParams["gameId"];
    const playerId = req.query.playerId as GeneratePlayURLParams["playerId"];
    const numItems = req.query.numItems as GeneratePlayURLParams["numItems"];
    const callbackUrl = req.query
      .callbackUrl as GeneratePlayURLParams["callbackUrl"];

    const url = twobttns.generatePlayUrl({
      gameId,
      playerId,
      numItems,
      callbackUrl,
    });
    console.log(url);
    return res.redirect(url);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Unknown error" });
  }
}
