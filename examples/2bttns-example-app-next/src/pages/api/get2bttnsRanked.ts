// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { TwoBttnsRankedOutput, twobttns } from "../../utils/2bttns";

export type Get2bttnsRankedResponse =
  | TwoBttnsRankedOutput
  | { code: number; message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Get2bttnsRankedResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ code: 405, message: "Method not allowed" });
  }

  try {
    if (!req.query.inputTags) throw "req.query.inputTags is required";
    if (!req.query.outputTag) throw "req.query.outputTag is required";
    if (!req.query.playerId) throw "req.query.playerId is required";
  } catch (msg) {
    return res.status(400).json({ code: 400, message: msg as string });
  }

  const inputTags = req.query.inputTags as string;
  const outputTag = req.query.outputTag as string;
  const playerId = req.query.playerId as string;

  try {
    const response = await twobttns.callApi("/game-objects/ranked", "get", {
      inputTags,
      outputTag,
      playerId,
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ code: 500, message: (error as Error).message });
  }
}
