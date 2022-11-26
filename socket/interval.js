const conLocal = require('../config/db').conLocalP
const conTicket = require('../config/db').conTicketP
const updateshift = require('../config/shift').updateshift

let interval;

exports.interval = (socket) => {
    socket.on('update-value', (l1, l2) => {
        interval = setInterval(async () => {
            let part1, line1, statk1, id_lane1, probk1;
            let part2, line2, stattake, id_lane2, probtake;
            let [resk1id, f3] = await conLocal.execute("SELECT nama_line, tb_produksi.nama_part, status, id_lane FROM tb_produksi JOIN tb_line ON tb_line.NAMA_LINE = tb_produksi.LINE AND tb_line.NAMA_PART = tb_produksi.NAMA_PART where line = ? and tanggal = curdate() and shift = ? order by tb_produksi.id desc limit 1", [l1, updateshift()])
            let [restakeid, f4] = await conLocal.execute("SELECT nama_line, tb_produksi.nama_part, status, id_lane FROM tb_produksi JOIN tb_line ON tb_line.NAMA_LINE = tb_produksi.LINE AND tb_line.NAMA_PART = tb_produksi.NAMA_PART where line = ? and tanggal = curdate() and shift = ? order by tb_produksi.id desc limit 1", [l2, updateshift()])
            if (resk1id.length == 0) {
                let [reserrk1, f] = await conLocal.execute("select nama_line, nama_part, id_lane, STATUS FROM tb_line WHERE nama_line = ? LIMIT 1", [l1])
                part1 = reserrk1[0].nama_part
                line1 = reserrk1[0].nama_line
                stat1 = reserrk1[0].STATUS
                id_lane1 = reserrk1[0].id_lane
            } else {
                part1 = resk1id[0].nama_part
                line1 = resk1id[0].nama_line
                stat1 = resk1id[0].status
                id_lane1 = resk1id[0].id_lane
            }
            if (restakeid.length == 0) {
                let [reserrtake, f] = await conLocal.execute("select nama_line, nama_part, id_lane, STATUS FROM tb_line WHERE nama_line = ? LIMIT 1", [l2])
                part2 = reserrtake[0].nama_part
                line2 = reserrtake[0].nama_line
                stat2 = reserrtake[0].STATUS
                id_lane2 = reserrtake[0].id_lane
            } else {
                part2 = restakeid[0].nama_part
                line2 = restakeid[0].nama_line
                stat2 = restakeid[0].status
                id_lane2 = restakeid[0].id_lane
            }
            const ressql = async () => {
                let [resk1, f3] = await conLocal.execute("select sum(target) as target, sum(total_produksi) as total from tb_produksi where nama_part = ? and line = ? and tanggal = curdate() and shift = ?", [part1, line1, updateshift()])
                let [restake, f4] = await conLocal.execute("select sum(target) as target, sum(total_produksi) as total from tb_produksi where nama_part = ? and line = ? and tanggal = curdate() and shift = ?", [part2, line2, updateshift()])
                let [resstat1, f5] = await conTicket.execute("select status from tb_line where nama_part = ? and nama_line = ?", [part1, line1])
                let [resstat2, f6] = await conTicket.execute("select status from tb_line where nama_part = ? and nama_line = ?", [part2, line2])
                let [resprobk1, f7] = await conTicket.execute("select problem from ticket where nama_part = ? and lane = ? and tanggal = curdate() ORDER BY ticketid desc", [part1, line1])
                let [resprobtake, f8] = await conTicket.execute("select problem from ticket where nama_part = ? and lane = ? and tanggal = curdate() ORDER BY ticketid desc", [part2, line2])
                let [resk1new, f9] = await conLocal.execute("select sum(ava) as ava , sum(qua) as qua from tb_produksi where nama_part = ? and line = ? and tanggal = curdate() and shift = ? ", [part1, line1, updateshift()])
                let [restakenew, f10] = await conLocal.execute("select sum(ava) as ava , sum(qua) as qua from tb_produksi where nama_part = ? and line = ? and tanggal = curdate() and shift = ? ", [part2, line2, updateshift()])
                let [resdthour1, f11] = await conLocal.execute("SELECT jam, (TIME_TO_SEC(dt_auto)+TIME_TO_SEC(DT_MATERIAL)+TIME_TO_SEC(DT_MESIN)+TIME_TO_SEC(DT_OTHERS)+TIME_TO_SEC(DT_PROSES)+TIME_TO_SEC(DT_TERPLANNING)) AS dt FROM tb_data_hourly WHERE nama_part = ? AND line = ? AND shift = ? and tanggal = curdate()", [part1, line1, updateshift()])
                let [resdthour2, f12] = await conLocal.execute("SELECT jam, (TIME_TO_SEC(dt_auto)+TIME_TO_SEC(DT_MATERIAL)+TIME_TO_SEC(DT_MESIN)+TIME_TO_SEC(DT_OTHERS)+TIME_TO_SEC(DT_PROSES)+TIME_TO_SEC(DT_TERPLANNING)) AS dt FROM tb_data_hourly WHERE nama_part = ? AND line = ? AND shift = ? and tanggal = curdate()", [part2, line2, updateshift()])
                return { resk1, restake, resstat1, resstat2, resprobk1, resprobtake, resk1new, restakenew, resdthour1, resdthour2 }
            }

            let hasil = await ressql()

            if (hasil.resprobk1.length == 0) { probk1 = '' } else { probk1 = hasil.resprobk1[0].problem }
            if (hasil.resprobtake.length == 0) { probtake = '' } else { probtake = hasil.resprobtake[0].problem }
            stattake = hasil.resstat2[0].status
            statk1 = hasil.resstat1[0].status
            let perck1 = (hasil.resk1[0].total / hasil.resk1[0].target * 100 || 0).toFixed(1)
            let perctake = (hasil.restake[0].total / hasil.restake[0].target * 100 || 0).toFixed(1)
            socket.emit('update-line', part1, id_lane1, part2, id_lane2)
            socket.emit('update-performance', hasil.resk1[0].total, hasil.resk1[0].target, perck1, hasil.restake[0].total, hasil.restake[0].target, perctake)
            socket.emit('update-status', statk1, stattake, probk1, probtake)
            socket.emit('update-available', hasil.resk1new[0].ava || 0, hasil.resk1new[0].qua || 0, hasil.restakenew[0].ava || 0, hasil.restakenew[0].qua || 0)
            for (let i = 0; i < hasil.resdthour1.length; i++) {
                socket.emit('update-dt-hourly1', hasil.resdthour1[i].jam, hasil.resdthour1[i].dt, updateshift())
            }
            for (let i = 0; i < hasil.resdthour2.length; i++) {
                socket.emit('update-dt-hourly2', hasil.resdthour2[i].jam, hasil.resdthour2[i].dt, updateshift())
            }
        }, 2000)
    })
}

exports.disconnect = (socket) => {
    socket.on('disconnect', () => {
        clearInterval(interval)
    })
}