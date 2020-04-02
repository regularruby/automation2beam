const fs = require('fs')
const os = require('os')
const path = require('path')
const AdmZip = require('adm-zip');

const beamMods = path.join(os.homedir(), "Documents", "BeamNG.drive", "mods")
const beamRepo = path.join(beamMods, "repo")
const ModderDir = path.join(os.homedir(), "Documents", "My Games", "carModifyer")
const unzipMods = path.join(ModderDir, "unzipedMods")

let Mods = [];
let UnZipedMods = [];

let itemPerPage = 0;
let currentPage = 1;
let pageCount = 0;

window.onload = () => {
    itemPerPage = Math.floor(document.getElementById('mods').clientHeight / 36)
    findMods();
}

window.onresize = () => {
    itemPerPage = Math.floor(document.getElementById('mods').clientHeight / 36)
    pageCount = Math.ceil(Mods.length / itemPerPage)
    updateModList()
}

function findMods() {
    let repo = false
    fs.readdir(beamMods, "utf8", (err, files) => {
        if (err) console.error(err)
        document.getElementById('mods').innerHTML = '';
        Mods = []
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
                let obj = {}
                obj.name = mod;
                obj.locat = folder
                Mods.push(obj)
            }
        });
    }
}

function LoadedMods() {
    pageCount = Math.ceil(Mods.length / itemPerPage)
    updateModList();
}

function NextPage() {
    if (currentPage < pageCount) {
        currentPage++
        updateModList()
    }
}

function PrevPage() {
    if (currentPage > 1) {
        currentPage--
        updateModList()
    }
}

function updateModList() {
    document.getElementById('pageNumber').innerHTML = `${currentPage} / ${pageCount}`;

    let displayList = []

    for (i = (currentPage - 1) * itemPerPage; i < currentPage * itemPerPage; i++) {
        if (Mods[i]) {
            displayList.push(Mods[i])
        }
    }
    document.getElementById('mods').innerHTML = ""
    displayList.forEach(obj => {
        let mod = obj.name
        let folder = obj.locat
        let name = document.createElement('div');
        name.classList.add('carName');
        name.classList.add('button');
        name.innerHTML = mod;
        name.setAttribute("onclick", `modSelect(${JSON.stringify(mod)}, ${JSON.stringify(folder)})`)
        document.getElementById('mods').appendChild(name);
    })
}

function modSelect(modName, folder) {
    let zipLoc = path.join(folder, `${modName}.zip`)
    if (!UnZipedMods.includes(modName)) {
        var zip = new AdmZip(zipLoc);
        zip.extractAllTo(path.join(ModderDir, "unzipedMods", modName), true);
        UnZipedMods.push(modName)
    }

    let div = document.getElementById('modName');
    div.innerHTML = modName;

    fs.readdir(path.join(ModderDir, "unzipedMods", modName, "vehicles"), "utf8", (err, folders) => {
        if (err) console.error(err);
        let trimName = folders[0]

        let img = document.getElementById('previewImage');
        img.innerHTML = '';
        img = document.createElement('img');
        img.classList.add('previewImage');
        img.src = path.join(ModderDir, "unzipedMods", modName, "vehicles", trimName, "default.png")
        document.getElementById('previewImage').appendChild(img);

        fs.readFile(path.join(ModderDir, "unzipedMods", modName, "vehicles", trimName, "camso_engine.jbeam"), "utf8", (err, data) => {
            if (err) console.error(err);

            let engineFile = data.replace(/[//].*./g, "")
            //console.log(engineFile)
            try {
                console.log(JSON.parse(engineFile))
            }
            catch(err) {
                engineFile = engineFile.replace(/\t|\n|\r| /g, '').replace(/,]/g, ']').replace(/,}/g, '}').replace(/\]\[/g, '],[').replace(/\}\{/g, '},{').replace(/}"/g,'},"').replace(/\]"/g,'],"')
                ForEach(engineFile.match(/":.[\d.]+"/g), str => {
                    engineFile = engineFile.replace(str, str.slice(0, -1) + ',"')
                }, () => {
                    console.log(JSON.parse(engineFile))
                })
            }
        })
    })
}

function ForEach(arr, callback1, callback2) {
    for (i = 0; i < arr.length; i++) {
        callback1(arr[i], i, arr)
    }
    callback2()
}