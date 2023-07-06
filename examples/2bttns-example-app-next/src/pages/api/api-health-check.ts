// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { twobttns } from "../../utils/2bttns";

// Endpoint for checking if 2bttns SDK configured correctly
// If you can't see the message, your 2bttns SDK configuration may be incorrect (e.g. invalid API key, app name, or 2bttns admin panel url)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await twobttns.callApi("/example/getSecretMessage", "get");
    res.status(200).json({ data: response.data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: (error as Error).message });
  }
}
