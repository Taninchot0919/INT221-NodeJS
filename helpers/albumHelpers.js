const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const { album } = new PrismaClient()
const { album_details } = new PrismaClient()

let formatDate = require('./dateFormat')

let addAlbum = async (albumData) => {
    let { albumName, price, releaseDate, description, coverImage, artistId, albumTypeId, albumDetails } = albumData
    releaseDate = formatDate(releaseDate)
    if (coverImage == "" || coverImage == undefined) {
        coverImage = "default.png"
    }

    let maxAlbumId = await prisma.$queryRaw("SELECT MAX(A_ID) AS id FROM album")
    if (maxAlbumId[0].id == null) {
        maxAlbumId = "al01"
        console.log(maxAlbumId)
    } else {
        let maxNumber = maxAlbumId[0].id.split("al")
        maxNumber = parseInt(maxNumber[1]) + 1
        if (maxNumber.toString().length < 2) {
            maxNumber = "0" + maxNumber
        }
        maxAlbumId = "al" + maxNumber
        console.log(maxAlbumId)
    }

    if (!albumName && !price && !releaseDate && !description && !artistId && !albumTypeId && !albumDetails) {
        throw new Error("Invalid Data")
    }

    let result = await album.create({
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

let updateAlbum = async (albumData, paramId) => {
    let id = paramId
    let { albumName, price, releaseDate, description, coverImage, artistId, albumTypeId, albumDetails } = albumData

    releaseDate = formatDate(releaseDate)

    await prisma.album.update({
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
        await album_details.deleteMany({
            where: {
                a_id: id
            }
        })
    }).then(() => {
        albumDetails.forEach(async (album) => {
            console.log(album.av_id)
            await album_details.createMany({
                data: {
                    av_id: album.av_id,
                    a_id: id
                }
            }).then((result) => {
                console.log(result)
                return result
            })
        })
    })
}

let removePhoto = (pathOfPhoto) => {
    fs.unlink(pathOfPhoto, (err) => {
        if (err) {
            console.log(err)
        }
    })
}


module.exports = { addAlbum, updateAlbum, removePhoto }