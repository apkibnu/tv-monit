const conLocal = require('../config/db').conLocalP
const conTicket = require('../config/db').conTicketP
const updateshift = require('../config/shift').updateshift

exports.dashboard = async (req, res) => {
    let part1, line1, stat1, id_lane1, probk1;
    let part2, line2, stat2, id_lane2, probtake;
    let [resk1id, f3] = await conLocal.execute("SELECT nama_line, tb_produksi.nama_part, status, id_lane FROM tb_produksi JOIN tb_line ON tb_line.NAMA_LINE = tb_produksi.LINE AND tb_line.NAMA_PART = tb_produksi.NAMA_PART where line = ? and tanggal = curdate() and shift = ? order by tb_produksi.id desc limit 1", [`LINE ${req.params.idline1}`, updateshift()])
    let [restakeid, f4] = await conLocal.execute("SELECT nama_line, tb_produksi.nama_part, status, id_lane FROM tb_produksi JOIN tb_line ON tb_line.NAMA_LINE = tb_produksi.LINE AND tb_line.NAMA_PART = tb_produksi.NAMA_PART where line = ? and tanggal = curdate() and shift = ? order by tb_produksi.id desc limit 1", [`LINE ${req.params.idline2}`, updateshift()])
    if (resk1id.length == 0) {
        let [reserrk1, f] = await conLocal.execute("select nama_line, nama_part, id_lane, STATUS FROM tb_line WHERE nama_line = ? LIMIT 1", [`LINE ${req.params.idline1}`])
        if (reserrk1.length == 0) {
            res.send('LINE NOT FOUND')
            return
        }
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
        let [reserrtake, f] = await conLocal.execute("select nama_line, nama_part, id_lane, STATUS FROM tb_line WHERE nama_line = ? LIMIT 1", [`LINE ${req.params.idline2}`])
        if(reserrtake.length == 0) {
            res.send('LINE NOT FOUND')
            return
        } 
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

    if (!hasil.resk1new[0].ava){
        id_lane1 = 'BELUM PREPARATION!'
        part1 = 'SEGERA LAKUKAN PREPARATION'
    }
    if (!hasil.restakenew[0].ava){
        id_lane2 = 'BELUM PREPARATION!'
        part2 = 'SEGERA LAKUKAN PREPARATION'
    }

    let perck1 = (hasil.resk1[0].total / hasil.resk1[0].target * 100 || 0)
        if (perck1 === Infinity) {
            perck1 = 100
        } else if (perck1 > 100) {
            perck1 = 100
        } 

    let perctake = (hasil.restake[0].total / hasil.restake[0].target * 100 || 0)
        if (perctake === Infinity) {
            perctake = 100
        } else if (perctake > 100) {
            perctake = 100
        } 

    data = {
        line1,
        part1,
        line2,
        part2,
        statuscs1: stat1,
        statuscs2: stat2,
        idline1: id_lane1,
        idline2: id_lane2,
        totalk1: hasil.resk1[0].total || 0,
        targetk1: hasil.resk1[0].target || 0,
        perck1: perck1.toFixed(),
        avak1: (hasil.resk1new[0].ava || 0).toFixed(2),
        quak1: (hasil.resk1new[0].qua || 0).toFixed(2),
        totaltake: hasil.restake[0].total || 0,
        targettake: hasil.restake[0].target || 0,
        perctake: perctake.toFixed(),
        statk1: hasil.resstat1[0].status,
        stattake: hasil.resstat2[0].status,
        avatake: (hasil.restakenew[0].ava || 0).toFixed(2),
        quatake: (hasil.restakenew[0].qua || 0).toFixed(2),
        probk1: probk1,
        probtake: probtake,
        shift: updateshift(),
        resdthour1: hasil.resdthour1,
        resdthour2: hasil.resdthour2
    }

    res.render('dashboard', data)

}

