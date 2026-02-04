function timeFrom(dateTime = null, format = 'yyyy-mm-dd') {
	// 如果为null,则格式化当前时间
	if (!dateTime) dateTime = Number(new Date());
	// 如果dateTime长度为10或者13，则为秒和毫秒的时间戳，wo如果这个时候format为null，则返回几年前，几月前，几天前
	if (dateTime.toString().length == 10 || dateTime.toString().length == 13) {
		var timestamp = dateTime.toString().length == 10 ? dateTime * 1000 : dateTime;
		if (!format) {
			var timer = (new Date()).getTime() - timestamp;
			timer = parseInt(timer / 1000);
			// 如果小于5分钟,则返回刚刚
			if (timer < 300) {
				return '刚刚';
			} else if (timer < 3600) {
				return parseInt(timer / 60) + '分钟前';
			} else if (timer < 86400) {
				return parseInt(timer / 3600) + '小时前';
			} else if (timer < 2592000) {
				return parseInt(timer / 86400) + '天前';
			} else {
				return formatTime(timestamp, 'yyyy-mm-dd');
			}
		} else {
			return formatTime(timestamp, format);
		}
	} else {
		return dateTime;
	}
}

function formatTime(timestamp, format) {
    const date = new Date(timestamp);
    const o = {
        'm+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'i+': date.getMinutes(),
        's+': date.getSeconds(),
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        }
    }
    return format;
}

export default timeFrom;