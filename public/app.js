// PROFI IPARI DASHBOARD UI
// public/app.js

const ws = new WebSocket(`ws://${location.host}`)

const root = document.getElementById("app")

ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    render(data)
}

function render(groups){

    let html = ""

    Object.entries(groups).forEach(([name,g])=>{

        const alarmClass = g.alarm ? "group alarm" : "group"

        html += `
        <div class="${alarmClass}">

            <div class="group-header">
                <div class="group-title">${name}</div>
                <div class="group-diff">
                    ΔT: ${g.diff != null ? Math.round(g.diff) : "-"}°C / ${g.limit}°C
                </div>
            </div>

            <div class="cards">
        `

        g.sensors.forEach(s=>{

            const hasValue = s.value != null
            const tempClass = hasValue ? "temp ok" : "temp error"

            html += `
            <div class="card">
                <div class="dev">${s.dev_id}</div>

                <div class="sensor-name">
                    ${s.name} (${s.type.toUpperCase()})
                </div>

                <div class="${tempClass}">
                    ${hasValue ? Math.round(s.value) + "°C" : "❌"}
                </div>

                <div class="time">
                    ${new Date(s.time).toLocaleTimeString()}
                </div>
            </div>
            `
        })

        html += `
            </div>
        </div>
        `

    })

    root.innerHTML = html
}

// AUTO RECONNECT
ws.onclose = () => {
    console.log("WS disconnected, reconnecting...")
    setTimeout(()=>location.reload(),3000)
}
