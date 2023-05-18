import { json2csvAsync } from "json-2-csv";

export default async function exportCsv(data: Object[], fileName: string) {
  const csv = await json2csvAsync(data, { emptyFieldValue: "" });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.remove();
  link.setAttribute("download", fileName);
  link.click();
}
