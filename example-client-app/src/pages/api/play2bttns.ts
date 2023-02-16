import type { NextApiRequest, NextApiResponse } from "next";
import { twobttnsController } from "../utils/2bttns";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const gameId = req.query.gameId as string;
    const userId = req.query.userId as string;

    const url = twobttnsController.generatePlayUrl({ gameId, userId });
    const urlParse = new URL(url);
    console.log(urlParse.searchParams);
    return res.redirect(url);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Unknown error" });
  }
}
