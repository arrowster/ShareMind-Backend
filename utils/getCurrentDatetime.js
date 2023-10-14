function getCurrentDateTime() {
    const now = new Date();

    // 년, 월, 일
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(now.getDate()).padStart(2, '0');

    // 시, 분, 초
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // SQL datetime 형식으로 포맷
    const sqlDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return sqlDateTime;
}

export default {
    getCurrentDateTime
}
