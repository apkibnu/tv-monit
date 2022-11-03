const express = require('express');
const app = express();
const port = 3390;
const http = require('http').Server(app)
// module ejs
app.set('view engine','ejs');
// access file static
app.use(express.static('public'));
const io = require("socket.io")(http)
// mysql
const mysql = require('mysql');
var conLocal;
var conTicket;
var shift;
function handleError() {
    conLocal = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "smartsys_Monitoring_mach"
    });

    // Connection error, 2 seconds retry
    conLocal.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleError , 2000);
        } else {
            console.log('Connected')
        }
    });

    conLocal.on('error', function (err) {
        console.log('db error', err);
        // If the connection is disconnected, automatically reconnect
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleError();
        } else {
            throw err;
        }
    });
    conTicket = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "smartsys_ticketing"
    });

    // Connection error, 2 seconds retry
    conTicket.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleError , 2000);
        } else {
            console.log('Connected')
        }
    });

    conTicket.on('error', function (err) {
        console.log('db error', err);
        // If the connection is disconnected, automatically reconnect
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleError();
        } else {
            throw err;
        }
    });
}
handleError();

function updateshift() {
    var masuk1 = 0;
    var pulang1 =  7 * 60 + 10;
    var masuk2 = pulang1;
    var pulang2 =  16 * 60;
    var masuk3 = pulang2;
    var pulang3 = 23 * 60 + 59;
    var date = new Date(); 
    var now = ((date.getHours() * 60) + date.getMinutes());
    if (masuk1 <= now && now < pulang1) { 
        shift = 1
    } else if (masuk2 <= now && now < pulang2) {
        shift = 2
    } else if (masuk3 <= now && now < pulang3) {
        shift = 3
    }
}

io.on('connection',(socket)=> {
    let interval
    socket.on('update-value',(part1, line1, part2, line2)=> {
        interval= setInterval(()=>{
            let probk1;
            let probtake;
            let statk1;
            let stattake;
            updateshift();
            conLocal.query("select sum(target) as target, sum(total_produksi) as total from tb_produksi where nama_part = ? and line = ? and tanggal = curdate() and shift = ?", [part1, line1, shift], (err, resk1) => {
                conLocal.query("select sum(target) as target, sum(total_produksi) as total from tb_produksi where nama_part = ? and line = ? and tanggal = curdate() and shift = ?", [part2, line2, shift], (err, restake) => {
                    conTicket.query("select status from tb_line where nama_part = ? and nama_line = ?", [part1, line1], (err, resstat1) => {
                        statk1 = resstat1[0].status
                        conTicket.query("select status from tb_line where nama_part = ? and nama_line = ?", [part2, line2], (err, resstat2) => {
                            stattake = resstat2[0].status
                            conTicket.query("select problem from ticket where nama_part = ? and lane = ? and tanggal = curdate() ORDER BY ticketid desc", [part1, line1], (err, resprobk1)=>{ 
                                if(resprobk1.length == 0) {
                                    probk1 = ''
                                } else {
                                    probk1 = resprobk1[0].problem
                                }
                                conTicket.query("select problem from ticket where nama_part = ? and lane = ? and tanggal = curdate() ORDER BY ticketid desc", [part2, line2], (err, resprobtake)=>{
                                    if(resprobtake.length == 0) {
                                        probtake = ''
                                    } else {
                                        probtake = resprobtake[0].problem
                                    }
                                    conLocal.query("select sum(ava) as ava , sum(qua) as qua from tb_produksi where nama_part = ? and line = ? and tanggal = curdate() and shift = ? ", [part1, line1, shift], (err, resk1new) => {
                                        conLocal.query("select sum(ava) as ava , sum(qua) as qua from tb_produksi where nama_part = ? and line = ? and tanggal = curdate() and shift = ? ", [part2, line2, shift], (err, restakenew) => {
                                            conLocal.query("SELECT jam, (TIME_TO_SEC(dt_auto)+TIME_TO_SEC(DT_MATERIAL)+TIME_TO_SEC(DT_MESIN)+TIME_TO_SEC(DT_OTHERS)+TIME_TO_SEC(DT_PROSES)+TIME_TO_SEC(DT_TERPLANNING)) AS dt FROM tb_data_hourly WHERE nama_part = ? AND line = ? AND shift = ?", [part1, line1, shift], (err, resdthour1) => {
                                                conLocal.query("SELECT jam, (TIME_TO_SEC(dt_auto)+TIME_TO_SEC(DT_MATERIAL)+TIME_TO_SEC(DT_MESIN)+TIME_TO_SEC(DT_OTHERS)+TIME_TO_SEC(DT_PROSES)+TIME_TO_SEC(DT_TERPLANNING)) AS dt FROM tb_data_hourly WHERE nama_part = ? AND line = ? AND shift = ?", [part2, line2, shift], (err, resdthour2) => {
                                                    let perck1 = (resk1[0].total/resk1[0].target*100 || 0).toFixed(1)
                                                    let perctake = (restake[0].total/restake[0].target*100 || 0).toFixed(1)
                                                    socket.emit('update-performance',resk1[0].total,resk1[0].target,perck1,restake[0].total,restake[0].target,perctake)
                                                    socket.emit('update-status', statk1, stattake, probk1, probtake)
                                                    socket.emit('update-available', resk1new[0].ava || 0, resk1new[0].qua || 0, restakenew[0].ava || 0, restakenew[0].qua || 0) 
                                                    for (let i = 0; i < resdthour1.length; i++) {
                                                        socket.emit('update-dt-hourly1', resdthour1[i].jam, resdthour1[i].dt, shift)
                                                    }
                                                    for (let i = 0; i < resdthour2.length; i++) {
                                                        socket.emit('update-dt-hourly2', resdthour2[i].jam, resdthour2[i].dt, shift)
                                                    }
                                                })
                                            })                    
                                        })
                                    })
                                })
                            })                
                        })
                    })
                })
            })
        },2000)
        socket.on('disconnect', () => {
            clearInterval(interval)
        })
    })
})

app.get('/:idpart1/:idpart2', (req, res) => {
    updateshift()
    let probk1;
    let probtake;
    let part1;
    let part2;
    let line1;
    let line2;
    conLocal.query("select nama_line, nama_part, id_lane, status from tb_line where id = ?", [req.params.idpart1], (err, respart1) => {
        conLocal.query("select nama_line, nama_part, id_lane, status from tb_line where id = ?", [req.params.idpart2], (err, respart2) => {
            part1 = respart1[0].nama_part
            line1 = respart1[0].nama_line
            part2 = respart2[0].nama_part
            line2 = respart2[0].nama_line
            conLocal.query("select sum(target) as target, sum(total_produksi) as total from tb_produksi where nama_part = ? and line = ? and tanggal = curdate() and shift = ?", [part1, line1, shift], (err, resk1) => {  
                conLocal.query("select sum(target) as target, sum(total_produksi) as total from tb_produksi where nama_part = ? and line = ? and tanggal = curdate() and shift = ?", [part2, line2, shift], (err, restake) => {
                    conTicket.query("select status from tb_line where nama_part = ? and nama_line = ?", [part1, line1], (err, resstat1) => {
                        conTicket.query("select status from tb_line where nama_part = ? and nama_line = ?", [part2, line2], (err, resstat2) => {
                            conTicket.query("select problem from ticket where nama_part = ? and lane = ? and tanggal = curdate() ORDER BY ticketid desc", [part1, line1], (err, resprobk1)=>{ 
                                if(resprobk1.length == 0) {
                                    probk1 = ''
                                } else {
                                    probk1 = resprobk1[0].problem
                                }
                                conTicket.query("select problem from ticket where nama_part = ? and lane = ? and tanggal = curdate() ORDER BY ticketid desc", [part2, line2], (err, resprobtake)=>{
                                    if(resprobtake.length == 0) {
                                        probtake = ''
                                    } else {
                                        probtake = resprobtake[0].problem
                                    }
                                    conLocal.query("select sum(ava) as ava , sum(qua) as qua from tb_produksi where nama_part = ? and line = ? and tanggal = curdate() and shift = ? ", [part1, line1, shift], (err, resk1new) => {
                                        conLocal.query("select sum(ava) as ava , sum(qua) as qua from tb_produksi where nama_part = ? and line = ? and tanggal = curdate() and shift = ? ", [part2, line2, shift], (err, restakenew) => {
                                            conLocal.query("SELECT jam, (TIME_TO_SEC(dt_auto)+TIME_TO_SEC(DT_MATERIAL)+TIME_TO_SEC(DT_MESIN)+TIME_TO_SEC(DT_OTHERS)+TIME_TO_SEC(DT_PROSES)+TIME_TO_SEC(DT_TERPLANNING)) AS dt FROM tb_data_hourly WHERE nama_part = ? AND line = ? AND shift = ?", [part1, line1, shift], (err, resdthour1) => {
                                                conLocal.query("SELECT jam, (TIME_TO_SEC(dt_auto)+TIME_TO_SEC(DT_MATERIAL)+TIME_TO_SEC(DT_MESIN)+TIME_TO_SEC(DT_OTHERS)+TIME_TO_SEC(DT_PROSES)+TIME_TO_SEC(DT_TERPLANNING)) AS dt FROM tb_data_hourly WHERE nama_part = ? AND line = ? AND shift = ?", [part2, line2, shift], (err, resdthour2) => {
                                                    data = {
                                                        line1,
                                                        part1,
                                                        line2,
                                                        part2,
                                                        statuscs1: respart1[0].status,
                                                        statuscs2: respart2[0].status,
                                                        idline1: respart1[0].id_lane,
                                                        idline2: respart2[0].id_lane,
                                                        totalk1: resk1[0].total || 0,
                                                        targetk1: resk1[0].target || 0,
                                                        perck1: (resk1[0].total/resk1[0].target*100 || 0).toFixed(1),
                                                        avak1: (resk1new[0].ava || 0).toFixed(2),
                                                        quak1: (resk1new[0].qua || 0).toFixed(2),
                                                        totaltake: restake[0].total || 0,
                                                        targettake: restake[0].target || 0,
                                                        perctake: (restake[0].total/restake[0].target*100 || 0).toFixed(1), 
                                                        statk1: resstat1[0].status,
                                                        stattake: resstat2[0].status,                                    
                                                        avatake: (restakenew[0].ava || 0).toFixed(2),
                                                        quatake: (restakenew[0].qua || 0).toFixed(2),
                                                        probk1: probk1,
                                                        probtake: probtake,
                                                        shift: shift,
                                                        resdthour1,
                                                        resdthour2
                                                    }
                                                    res.render('dashboard', data)
                                                })
                                            })                              
                                        })
                                    })
                                })
                            })                
                        })
                    })
                })
            })
        })
    })
})

http.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    console.log(new Date());
});