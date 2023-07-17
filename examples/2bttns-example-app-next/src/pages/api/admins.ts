import type { NextApiRequest, NextApiResponse } from "next";
import { twobttns } from "../../utils/2bttns";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const {
      data: { count },
    } = await twobttns.callApi("/administrators/count", "get");
    const response = await twobttns.callApi("/administrators", "get", {
      take: count,
    });
    res.status(200).json({ data: response.data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: (error as Error).message });
  }
}
