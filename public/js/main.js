const socket = io()
socket.emit('update-value', part1, line1, part2, line2)
let refresh = setInterval(() => {
    location.reload()
}, 1800 * 1000);
for (let i = 0; i < resdthour1.length; i++) {
    if (resdthour1[i].dt > 0) {
        document.getElementById(`1-${resdthour1[i].jam}`).className = 'col-1 bg-danger text-center border border-light'
    } else {
        document.getElementById(`1-${resdthour1[i].jam}`).className = 'col-1 bg-success text-center border border-light'
    }
}
for (let i = 0; i < resdthour2.length; i++) {
    if (resdthour2[i].dt > 0) {
        document.getElementById(`2-${resdthour2[i].jam}`).className = 'col-1 bg-danger text-center border border-light'
    } else {
        document.getElementById(`2-${resdthour2[i].jam}`).className = 'col-1 bg-success text-center border border-light'
    }
}

socket.on('update-dt-hourly1', (jam, dt, shift) => {
    if (dt > 0) {
        document.getElementById(`1-${jam}`).className = 'col-1 bg-danger text-center border border-light'
    } else {
        document.getElementById(`1-${jam}`).className = 'col-1 bg-success text-center border border-light'
    }
})

socket.on('update-dt-hourly2', (jam, dt, shift) => {
    if (dt > 0) {
        document.getElementById(`2-${jam}`).className = 'col-1 bg-danger text-center border border-light'
    } else {
        document.getElementById(`2-${jam}`).className = 'col-1 bg-success text-center border border-light'
    }
})

socket.on('update-performance',(totalk1,targetk1,perck1,totaltake,targettake,perctake)=> {
    if (perck1 < 95) {
        document.getElementById('perck1').className = "font-jumlah font-blinking"
    } else {
        document.getElementById('perck1').className = "font-jumlah"
    }
    if (perctake < 95) {
        document.getElementById('perctake').className = "font-jumlah font-blinking"
    } else {
        document.getElementById('perctake').className = "font-jumlah"
    }
    
    document.getElementById('perck1').innerHTML = perck1 || 0
    document.getElementById('totalk1').innerHTML = totalk1 || 0
    document.getElementById('targetk1').innerHTML = targetk1 || 0
    document.getElementById('perctake').innerHTML = perctake || 0
    document.getElementById('totaltake').innerHTML = totaltake || 0
    document.getElementById('targettake').innerHTML = targettake || 0
})
socket.on('update-status',(statusk1,statustake,problemk1,problemtake)=> {
    if (statusk1 == 'normal') {
        document.getElementById('statusk1').className = 'col-6 bg-success border'
        document.getElementById('problemk1').className = 'col-4 bg-normal d-flex align-items-center justify-content-center text-light'
        document.getElementById('problemdesck1').innerHTML = 'RUNNING'
    }
    else if (statusk1 == 'dt') {
        document.getElementById('statusk1').className = 'col-6 bg-danger border'
        document.getElementById('problemk1').className = 'col-4 bg-danger d-flex align-items-center justify-content-center text-light'
        document.getElementById('problemdesck1').innerHTML = problemk1.toUpperCase()
    }
    else {
        document.getElementById('statusk1').className = 'col-6 bg-warning border'
        document.getElementById('problemk1').className = 'col-4 bg-danger d-flex align-items-center justify-content-center text-light'
        document.getElementById('problemdesck1').innerHTML = problemk1.toUpperCase()
    }

    if (statustake == 'normal') {
        document.getElementById('statustake').className = 'col-6 bg-success border'
        document.getElementById('problemtake').className = 'col-4 bg-normal d-flex align-items-center justify-content-center text-light'
        document.getElementById('problemdesctake').innerHTML = 'RUNNING'
    }
    else if (statustake == 'dt') {
        document.getElementById('statustake').className = 'col-6 bg-danger border'
        document.getElementById('problemtake').className = 'col-4 bg-danger d-flex align-items-center justify-content-center text-light'
        document.getElementById('problemdesctake').innerHTML = problemtake.toUpperCase()
    }
    else {
        document.getElementById('statustake').className = 'col-6 bg-warning border'
        document.getElementById('problemtake').className = 'col-4 bg-warning d-flex align-items-center justify-content-center text-light'
        document.getElementById('problemdesctake').innerHTML = problemtake.toUpperCase()
    }    
})

socket.on('update-available',(avak1,quak1,avatake,quatake)=> {
    document.getElementById('avak1').innerHTML = avak1.toFixed(2)*100+ "%" || 0 + "%"
    document.getElementById('avak1').style.width = avak1.toFixed(2)*100+ "%" || 0 + "%"
    document.getElementById('quak1').innerHTML = quak1.toFixed(2)*100+ "%" || 0 + "%"
    document.getElementById('quak1').style.width = quak1.toFixed(2)*100+ "%" || 0 + "%"
    document.getElementById('avatake').innerHTML = avatake.toFixed(2)*100+ "%" || 0 + "%"
    document.getElementById('avatake').style.width = avatake.toFixed(2)*100+ "%" || 0 + "%"
    document.getElementById('quatake').innerHTML = quatake.toFixed(2)*100+ "%" || 0 + "%"
    document.getElementById('quatake').style.width = quatake.toFixed(2)*100+ "%" || 0 + "%"
})
