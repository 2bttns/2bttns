import type { NextApiRequest, NextApiResponse } from "next";
import { twobttnsController } from "../utils/2bttns";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const gameId = req.query.game_id as string;
    const userId = req.query.user_id as string;

    const url = twobttnsController.generatePlayUrl({ gameId, userId });
    return res.redirect(url);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Unknown error" });
  }
}
