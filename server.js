const fs = require('fs');
const path = require("path");
const express = require('express');
const uuidv4 = require('uuid/v4'); //random ID
const app = express();
const port = 3000;

//folders or files names to ignore
const namesToIgnore = ["XXX"];

const walkSync = (dir, filelist = []) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (namesToIgnore.includes(file)) {
            continue;
        }
        const dirFile = path.join(dir, file);
        const dirent = fs.statSync(dirFile);

        if (dirent.isDirectory()) {
            filelist.push({
                id: uuidv4(),
                type: "folder",
                name : file,
                files: walkSync(dirFile, dir.files),
                path: dirFile,
                show: false,
                //demo
                show: file === "css"
            });
        } else {
            filelist.push({
                id: uuidv4(),
                type: 'file',
                name: file,
                path: dirFile,
                files: false,
                ext: file.split('.').pop(),
                checked: false,
                checked: ["editor.css", "buttons.css", "code-19.gif"].includes(file)
            });
        }
    }
    return filelist;
};

app.get('/', function (req, res) {
	res.sendFile(path.resolve(__dirname + '/index.html'))
});

app.get('/readFiles/:folder', (req, res) => {
    console.log(req.params.folder)
    const files = walkSync("./" + req.params.folder);
    res.send(JSON.stringify(files));
});

/* css, js, images */
app.get(/^(.+)$/, function(req, res){
	res.sendFile(path.resolve(__dirname + '/' + req.params[0]));
});

app.listen(port, () => {
    console.log(`Example app listening on localhost:${port}!`)
});