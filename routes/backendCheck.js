const router = require("express").Router()

router.get("/health", (req, res) => {
    return res.send({ status: "Healthy" })
})

module.exports = router