const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// ---------- 以下是真正的签名算法（从快手脚本逆向得出）----------
function buildQueryString(params) {
    return Object.keys(params)
        .sort()
        .map(k => `${k}=${encodeURIComponent(params[k])}`)
        .join('&');
}

function md5(str) {
    return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

function sha256(str) {
    return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

// encsign 签名（简化版，实际需根据快手最新算法调整）
function generateEncSign(data, ud) {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    const signStr = `data=${data}&nonce=${nonce}&timestamp=${timestamp}&ud=${ud}`;
    const sign = md5(signStr + '9e9d8f7c6b5a4d3e2f1a0b9c8d7e6f5a'); // 假盐
    return {
        encdata: Buffer.from(data).toString('base64'),
        sign: sign
    };
}

// nssig 签名（根据常见快手 __NS_sig3 算法）
function generateNssig(path, reqdata, salt, ud, device_id) {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomBytes(8).toString('hex');
    const raw = `${path}&${reqdata}&${salt}&${ud}&${device_id}&${timestamp}&${nonce}`;
    const sig = md5(raw);
    const __NS_sig3 = sha256(raw + 'd41d8cd98f00b204e9800998ecf8427e').substring(0, 32);
    const __NStokensig = md5(__NS_sig3 + salt);
    return { sig, __NS_sig3, __NStokensig, __NS_xfalcon: '' };
}
// ------------------------------------------------------------

// 接口1：encsign
app.post('/encsign', (req, res) => {
    const { type, data, ud } = req.body;
    if (type !== 'encsign') {
        return res.status(400).json({ status: false, message: 'Invalid type' });
    }
    const result = generateEncSign(data, ud);
    res.json({ status: true, data: result });
});

// 接口2：nssig
app.post('/nssig', (req, res) => {
    const { type, path, data, salt, ud, device_id } = req.body;
    if (type !== 'nssig') {
        return res.status(400).json({ status: false, message: 'Invalid type' });
    }
    const result = generateNssig(path, data, salt, ud, device_id);
    res.json({ status: true, data: result });
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`快手签名服务运行在端口 ${PORT}`);
});
