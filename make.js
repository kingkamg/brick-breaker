const fs = require("fs");
const path = require("path");
const funcs = require("./funcs");
const program = require("commander");
const child = require("child_process");
const chalk = require("chalk");

program
    .option("-p, --platform <platform>", "Specify platform", (input) => {
        if (/^(wechat|android)$/g.test(input)) {
            return input;
        }
        throw new Error(chalk.red("[fail]") + "-p must be wechat|android");
    })
    .option("-v, --version-name <version>", "Specify version", (input) => {
        if (/^(\d+\.)*\d$/g.test(input)) {
            return input;
        }
        throw new Error(chalk.red("[fail]") + "-v must be N.N.N");
    })
    .option("-b, --build <build>", "Specify build", (input) => {
        if (/^\d+$/g.test(input)) {
            return input;
        }
        throw new Error(chalk.red("[fail]") + "-b must be a number");
    })
    .option("-c, --channel <channel>", "Specify channel", (input) => {
        if (/^(sagi|vivo|oppo)$/g.test(input)) {
            return input;
        }
        throw new Error(chalk.red("[fail]") + "-c must be sagi|vivo|oppo");
    })
    .option("--nb", "No build")
    .option("--np", "No package")
    .option("--upload", "upload to wx dev tools")
    .parse(process.argv);

if (!program.platform) {
    throw new Error(chalk.red("[fail]") + "-p is required");
}

// 1. copy sdk
const procedureCopySDK = () => {
    console.log(chalk.green("[start]"), "copy sdk");
    const jsDefault = path.join("build-templates", "javascript_default", "sdk");
    const jsAndroid = path.join("build-templates", "android", "javascript", "sdk");
    const jsWechat = path.join("build-templates", "javascript_wechat", "sdk");
    const assetSDK = path.join("assets", "Script");
    funcs.deleteFolderRecursive(path.join(assetSDK, "sdk"));
    funcs.copyFolderRecursiveSync(jsDefault, assetSDK);
    if (program.platform === "wechat") {
        funcs.copyFolderRecursiveSync(jsWechat, assetSDK);
    } else if (program.platform === "android") {
        funcs.copyFolderRecursiveSync(jsAndroid, assetSDK);
    }
    console.log(chalk.green("[success]"), "copy sdk");
};

// 1.1 copy project.json
const procedureCopyProjectJson = () => {
    console.log(chalk.green("[start]"), "copy project.json");
    const fpProjectJson = path.join("settings", "project.json");
    if (program.platform === "wechat") {
        funcs.copyFileSync(path.join("buildfiles", "project_wechat.json"), fpProjectJson);
    } else if (program.platform === "android") {
        funcs.copyFileSync(path.join("buildfiles", "project_android.json"), fpProjectJson);
    }
    console.log(chalk.green("[success]"), "copy project.json");
};

let gVersionName = "1.0.0";
let gBuildNumber = "1";

// 1.2 set version and build
const procedureVersionBuild = () => {
    console.log(chalk.green("[start]"), "version & build");
    const fpVersionJson = path.join("assets", "resources", "version.json");
    const jsonVersion = JSON.parse(fs.readFileSync(fpVersionJson).toString());
    if (program.platform) { jsonVersion.platform = program.platform; }
    if (program.versionName) { jsonVersion.version = program.versionName; }
    if (program.channel) { jsonVersion.channel = program.channel; }
    if (program.build) {
        jsonVersion.build = program.build;
    } else {
        jsonVersion.build = (parseInt(jsonVersion.build, 10) + 1).toString();
    }
    if (!jsonVersion.logs[jsonVersion.platform].hasOwnProperty(jsonVersion.channel)) {
        throw new Error(chalk.red("[fail]") + jsonVersion.platform + " has no channel " + jsonVersion.channel);
    }
    if (!jsonVersion.logs[jsonVersion.platform][jsonVersion.channel].hasOwnProperty(jsonVersion.version)) {
        console.log(chalk.yellow("[warn]"), `${jsonVersion.platform}.${jsonVersion.channel} has no version ${jsonVersion.version}, creating empty`);
        jsonVersion.logs[jsonVersion.platform][jsonVersion.channel][jsonVersion.version] = [];
    }
    gVersionName = jsonVersion.version;
    gBuildNumber = jsonVersion.build;
    fs.writeFileSync(fpVersionJson, JSON.stringify(jsonVersion, null, 2));
    console.log(chalk.green("[success]"), "version & build");
};

// 2. build project
const procedureBuildProject = () => {
    return new Promise((resolve, reject) => {
        if (program.nb) {
            console.log(chalk.yellow("[skip]"), "build project");
            resolve();
        } else {
            console.log(chalk.green("[start]"), "build project");
            let cocosPlatform = "";
            if (program.platform === "wechat") {
                cocosPlatform = "wechatgame";
            } else if (program.platform === "android") {
                cocosPlatform = "android";
            }
            const execCmd = `C:\\CocosCreator\\CocosCreator.exe --path . --build "platform=${cocosPlatform}"`;
            child.exec(execCmd, (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                    throw new Error(chalk.red("[fail]") + "unable to execute " + execCmd);
                }
                if (stderr) {
                    console.log(stderr);
                    throw new Error(chalk.red("[fail]") + execCmd);
                }
                console.log(stdout);
                console.log(chalk.green("[success]"), "build project");
                resolve();
            });
        }
    });
};

// 2.1 Android local.properties
const procedureAndroidLocalProperties = () => {
    if (program.platform !== "android") {
        return;
    }
    console.log(chalk.green("[start]"), "local.properties");
    const contents = `ndk.dir=C\\:\\\\Users\\\\yatyr\\\\AppData\\\\Local\\\\Android\\\\Sdk\\\\ndk-bundle
sdk.dir=C\\:\\\\Users\\\\yatyr\\\\AppData\\\\Local\\\\Android\\\\Sdk`;
    fs.writeFileSync(path.join("build", "jsb-default", "frameworks", "runtime-src", "proj.android-studio", "local.properties"), contents);
    console.log(chalk.green("[success]"), "local.properties");
};

// 3. subpackage & aladin
const procedureSubPackage = () => {
    if (program.platform !== "wechat") {
        return;
    }
    if (program.np) {
        console.log(chalk.yellow("[skip]"), "subpackage");
        return;
    }
    // subpackage
    console.log(chalk.green("[start]"), "subpackage");
    const gamejs = path.join("build", "wechatgame", "game.js");
    const data = fs.readFileSync(gamejs);
    const fd = fs.openSync(gamejs, "w+");
    const buffer1 = new Buffer(`
require("utils/ald-game.js");
`);
    const buffer2 = new Buffer("");
    fs.writeSync(fd, buffer1, 0, buffer1.length, 0);
    fs.writeSync(fd, data, 0, data.length, buffer1.length);
    fs.writeSync(fd, buffer2, 0, buffer2.length, buffer1.length + data.length);
    fs.closeSync(fd);
    console.log(chalk.green("[success]"), "subpackage");
};

// 4. upload to wx
const procedureUploadToWxdevtools = () => {
    console.log(chalk.green("[start]"), "upload to wx dev tools");
    return new Promise((resolve, reject) => {
        if (program.upload) {
            const wxVName = gVersionName;
            const wxDesc = ` v${gVersionName}-R${gBuildNumber}`;
            const execCmd = `D:\\Application\\wx-dev\\cli.bat -u ${wxVName}@D:\\Projects\\brick-breaker\\build\\wechatgame --upload-desc ${wxDesc}`;
            child.exec(execCmd, (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                    throw new Error(chalk.red("[fail]") + "unable to execute " + execCmd);
                }
                if (stderr) {
                    console.log(stderr);
                    throw new Error(chalk.red("[fail]") + execCmd);
                }
                console.log(stdout);
                console.log(chalk.green("[success]"), "upload to wx dev tools", wxVName + " " + wxDesc);
                resolve();
            });
        } else {
            console.log(chalk.yellow("[skip]"), "upload to wx dev tools");
            resolve();
        }
    });
};

// start!
procedureCopySDK();
procedureCopyProjectJson();
procedureVersionBuild();
procedureBuildProject().then(() => {
    procedureSubPackage();
    procedureAndroidLocalProperties();
    procedureUploadToWxdevtools();
});
