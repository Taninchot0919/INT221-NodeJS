const router = require("express").Router()
let path = require("path")
let fs = require("fs")
let jsonPath = path.join(__dirname, "..", "/uploads/test.json")
let multer = require("multer")
let { addAlbum } = require('../helpers/albumHelpers')

//set strorage
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, callback) => {
        callback(null, changeFileOfName(file.originalname))
    }
})

var nameOfFile = ""

let setNameOfFile = (name) => {
    nameOfFile = name
}

let getNameOfFile = () => {
    return nameOfFile
}

let changeFileOfName = (text) => {
    if (text == "test.json") {
        return text
    } else {
        var fileExt = text.split('.').pop();
        let date = Date.now()
        let fileName = date + "." + fileExt
        setNameOfFile(fileName)
        return fileName
    }
}

// Function for check file type
function checkFileType(file, callback) {
    const filetypes = /jpeg|jpg|png|gif|json/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
        return callback(null, true)
    } else {
        callback('error: image only')
    }
}

//init upload
const upload = multer({
    storage: storage,
    limits: { fieldSize: 100000 },
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback)
    }
}).any()

// Post album without Picture
router.post("/", async (req, res) => {
    let album = req.body
    

    addAlbum(album).then((value) => {
        return res.send(value)
    }).catch((err) => {
        err = "Error Something"
        return res.send({ status: err })
    })
})

// Post album with picture
router.post("/withpic", (req, res) => {
    new Promise(async (resolve, reject) => {
        upload(req, res, (err) => {
            if (err) {
                reject(res.send({ err: err }))
            }
            else {
                console.log(req.files)
                resolve()
            }
        })
    }).then(() => {
        new Promise((resolve, reject) => {
            console.log("Test")
            console.log(getNameOfFile())
            fs.readFile(jsonPath, { encoding: "utf8" }, (err, data) => {
                if (!err) {
                    data = JSON.parse(data)
                    let json = data
                    json.coverImage = getNameOfFile()
                    resolve(json)
                } else {
                    console.log("test2")
                    reject(err)
                }
            })
        }).then((covertJsonValue) => {
            new Promise((resolve, reject) => {
                resolve(addAlbum(covertJsonValue))
            }).then(() => {
                // let jsonPath = path.join(__dirname + "/uploads/test.json")
                fs.unlink(jsonPath, () => {
                    return res.send({ status: "Done" })
                })
            })
        })
    })
})

module.exports = router