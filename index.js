const { exec } = require("child_process");
const lastNCommitFiles = 'git log -3 --name-only --oneline --pretty="tformat:"';
const grepConsole = "git grep -n console.log";
const targetBranch = "stage";

const getAheadCommit = () => {
  return new Promise((resolve, reject) => {
    exec(
      `git rev-list --count origin/${targetBranch}..HEAD`,
      (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve(stdout);
        }
      }
    );
  });
};
const getLastNCommitFiles = async () => {
  const stdoutStr = await getAheadCommit();
  const aheadCommits = stdoutStr.split("\n");
  const cmdStr = `git log -${aheadCommits.length} --name-only --oneline --pretty="tformat:"`;
  return cmdStr;
};
const excuteCommand = async (cmdStr) => {
  return new Promise((resolve, reject) => {
    exec(cmdStr, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
};
const getLastNCommitFileObj = async () => {
  const cmdStr = await getLastNCommitFiles();
  const stdoutStr = await excuteCommand(cmdStr);
  let stdoutArr = stdoutStr.split("\n");
  stdoutArr = stdoutArr.filter((f) => {
    return !!f;
  });
  return stdoutArr;
};

const formatGrepConsole = async () => {
  const stdoutStr = await excuteCommand(grepConsole);
  let stdoutArr = stdoutStr.split("\n");
  stdoutArr = stdoutArr.filter((f) => {
    return !!f;
  });
  return stdoutArr;
};
const consoleItemsToPathMap = (arr) => {
  const resMap = {};
  let tempArr = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    const item = arr[i];
    tempArr = item.split(":");
    const filePath = tempArr[0];
    const lineNum = tempArr[1];
    const obj = {
      filePath,
      lineNum,
      origin_str: item,
    };
    if (resMap[filePath]) {
      resMap[filePath].push(obj);
    } else {
      resMap[filePath] = [obj];
    }
  }
  return resMap;
};
const outputToTerminal = async (str) => {
  console.log(str);
  await excuteCommand(`echo "${str}"`);
};

const init = async () => {
  const changedFiles = await getLastNCommitFileObj();
  const consoleItems = await formatGrepConsole();
  const pathMap = consoleItemsToPathMap(consoleItems);
  let arr = [];
  Object.keys(pathMap).forEach((path) => {
    if (changedFiles.includes(path)) {
      arr = arr.concat(pathMap[path]);
    }
  });
  const outputConsole = arr.map((item) => {
    return item.origin_str;
  });
  outputToTerminal(outputConsole.join("\n"));
  // console.log(outputConsole, 'outputConsole')
};
init();
