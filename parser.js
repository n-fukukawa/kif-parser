const fs = require("fs");

const filePath = `四間飛車vsエルモ右四間飛車.kif`;

const text = fs.readFileSync(filePath, { encoding: "UTF-8" });

const lines = text.split("\n").map((line) => line.trim());

const startIndex = lines.findIndex((line) => line.startsWith("手数")) + 1;

const blocks = [];
let block = [];
for (let i = startIndex; i < lines.length; i++) {
  const line = lines[i];
  if (line === "") {
    blocks.push([...block]);
    block = [];
    continue;
  }

  if (line.startsWith("変化")) {
    block.push(line);
  } else {
    const pattern = line.includes("打")
      ? /(\d+)\s(.+打)/
      : /(\d+)\s(.+)(\(\d+\))/;

    const match = line.match(pattern);

    if (match === null) continue;

    const step = match[1];
    const symbol = step % 2 === 1 ? "▲" : "△";

    block.push((symbol + match[2]).replace("　", ""));
  }
}

if (blocks.length === 0) {
  throw new Error("データがありません");
}

const branches = [blocks[0]];

const pattern = /変化：(\d+)手/;
for (let i = 1; i < blocks.length; i++) {
  const block = blocks[i];
  const match = block[0].match(pattern);
  const step = match?.[1] ?? null;

  if (step === null) {
    continue;
  }

  let branch = branches[i - 1].slice(0, step);
  branch = branch.concat(block.slice(1));

  branches.push(branch);
}

const result = branches.reduce(
  (str, branch) => str + branch.join("") + "\n",
  [""]
);

fs.writeFileSync("export.txt", result);
