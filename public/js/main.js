const socket = io()
socket.emit('update-value', line1, line2)
let refresh = setTimeout(() => {
    location.reload()
}, 1800 * 1000);

let dtleft1 = document.getElementById(`1-0`)
let dtleft2 = document.getElementById(`1-8`)
let dtleft3 = document.getElementById(`1-17`)
let dtright1 = document.getElementById(`2-0`)
let dtright2 = document.getElementById(`2-8`)
let dtright3 = document.getElementById(`2-17`)

if (dtleft1 || dtleft2 || dtleft3) {
    for (let i = 0; i < resdthour1.length; i++) {
        if (resdthour1[i].dt > 0) {
            document.getElementById(`1-${resdthour1[i].jam}`).className = 'col-1 bg-danger text-center border border-light'
        } else {
            document.getElementById(`1-${resdthour1[i].jam}`).className = 'col-1 bg-success text-center border border-light'
        }
    }
}

if (dtright1 || dtright2 || dtright3) {
    for (let i = 0; i < resdthour2.length; i++) {
        if (resdthour2[i].dt > 0) {
            document.getElementById(`2-${resdthour2[i].jam}`).className = 'col-1 bg-danger text-center border border-light'
        } else {
            document.getElementById(`2-${resdthour2[i].jam}`).className = 'col-1 bg-success text-center border border-light'
        }
    }
}

socket.on('update-dt-hourly1', (jam, dt, shift) => {
    if (dtleft1 || dtleft2 || dtleft3) {
        if (dt > 0) {
            document.getElementById(`1-${jam}`).className = 'col-1 bg-danger text-center border border-light'
        } else {
            document.getElementById(`1-${jam}`).className = 'col-1 bg-success text-center border border-light'
        }
    }
})

socket.on('update-dt-hourly2', (jam, dt, shift) => {
    if (dtright1 || dtright2 || dtright3) {
        if (dt > 0) {
            document.getElementById(`2-${jam}`).className = 'col-1 bg-danger text-center border border-light'
        } else {
            document.getElementById(`2-${jam}`).className = 'col-1 bg-success text-center border border-light'
        }
    }
})

socket.on('update-performance', (totalk1, targetk1, perck1, totaltake, targettake, perctake) => {
    let percleft = document.getElementById('perck1')
    let totalleft = document.getElementById('totalk1')
    let targetleft = document.getElementById('targetk1')
    let percright = document.getElementById('perctake')
    let totalright = document.getElementById('totaltake')
    let targetright = document.getElementById('targettake')
    if (percleft && totalleft && targetleft) {
        if (perck1 < 95) {
            document.getElementById('perck1').className = "font-jumlah font-blinking"
        } else {
            document.getElementById('perck1').className = "font-jumlah"
        }
        document.getElementById('perck1').innerHTML = perck1 || 0
        document.getElementById('totalk1').innerHTML = totalk1 || 0
        document.getElementById('targetk1').innerHTML = targetk1 || 0
    }

    if (percright && totalright && targetright) {
        if (perctake < 95) {
            document.getElementById('perctake').className = "font-jumlah font-blinking"
        } else {
            document.getElementById('perctake').className = "font-jumlah"
        }

        document.getElementById('perctake').innerHTML = perctake || 0
        document.getElementById('totaltake').innerHTML = totaltake || 0
        document.getElementById('targettake').innerHTML = targettake || 0
    }
})
socket.on('update-status', (statusk1, statustake, problemk1, problemtake) => {
    let statusleft = document.getElementById('statusk1')
    let problemleft = document.getElementById('problemk1')
    let problemdescleft = document.getElementById('problemdesck1')
    let statusright = document.getElementById('statustake')
    let problemright = document.getElementById('problemtake')
    let problemdescright = document.getElementById('problemdesctake')
    if (statusleft && problemdescleft && problemleft) {
        if (statusk1 == 'normal') {
            document.getElementById('statusk1').className = 'col-6 bg-success border'
            document.getElementById('problemk1').className = 'col-4 bg-normal d-flex align-items-center justify-content-center text-light'
            document.getElementById('problemdesck1').innerHTML = 'RUNNING'
        }
        else if (statusk1 == 'dt') {
            document.getElementById('statusk1').className = 'col-6 bg-danger border'
            document.getElementById('problemk1').className = 'col-4 bg-danger d-flex align-items-center justify-content-center text-light'
            document.getElementById('problemdesck1').innerHTML = problemk1.toUpperCase()
        } else if (statusk1 == 'layoff') {
            document.getElementById('statusk1').className = 'col-6 bg-secondary border'
            document.getElementById('problemk1').className = 'col-4 bg-secondary d-flex align-items-center justify-content-center text-light'
            document.getElementById('problemdesck1').innerHTML = 'LAYOFF PRODUKSI'
        } else {
            document.getElementById('statusk1').className = 'col-6 bg-warning border'
            document.getElementById('problemk1').className = 'col-4 bg-danger d-flex align-items-center justify-content-center text-light'
            document.getElementById('problemdesck1').innerHTML = problemk1.toUpperCase()
        }
    }

    if (statusright && problemdescright && problemright) {
        if (statustake == 'normal') {
            document.getElementById('statustake').className = 'col-6 bg-success border'
            document.getElementById('problemtake').className = 'col-4 bg-normal d-flex align-items-center justify-content-center text-light'
            document.getElementById('problemdesctake').innerHTML = 'RUNNING'
        }
        else if (statustake == 'dt') {
            document.getElementById('statustake').className = 'col-6 bg-danger border'
            document.getElementById('problemtake').className = 'col-4 bg-danger d-flex align-items-center justify-content-center text-light'
            document.getElementById('problemdesctake').innerHTML = problemtake.toUpperCase()
        } else if (statustake == 'layoff') {
            document.getElementById('statustake').className = 'col-6 bg-secondary border'
            document.getElementById('problemtake').className = 'col-4 bg-secondary d-flex align-items-center justify-content-center text-light'
            document.getElementById('problemdesctake').innerHTML = 'LAYOFF PRODUKSI'
        } else {
            document.getElementById('statustake').className = 'col-6 bg-warning border'
            document.getElementById('problemtake').className = 'col-4 bg-warning d-flex align-items-center justify-content-center text-light'
            document.getElementById('problemdesctake').innerHTML = problemtake.toUpperCase()
        }
    }
})

socket.on('update-available', (avak1, quak1, avatake, quatake) => {
    let avaleft = document.getElementById('avak1')
    let qualeft = document.getElementById('quak1')
    let avaright = document.getElementById('avatake')
    let quaright = document.getElementById('quatake')
    if (avaleft && qualeft) {
        document.getElementById('avak1').innerHTML = avak1 + "%" || 0 + "%"
        document.getElementById('avak1').style.width = avak1 + "%" || 0 + "%"
        document.getElementById('quak1').innerHTML = quak1 + "%" || 0 + "%"
        document.getElementById('quak1').style.width = quak1 + "%" || 0 + "%"
    } if (avaright && quaright) {
        document.getElementById('avatake').innerHTML = avatake + "%" || 0 + "%"
        document.getElementById('avatake').style.width = avatake + "%" || 0 + "%"
        document.getElementById('quatake').innerHTML = quatake + "%" || 0 + "%"
        document.getElementById('quatake').style.width = quatake + "%" || 0 + "%"
    }
})

socket.on('update-line', (part1, id1, part2, id2) => {
    document.getElementById('part1').innerHTML = part1
    document.getElementById('id1').innerHTML = id1
    document.getElementById('part2').innerHTML = part2
    document.getElementById('id2').getElementById = id2
})
