
const container=document.getElementById("groups")

function render(data){

container.innerHTML=""

Object.keys(data).forEach(group=>{

const g=data[group]

let html=`
<div class="group ${g.alarm ? "alarm":""}">
<div class="group-title">${group}</div>
<div class="group-info">
ΔT: ${g.diff != null ? Math.round(g.diff) : "-"} °C / limit ${g.limit} °C
</div>
<div class="grid">
`

g.sensors.forEach(s=>{

html+=`
<div class="card">
    <div class="dev">${s.dev_id}</div>

    <div class="sensor-name">
        ${s.name} (${s.type.toUpperCase()})
    </div>

    <div class="temp">
        ${s.value != null ? s.value + " °C" : "N/A"}
    </div>

    <div class="time">
        ${new Date(s.time).toLocaleString()}
    </div>
</div>
`

})
html+="</div></div>"

container.innerHTML+=html

})

}

function connect(){

const ws=new WebSocket("ws://"+location.host)

ws.onmessage=e=>{

const data=JSON.parse(e.data)
render(data)

}

ws.onclose=()=>{

setTimeout(connect,3000)

}

}

connect()
