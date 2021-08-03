let express = require("express")
let app = express();
// let bodyParser = require("body-parser")
// let mysql = require("mysql")
let moment = require("moment")
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

let multer = require("multer")
let path = require("path")
let fs = require("fs");
let filePath = path.join(__dirname + "/uploads/test.json")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//set strorage
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
})

// Function for check file type
function checkFileType(file, callback) {
    const filetypes = /jpeg|jpg|png|gif|json/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
        return callback(null, true);
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

// Post data with picture
app.post("/test", (req, res) => {
    new Promise((resolve, reject) => {
        upload(req, res, (err) => {
            if (err) {
                reject(res.send({ err: err }))
            } else {
                resolve()
            }
        })
    }).then(() => {
        new Promise((resolve, reject) => {
            fs.readFile(filePath, { encoding: "utf8" }, (err, data) => {
                if (!err) {
                    data = JSON.parse(data)
                    resolve(data)
                } else {
                    reject(err)
                }
            })
        }).then(async (data) => {
            let albumName = data.album_name
            let price = data.price
            let releaseDate = data.release_date
            let description = data.description
            let coverImage = req.files[0].originalname
            let artistId = data.art_id
            let albumTypeId = data.at_id
            let albumDetails = data.album_details

            let date = new Date(releaseDate)
            date.setDate(date.getDate())
            releaseDate = moment(date).format()

            let maxAlbumId = await prisma.album.aggregate({
                _max: {
                    a_id: true
                }
            })

            let maxNumber = maxAlbumId._max.a_id.split("al")
            maxNumber = parseInt(maxNumber[1]) + 1
            maxAlbumId = "al" + maxNumber

            await prisma.album.create({
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
        })
    }).then(() => {
        return res.send({ status: "Done" })
    })
})

// Connect To MySQL
/* let dbConnect = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "album_shop_test"
})

dbConnect.connect(); */

app.listen(9000, () => {
    console.log("Running at port : 9000")
})

//Home page route
app.get("/", (req, res) => {
    return res.send({ error: false, message: "Welcome to rest api with Node JS", written_by: "Taninchot Phuwaloertthiwat" })
})


// Get all albums
app.get("/albums", async (req, res) => {
    // let allAlbums = await prisma.$queryRaw("SELECT * FROM ALBUM")
    let allAlbums = await prisma.album.findMany({
        include: {
            artist: true,
            albumType: true,
            album_details: true
        }
    })
    allAlbums.forEach(album => {
        album.release_date = moment(album.release_date).format("YYYY-MM-DD")
    });
    return res.send({ data: allAlbums })
})

app.delete("/album/:id", async (req, res) => {
    let id = req.params.id
    console.log(id)

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
    let albumName = req.body.album_name
    let price = req.body.price
    let releaseDate = req.body.release_date
    let description = req.body.description
    let coverImage = req.body.cover_image
    let artistId = req.body.art_id
    let albumTypeId = req.body.at_id
    let albumDetails = req.body.album_details

    let date = new Date(releaseDate)
    date.setDate(date.getDate())
    releaseDate = moment(date).format()

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
        });
    }).then(() => {
        return res.send({ message: "Update Successfully" })
    })
})

app.post("/album", async (req, res) => {
    let albumName = req.body.album_name
    let price = req.body.price
    let releaseDate = req.body.release_date
    let description = req.body.description
    let coverImage = req.body.cover_image
    let artistId = req.body.art_id
    let albumTypeId = req.body.at_id
    let albumDetails = req.body.album_details

    let date = new Date(releaseDate)
    date.setDate(date.getDate())
    releaseDate = moment(date).format()

    let maxAlbumId = await prisma.album.aggregate({
        _max: {
            a_id: true
        }
    })

    let maxNumber = maxAlbumId._max.a_id.split("al")
    maxNumber = parseInt(maxNumber[1]) + 1
    maxAlbumId = "al" + maxNumber

    const addAlbum = await prisma.album.create({
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
    return res.send({ addAlbum })
})

module.exports = app