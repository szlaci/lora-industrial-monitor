
module.exports = {

PORT:3001,

DATABASE:{
    host:"172.16.5.65",
    user:"postgres",
    password:"password",
    database:"database",
    port:5432
},

INVALID_TEMP:-327.6,

DEVICES:[

{
    dev_id:"A84041EEDF5F4810",
    t1_name:"4. fűtőelem",
    t2_name:"5. fűtőelem",

    t1_offset:0,
    t2_offset:0
},

{
    dev_id:"A84041B6225F4818",
    t1_name:"1. fűtőelem",
    t2_name:"2. fűtőelem",

    t1_offset:-30,
    t2_offset:-20
},

{
    dev_id:"A840413A615F482A",
    t1_name:"3. fűtőelem",
    t2_name:"-",

    t1_offset:-30,
    t2_offset:0
}

],

GROUPS:[

{
    name:"1. vasaló 1,2,3",
    members:[
    {app_id:"vasalo1", dev_id:"A84041B6225F4818", type:"t1"},
    {app_id:"vasalo1", dev_id:"A84041B6225F4818", type:"t2"},
    {app_id:"vasalo1", dev_id:"A840413A615F482A", type:"t1"}
    ],
    max_diff:10
},

{
    name:"1. vasaló 4,5",
    members:[
    {app_id:"vasalo1", dev_id:"A84041EEDF5F4810", type:"t1"},
    {app_id:"vasalo1", dev_id:"A84041EEDF5F4810", type:"t2"}
    ],
    max_diff:10
}


]

}
