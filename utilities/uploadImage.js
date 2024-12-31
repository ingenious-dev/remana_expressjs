var path = require('path');
var mkdirp = require('mkdirp');
var { createWriteStream } = require('fs');
var { Readable } = require('stream');

async function uploadImage (url, public_folder) {
    // + https://medium.com/deno-the-complete-reference/download-file-with-fetch-in-node-js-57dd370c973a
    // const url =
    //   "https://cdn.freebiesupply.com/logos/large/2x/nodejs-1-logo-png-transparent.png";
    var fileName = url.split("/").pop();
    // + https://codedamn.com/news/nodejs/how-to-get-current-directory-in-node-js
    // + https://www.w3schools.com/nodejs/met_path_join.asp
    // folder = path.join(process.cwd(), 'public', 'images');
    folder = path.join(process.cwd(), 'public', public_folder);
    mkdirp.sync(folder);
    fileName = path.join(folder, fileName);
    // const fileURL = `/images/${fileName}`;
    const fileURL = `/${public_folder}/${fileName}`;
    const resp = await fetch(url);
    if (resp.ok && resp.body) {
        // console.log("Writing to file:", fileName);
        // ! TO BE DONE - handle duplicated name e.g introduce random string
        // ! Don't rely on google filenaming convention being unique sort it our yourself
        let writer = createWriteStream(fileName);
        Readable.fromWeb(resp.body).pipe(writer);
    }
    return fileURL;
}

module.exports = { uploadImage }