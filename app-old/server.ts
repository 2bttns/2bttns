import { createServer } from 'http'
import next from 'next'
import { parse } from 'url'
import { initDb } from './db'
import dotenv from 'dotenv'
dotenv.config()

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = Number(process.env.PORT) || 3001
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

async function init() {
    try {
        await initDb()
        console.log('Successfully connected to the database.')
    } catch (err) {
        console.error('Failed to connect to the database:', err)
    }

    app.prepare().then(() => {
        createServer(async (req, res) => {
            try {
                if (req.url) {
                    const parsedUrl = parse(req.url, true)
                    await handle(req, res, parsedUrl)
                }
            } catch (err) {
                console.error('Error occurred handling', req.url, err)
                res.statusCode = 500
                res.end('internal server error')
            }
        }).listen(port, () => {
            console.log(
                `> Ready on http://${hostname}:${port} | NODE_ENV=${process.env.NODE_ENV}`
            )
        })
    })
}

init()
