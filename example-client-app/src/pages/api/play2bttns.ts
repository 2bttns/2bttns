import type { NextApiRequest, NextApiResponse } from "next";
import { twobttnsController } from "../utils/2bttns";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const gameId = req.query.gameId as string;
  const userId = req.query.userId as string;

  const url = twobttnsController.url;

  return res.redirect(`${url}/play?game_id=${gameId}&userId=${userId}`);
}
