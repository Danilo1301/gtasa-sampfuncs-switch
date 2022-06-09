const fs = require("fs");

const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
const PATH_FILES = config["path_files"];
const PATH_TMP = PATH_FILES + "\\.tmp";
const PATH_GTA = config["path_gta"];
const sampfuncsFiles = config["files"];

async function main()
{
    if(!checkPath(PATH_FILES))
    {
        console.log(`Path '${PATH_FILES}' does not exists!`);
        return;
    }
    if(!checkPath(PATH_GTA))
    {
        console.log(`Path '${PATH_GTA}' does not exists!`);
        return;
    }

    if(!fs.existsSync(PATH_TMP))
    {
        fs.mkdirSync(PATH_TMP);
        console.log(`tmp folder created`);
    }

    console.log(`Sampfuncs installed? ${getIsSampfuncsInstalled()}`);

    if(getIsSampfuncsInstalled())
    {
        await moveSampfuncsFilesOutOfGTA();
    } else {
        await moveSampfuncsFilesInsideGTA();
    }

    console.log(`\nResult:`);
    console.log(`Sampfuncs installed? ${getIsSampfuncsInstalled()}`);
}

function getIsSampfuncsInstalled()
{
    return checkPath(PATH_GTA + "\\" + "SAMPFUNCS");
}

async function moveSampfuncsFilesInsideGTA()
{
    console.log(`Checking files...`);

    for(const file of sampfuncsFiles)
    {
        const filePath = PATH_GTA + "\\" + file;

        console.log(`Checking ${file}`);

        if(fs.existsSync(filePath))
        {
            console.log(`File ${file} will be replaced, sending to tmp...`);

            const err = await move(filePath, PATH_TMP + "\\" + file);
            console.log(err == undefined ? "Moved" : ("Error " + err));
        }
    }

    console.log(`Moving files...`);

    for(const file of sampfuncsFiles)
    {
        console.log(`Moving ${file}`);

        const err = await move(PATH_FILES + "\\" + file, PATH_GTA + "\\" + file);
        console.log(err == undefined ? "Moved" : ("Error " + err));
    }
}

async function moveSampfuncsFilesOutOfGTA()
{
    console.log(`Moving files...`);

    for(const file of sampfuncsFiles)
    {
        const err = await move(PATH_GTA + "\\" + file, PATH_FILES + "\\" + file);
        console.log(err == undefined ? "Moved" : ("Error " + err));
    }

    console.log(`Moving tmp files back...`);

    for(const file of fs.readdirSync(PATH_TMP))
    {
        console.log(`Moving ${file}`);

        const err = await move(PATH_TMP + "\\" + file, PATH_GTA + "\\" + file);
        console.log(err == undefined ? "Moved" : ("Error " + err));
    }
}

function move(oldPath, newPath)
{
    return new Promise(resolve => {
        fs.rename(oldPath, newPath, function (err) {
            if (err) {
                if (err.code === 'EXDEV') {
                    copy();
                } else {
                    resolve(err);
                }
                return;
            }
            resolve();
        });
    })
}

/**
* @param {string} path
*/
function checkPath(path)
{
    if(!fs.existsSync(path))
    {
        return false;
    }
    return true;
}

main();