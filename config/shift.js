function updateshift() {
    var masuk1 = 0;
    var pulang1 = 7 * 60 + 10;
    var masuk2 = pulang1;
    var pulang2 = 16 * 60;
    var masuk3 = pulang2;
    var pulang3 = 23 * 60 + 59;
    var date = new Date();
    var now = ((date.getHours() * 60) + date.getMinutes());
    if (masuk1 <= now && now < pulang1) {
        return 1
    } else if (masuk2 <= now && now < pulang2) {
        return 2
    } else if (masuk3 <= now && now <= pulang3) {
        return 3
    }
}

module.exports = { updateshift }