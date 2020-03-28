const fs = require('fs')
const os = require('os')
const path = require('path')
const AdmZip = require('adm-zip');

const beamMods = path.join(os.homedir(), "Documents", "BeamNG.drive", "mods-old")
const beamRepo = path.join(beamMods, "repo")
const ModderDir = path.join(os.homedir(), "Documents", "My Games", "carModifyer")
const unzipMods = path.join(ModderDir, "unzipedMods")

let Mods = []

let index = 0

document.onload = () => {
    findMods();
}

function findMods() {
    let repo = false
    fs.readdir(beamMods, "utf8", (err, files) => {
        if (err) console.error(err)
        document.getElementById('mods').innerHTML = '';
        ForEach(files, async file => {
            if (file == "repo") {
                repo = true;
            }
            getMod(file, "default")
        }, () => {
            if (repo) {
                fs.readdir(beamRepo, "utf8", (err, files) => {
                    if (err) console.error(err)
                    ForEach(files, async file => {
                        getMod(file, "repo")
                    }, () => {
                        LoadedMods();
                    })
                })
            } else {
                LoadedMods();
            }
        })
    })
}

function getMod(file, location) {
    let folder = beamMods
    if (location !== "default") {
        folder = beamRepo
    }

    if (path.extname(file) == '.zip') {
        let zipLoc = path.join(folder, file)
        let mod = file.replace(".zip", "")

        var zip = new AdmZip(zipLoc);
        var zipEntries = zip.getEntries();

        zipEntries.forEach((zipEntry) => {
            if (zipEntry.name == "camso_engine.jbeam") {
                let name = document.createElement('div');
                name.classList.add('carName');
                name.classList.add('button');
                name.id = `Mod_${index}`;
                name.innerHTML = mod;
                name.setAttribute("onclick", `modSelect(${JSON.stringify(mod)}, ${JSON.stringify(folder)})`)
                document.getElementById('mods').appendChild(name);
                Mods.push(mod)
                index++;

                //zip.extractAllTo(unzipMods, true)
            }
        });
    }
}

function LoadedMods() {

}

function modSelect(modName, folder) {
    let zipLoc = path.join(folder, `${modName}.zip`)
    var zip = new AdmZip(zipLoc);
    zip.extractAllTo(path.join(ModderDir, "unzipedMods", modName), true);

    let div = document.getElementById('modName');
    div.innerHTML = modName;

    fs.readdir(path.join(ModderDir, "unzipedMods", modName, "vehicles"), "utf8", (err, folders) => {
        if (err) console.err(err);
        let trimName = folders[0]

        let img = document.getElementById('previewImage');
        img.innerHTML = '';
        img = document.createElement('img');
        img.classList.add('previewImage');
        img.src = path.join(ModderDir, "unzipedMods", modName, "vehicles", trimName, "default.png")
        document.getElementById('previewImage').appendChild(img);
    })
}

function ForEach(arr, callback1, callback2) {
    for (i = 0; i < arr.length; i++) {
        callback1(arr[i], i, arr)
    }
    callback2()
}