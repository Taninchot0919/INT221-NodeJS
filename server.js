let express = require("express")
let app = express()
// let bodyParser = require("body-parser")
// let mysql = require("mysql")
let moment = require("moment")
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

let multer = require("multer")
let path = require("path")
let fs = require("fs")
let jsonPath = path.join(__dirname + "/uploads/test.json")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//set strorage
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, callback) => {
        callback(null, deleteWhiteSpace(file.originalname))
    }
})

let deleteWhiteSpace = (text) => {
    let str = text;
    let trimStr = str.split(' ').join('_');
    return trimStr
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

app.listen(9000, () => {
    console.log("Running at port : 9000")
})

// Post data with picture
app.post("/test", (req, res) => {
    new Promise(async (resolve, reject) => {
        upload(req, res, (err) => {
            if (err) {
                reject(res.send({ err: err }))
            } else {
                resolve()
            }
        })
    }).then(() => {
        new Promise((resolve, reject) => {
            fs.readFile(jsonPath, { encoding: "utf8" }, (err, data) => {
                if (!err) {
                    data = JSON.parse(data)
                    let json = data
                    resolve(json)
                } else {
                    reject(err)
                }
            })
        }).then((covertJsonValue) => {
            console.log(covertJsonValue)
            new Promise((resolve, reject) => {
                resolve(addAlbum(covertJsonValue))
            }).then(() => {
                let jsonPath = path.join(__dirname + "/uploads/test.json")
                fs.unlink(jsonPath, () => {
                    return res.send({ status: "Done" })
                })
            })
        })
    })
})

//Home page route
app.get("/", (req, res) => {
    return res.send({ error: false, message: "Welcome to rest api with Node JS", written_by: "Taninchot Phuwaloertthiwat" })
})


// Get picture
app.get("/pic/:pic", (req, res) => {
    let picFile = req.params.pic
    let filePath = path.join(__dirname + "/uploads/" + picFile)
    return res.sendFile(filePath)
})

// Get all albums
app.get("/albums", async (req, res) => {
    let allAlbums = await prisma.album.findMany({
        include: {
            artist: true,
            albumType: true,
            album_details: true
        }
    })
    allAlbums.forEach(album => {
        album.release_date = moment(album.release_date).format("YYYY-MM-DD")
    })
    return res.send({ data: allAlbums })
})

// Delete Album from id 
app.delete("/album/:id", async (req, res) => {
    let id = req.params.id
    console.log(id)

    let albumPicture = await prisma.album.findMany({
        where: {
            a_id: id
        }
    })

    /*     albumPicture = albumPicture[0].cover_image
    
        let filePath = path.join(__dirname + "/uploads/" + albumPicture)
    
        removePhoto(filePath) */

    await prisma.album_details.deleteMany({
        where: {
            a_id: id
        }
    }).then(async () => {
        await prisma.album.delete({
            where: {
                a_id: id
            }
        })
    }).then(() => {
        return res.send({ status: "Delete Complete" })
    })
})

app.put("/album/:id", (req, res) => {
    let id = req.params.id
    let { albumName, price, releaseDate, description, coverImage, artistId, albumTypeId, albumDetails } = req.body

    releaseDate = formatDate(releaseDate)

    prisma.album.update({
        where: {
            a_id: id
        },
        data: {
            album_name: albumName,
            price: price,
            release_date: releaseDate,
            description: description,
            cover_image: coverImage,
            art_id: artistId,
            at_id: albumTypeId,
        }
    }).then(async () => {
        await prisma.album_details.deleteMany({
            where: {
                a_id: id
            }
        })
    }).then(() => {
        albumDetails.forEach(async (album) => {
            console.log(album.av_id)
            await prisma.album_details.createMany({
                data: {
                    av_id: album.av_id,
                    a_id: id
                }
            }).then((result) => {
                console.log(result)
            })
        })
    }).then(() => {
        return res.send({ message: "Update Successfully" })
    })
})

app.post("/album", async (req, res) => {
    let album = req.body

    addAlbum(album).then((value) => {
        return res.send(value)
    }).catch((err) => {
        err = "Error Something"
        return res.send({ status: err })
    })
})

// Format Date Function
function formatDate(oldDate) {
    let date = new Date(oldDate)
    date.setDate(date.getDate())
    return oldDate = moment(date).format()
}

async function addAlbum(albumData) {
    let { albumName, price, releaseDate, description, coverImage, artistId, albumTypeId, albumDetails } = albumData
    releaseDate = formatDate(releaseDate)

    let maxAlbumId = await prisma.$queryRaw("SELECT MAX(A_ID) AS id FROM ALBUM")
    if (maxAlbumId[0].id == null) {
        maxAlbumId = "al01"
    } else {
        let maxNumber = maxAlbumId[0].id.split("al")
        maxNumber = parseInt(maxNumber[1]) + 1
        if (maxNumber.toString().length < 2) {
            maxNumber = "0" + maxNumber
        }
        maxAlbumId = "al" + maxNumber
    }

    if (!albumName && !price && !releaseDate && !description && !artistId && !albumTypeId && !albumDetails) {
        throw new Error("Invalid Data")
    }

    coverImage = deleteWhiteSpace(coverImage)

    let result = await prisma.album.create({
        data: {
            a_id: maxAlbumId,
            album_name: albumName,
            price: price,
            release_date: releaseDate,
            description: description,
            cover_image: coverImage,
            art_id: artistId,
            at_id: albumTypeId,
            album_details: { create: albumDetails }
        }
    })
    return result
}

function removePhoto(pathOfPhoto) {
    fs.unlink(pathOfPhoto, (err) => {
        console.log(err)
    })
}

app.delete("/deleteAll", async (req, res) => {
    await prisma.$queryRaw("DELETE FROM ALBUM_DETAILS").then(async () => {
        await prisma.$queryRaw("DELETE FROM ALBUM").then(() => {
            return res.send({ status: "Delete Complete" })
        })
    })
})



module.exports = app