const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")

const { album } = new PrismaClient()

router.psot