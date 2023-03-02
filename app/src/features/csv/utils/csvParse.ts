import { parse } from "csv-parse";

export default async function csvParse(
  file: File,
  onRecord: (line: any) => Promise<void>
) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = async function () {
      const parser = parse({
        delimiter: ",",
        columns: true,
      });

      const promises: Promise<void>[] = [];

      parser.on("readable", async function () {
        let record;
        while ((record = parser.read())) {
          promises.push(onRecord(record));
        }
      });

      parser.on("end", async function () {
        await Promise.all(promises);
        resolve();
      });

      parser.on("error", function (error) {
        reject(error);
      });

      parser.write(reader.result as string);
      parser.end();
    };
  });
}
