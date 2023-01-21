import express from "express";
import multer from "multer";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';

import { getImages, getImage, addImage } from "./database.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const upload = multer({ dest: "images/" });

app.get("/images/:imageName", (req, res) => {
    const imageName = req.params.imageName;
    const readStream = fs.createReadStream(`images/${imageName}`);
    readStream.pipe(res);
});


app.get("/api/images", async (req, res) => {
    const images = await getImages();
    return res.json(images);
});


app.post("/api/images", upload.single("image"), async (req, res) => {
    try {
        const errorDefaultMessage = "Issue recording image file :/. Try again later, please.";
        const description = req.body.description;

        // this is to simulate an error handling on purpose
        if (description === "***")
            throw(errorDefaultMessage);

        const recordingImage = await addImage(req.file.filename, description);

        if (!recordingImage || !recordingImage.id)
            throw (errorDefaultMessage);

        return res.send({ 
            id: recordingImage.id,
            file_name: recordingImage.file_name,
            description: recordingImage.description,
            created: recordingImage.created,
            message: "Image added!   \\o/" 
        });

    } catch(err) {
        console.log("###Error - adding image: ", err.message || err);
        return res.send({ error: err.message || err});
    }
});


// https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("*", (req, res) => res.sendFile(__dirname + "/public/index.html"));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running at ${port} port`));

