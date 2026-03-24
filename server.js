"use strict"

const express = require("express")
const { Pool } = require("pg")
const WebSocket = require("ws")

const config = require("./config")

const app = express()
app.use(express.static("public"))

/* ---------- DATABASE ---------- */

const pool = new Pool(config.DATABASE)

pool.on("connect", () => {
    console.log("PostgreSQL connected")
})

pool.on("error", err => {
    console.error("PostgreSQL error:", err)
})

/* ---------- DEVICE META ---------- */

function getDeviceMeta(dev_id){
    return config.DEVICES.find(d => d.dev_id === dev_id) || {}
}

/* ---------- GET LATEST DATA ---------- */

async function getLatest(){

    const res = await pool.query(`
        SELECT DISTINCT ON (dev_id)
            app_id,
            dev_id,
            temperature1,
            temperature2,
            time
        FROM sensors.th_sensors
        ORDER BY dev_id, time DESC
    `)

    return res.rows.map(r=>{

        let t1 = parseFloat(r.temperature1)
        let t2 = parseFloat(r.temperature2)

        const meta = getDeviceMeta(r.dev_id)

        // INVALID kezelése
        if(t1 === config.INVALID_TEMP) t1 = null
        if(t2 === config.INVALID_TEMP) t2 = null

        // OFFSET alkalmazása
        if(t1 != null) t1 += (meta.t1_offset || 0)
        if(t2 != null) t2 += (meta.t2_offset || 0)

        return {
            app_id: r.app_id,
            dev_id: r.dev_id,
            t1,
            t2,
            t1_name: meta.t1_name || "T1",
            t2_name: meta.t2_name || "T2",
            time: r.time
        }

    })

}

/* ---------- GROUP LOGIC (ADVANCED) ---------- */

function groupSensors(data){

    const result = {}

    for(const g of config.GROUPS){

        const values = []
        const sensors = []

        for(const m of g.members){

            const found = data.find(s =>
                s.app_id === m.app_id && s.dev_id === m.dev_id
            )

            if(!found) continue

            let value = null
            let name = ""

            if(m.type === "t1"){
                value = found.t1
                name = found.t1_name
            }

            if(m.type === "t2"){
                value = found.t2
                name = found.t2_name
            }

            sensors.push({
                dev_id: found.dev_id,
                type: m.type,
                name,
                value,
                time: found.time
            })

            if(value != null){
                values.push(value)
            }

        }

        let diff = null
        let alarm = false

        if(values.length >= 2){

            const max = Math.max(...values)
            const min = Math.min(...values)

            diff = max - min

            if(diff > g.max_diff){
                alarm = true
            }

        }

        result[g.name] = {
            sensors,
            diff,
            alarm,
            limit: g.max_diff
        }

    }

    return result
}

/* ---------- API ---------- */

app.get("/api/latest", async (req,res)=>{

    try{

        const data = await getLatest()
        const grouped = groupSensors(data)

        res.json(grouped)

    }catch(e){

        console.error("API error:", e)
        res.status(500).send("database error")

    }

})

/* ---------- HEALTH CHECK ---------- */

app.get("/api/health", async (req,res)=>{

    try{

        await pool.query("SELECT 1")

        res.json({
            status:"ok",
            database:"connected"
        })

    }catch(e){

        res.status(500).json({
            status:"error",
            database:"failed"
        })

    }

})

/* ---------- SERVER ---------- */

const server = app.listen(config.PORT, () => {
    console.log("Industrial LoRa Monitor running on port", config.PORT)
})

/* ---------- WEBSOCKET ---------- */

const wss = new WebSocket.Server({ server })

/* ---------- BROADCAST LOOP ---------- */

async function broadcast(){

    try{

        const data = await getLatest()
        const grouped = groupSensors(data)

        const json = JSON.stringify(grouped)

        wss.clients.forEach(c=>{
            if(c.readyState === WebSocket.OPEN){
                c.send(json)
            }
        })

    }catch(e){

        console.error("Broadcast error:", e)

    }

}

setInterval(broadcast, 5000)