/**
 * 根据 selector 选择器查找满足条件的元素，默认查找的是满足条件的第一个元素
 * @param {string} selector 选择器
 * @param {boolean} all 可选参数，传递 true 表示查找所有满足条件的元素
 * @returns 
 */
function $(selector, all) {
    return all ? document.querySelectorAll(selector) : document.querySelector(selector)
}

//生成随机数
function random(top, bottom) {
    return Math.floor(Math.random() * (bottom - top)) + top;
}

//setout 实现setintervel
function settime(fn, s) {
    setTimeout(() => {
        fn();
        settime(fn, s);
    }, s)
}

//随机颜色生成
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * 用于进行 cookie 查询或保存
 * 函数传递一个参数时，表示根据cookie名查询cookie值，
 * 传两个及以上的参数时表示保存 cookie 的键值对.
 * 
 * @param key cookie名称
 * @param value cookie值
 * @param options 配置对象: {expires, path, domain, secure}, expires 表示几天后失效
 */
function cookie(key, value, options) {
    // 判断是否有传递第二个参数 value
    // 如果 未传递，则根据第一个参数的 cookie 名查询对应 cookie 值
    if (typeof value === 'undefined') {
        // 获取所有 cookie，使用 `; ` 将字符串分割为每条cookie的key=value键值对
        const allCookies = document.cookie.split('; ')
        // 将所有 cookie 的键值对转换为对象中的属性
        const result = {}
        allCookies.forEach(function (cookie) {
            // 将key=value的键值对使用`=`分割，分割后的
            // 数组中第一个元素为cookie名称, 剩余元素使用
            // `=` 号拼接后是对应的 cookie 值
            const parts = cookie.split('=')
            const name = parts.shift()
            const value = parts.join('=')
            result[name] = value
        })
        // 将对象中需要查找cookie的名称对应的属性值返回
        return result[key] ? JSON.parse(decodeURIComponent(result[key])) : null
    }

    /* 有传递第二个及以后的参数，表示保存 cookie */

    // 使用短路运算 ||, 判断如果 options 参数未传递(为 undefined) 则为 options 取默认的空对象直接量
    options = options || {}

    let cookie = `${key}=${encodeURIComponent(JSON.stringify(value))}`
    // 判断选项中各配置项
    if (options.expires) { // 有显式设置失效时间
        const date = new Date()
        date.setDate(date.getDate() + options.expires)
        cookie += '; expires=' + date.toUTCString()
    }
    if (options.path) { // 保存路径
        cookie += '; path=' + options.path
    } else {
        cookie += '; path=/'
    }
    if (options.domain) { // 域
        cookie += '; domain=' + options.domain
    }
    if (options.secure) { // 是否全安
        cookie += '; secure'
    }
    // 保存 cookie
    document.cookie = cookie
}

/**
 * 根据 cookie 名称删除保存的 cookie 键值对
 * @param {*} key 
 * @param {*} options 可选
 */
function removeCookie(key, options) {
    // 为未传递的 options 设置默认空对象值
    options = options || {}
    // 将保存的 cookie 过期时间天数设置为 -1(表示昨天已过期)
    // 已过期的 cookie 会自动删除掉
    options.expires = -1
    // 重新保存cookie
    cookie(key, '', options)
}

//获取可视窗口高度

const getClientHeight = () => {
    let clientHeight = 0;
    if (document.body.clientHeight && document.documentElement.clientHeight) {
        clientHeight =
            document.body.clientHeight < document.documentElement.clientHeight
                ? document.body.clientHeight
                : document.documentElement.clientHeight;
    } else {
        clientHeight =
            document.body.clientHeight > document.documentElement.clientHeight
                ? document.body.clientHeight
                : document.documentElement.clientHeight;
    }
    return clientHeight;
};

//获取可视窗口宽度
const getPageViewWidth = () => {
    return (
        document.compatMode == "BackCompat"
            ? document.body
            : document.documentElement
    ).clientWidth;
};

//储存localStorage
const loalStorageSet = (key, value) => {
    if (!key) return;
    if (typeof value !== "string") {
        value = JSON.stringify(value);
    }
    window.localStorage.setItem(key, value);
};

//获取localStorage
const loalStorageGet = (key) => {
    if (!key) return;
    return window.localStorage.getItem(key);
};

//删除localStorage
const loalStorageRemove = (key) => {
    if (!key) return;
    window.localStorage.removeItem(key);
};
//会话储存
const sessionStorageSet = (key, value) => {
    if (!key) return;
    if (typeof value !== "string") {
        value = JSON.stringify(value);
    }
    window.sessionStorage.setItem(key, value);
};
//会话获取
const sessionStorageGet = (key) => {
    if (!key) return;
    return window.sessionStorage.getItem(key);
};
//会话删除
const sessionStorageRemove = (key) => {
    if (!key) return;
    window.sessionStorage.removeItem(key);
};

/**
 * 获取元素的css属性值
 * @param {*} element 
 * @param {*} attr 
 */
function cssStyle(element, attr) {
    return window.getComputedStyle(element)[attr];
}

/**
 * 多属性运动函数
 * @param element 待添加运动运动效果的元素
 * @param options 多运动属性及其运动终值设置，是一个对象，如: {left: 500, top: 300}
 * @param duration 限定运动时长
 * @param fn 可选参数, 运动结束后需要继续执行的任务
 */
function animate(element, options, duration = 400, fn) {
    // 先清空元素上已有运动动画效果
    clearInterval(element.timer)
    // 保存各运动属性初始值、单位时间1ms运动距离值
    const start = {}, speed = {}
    // 遍历迭代 options 对象中的各属性，分别求出其初始值与速度
    for (const key in options) {
        start[key] = parseFloat(css(element, key))
        speed[key] = (options[key] - start[key]) / duration
    }
    // 记录开始运动时间
    const startTime = Date.now()
    // 启动定时器，实现运动
    element.timer = setInterval(() => {
        // 已运动经过的时长
        let elapsed = Date.now() - startTime
        // 判断是否运动到达限定时间
        if (elapsed >= duration) {
            elapsed = duration
            clearInterval(element.timer)
            // 运动结束后，如果有需要继续执行的任务，则调用函数执行

        }
        // 为每个属性设置样式属性值
        for (const key in options) {
            element.style[key] = (start[key] + elapsed * speed[key]) + (key === 'opacity' ? '' : 'px')
        }
        if (elapsed >= duration) {
            fn && fn()
        }
    }, 1000 / 60)
}

/**
 * 
 * @param {*} ele 
 * @param {*} duration 运动时长
 * @param {*} fn 后续执行函数
 */
/**
 * 淡入
 * @param {*} element 待添加淡入动画效果的元素
 * @param {*} duration 运动动画时长
 * @param {*} fn 运动结束后要执行的函数
 */
function fadeIn(element, duration, fn) {
    // 在淡入动画执行前，先初始化元素不透明度与显示出元素占位
    element.style.opacity = 0
    element.style.display = 'block'
    // 调用 animate() 运动函数，实现功能
    animate(element, { opacity: 1 }, duration, fn)
}

/**
 * 淡出
 * @param {*} element 待添加淡出动画效果的元素
 * @param {*} duration 运动动画时长
 * @param {*} fn 运动结束后要执行的函数
 */
function fadeOut(element, duration, fn) {
    // 调用 animate() 函数，实现淡出动画
    animate(element, { opacity: 0 }, duration, () => {
        // 在淡出结束后，将元素隐藏
        element.style.display = 'none'
        // 如果还有要继续执行的函数，则调用执行
        fn && fn()
    })
}

/**
 * 获取或设置元素的css属性值
 * @param {*} element 
 * @param {*} attr 
 */
function css(element, attr) {
    // attr 参数是字符串时，根据该属性名字符串获取样式中对应属性值，
    // 如果参数是对象，则对 element 元素进行该对象中指定样式属性的设置
    if (typeof attr === 'string') {
        return window.getComputedStyle(element)[attr]
    } else if (typeof attr === 'object') {
        // 不需要拼接单位的属性集
        const excludes = ['fontWeight', 'opacity', 'zIndex']

        // 循环对象各属性，设置样式
        for (const key in attr) {
            // key 代表的是遍历到对象中各属性的名称
            // 使用 attr[key] 获取对应的属性值
            element.style[key] = attr[key] + (typeof attr[key] === 'number' && !excludes.includes(key) ? 'px' : '')
        }
    }
}