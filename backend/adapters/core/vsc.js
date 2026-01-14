import fs from "fs";
import path from "path";

export function writeVSC(clientId, type, payload, baseDir = "test_runs") {
  const dir = path.join(baseDir, clientId);
  fs.mkdirSync(dir, { recursive: true });

  const file = path.join(dir, `${type}.vsc.json`);

  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        type,
        payload
      },
      null,
      2
    )
  );

  console.log("VSC written:", file);
}
