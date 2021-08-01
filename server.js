let express = require("express")
let app = express();
let bodyParser = require("body-parser")
let mysql = require("mysql")
let moment = require("moment")
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Connect To MySQL
let dbConnect = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "album_shop_test"
})

dbConnect.connect();

app.listen(9000, () => {
    console.log("Running at port : 9000")
})

//Home page route
app.get("/", (req, res) => {
    return res.send({ error: false, message: "Welcome to rest api with Node JS", written_by: "Taninchot Phuwaloertthiwat" })
})

// Get all albums
app.get("/albums", async (req, res) => {
    const allAlbums = await prisma.album.findMany({
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

    let maxNumber = maxAlbumId._max.a_id.split("al")
    maxNumber = parseInt(maxNumber[1]) + 1
    maxAlbumId = "al" + maxNumber

    let maxAlbumId = await prisma.album.aggregate({
        _max: {
            a_id: true
        }
    })

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

// // เอาไว้ Query
// function asyncQuery(sqlQuery) {
//     return new Promise((resolve, reject) => {
//         dbConnect.query(sqlQuery, function (err, result) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(result);
//             }
//         })
//     })
// }

// async function getMaxId() {
//     let querySQL = "SELECT MAX(a_id) as maxId from album";
//     let maxId = await asyncQuery(querySQL);
//     let maxNumber = await maxId[0].maxId.split("al")
//     maxNumber = parseInt(maxNumber[1]) + 1
//     let albumId = "al" + maxNumber
//     return albumId;
// }


// app.post("/add", async (req, res) => {
//     let albumId = await getMaxId();
//     console.log(albumId)
//     let albumName = req.body.album_name;
//     let price = req.body.price;
//     let releaseDate = req.body.release_date;
//     let description = req.body.description;
//     let coverImage = req.body.cover_image;
//     let artistId = req.body.art_id;
//     let albumTypeId = req.body.at_id;

//     releaseDate = moment(releaseDate).format("YYYY-MM-DD")

//     if (!albumName && !price && !releaseDate && !description && !artistId && !albumTypeId) {
//         return res.status(400).send({ error: true, message: "Please fill all form" })
//     }

//     dbConnect.query('INSERT INTO album VALUES (?,?,?,?,?,?,?,?)', [albumId, albumName, price, releaseDate, description, coverImage, artistId, albumTypeId],
//         (error, results, field) => {
//             if (error) {
//                 throw error
//             }
//             return res.send({ error: false, data: results, message: "Successfully Added!!!" })
//         })
// })
module.exports = app