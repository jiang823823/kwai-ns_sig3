const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// ========== 签名算法实现（你需要根据实际情况替换） ==========
// 这里只是一个示例，真正的算法请从原仓库或脚本中提取
function generateEncSign(data, ud) {
    // TODO: 实现真正的 encsign 算法
    // 简单示例：返回一个假签名（不能用于实际）
    return {
        encdata: Buffer.from(data).toString('base64'),
        sign: crypto.createHash('md5').update(data + ud).digest('hex')
    };
}

function generateNssig(path, reqdata, salt, ud, device_id) {
    // TODO: 实现真正的 nssig 算法
    // 简单示例：返回假数据
    return {
        sig: crypto.createHash('md5').update(path + reqdata + salt).digest('hex'),
        __NS_sig3: crypto.randomBytes(32).toString('hex'),
        __NStokensig: crypto.randomBytes(32).toString('hex'),
        __NS_xfalcon: ''
    };
}
// ======================================================

// 接口1：encsign
app.post('/encsign', (req, res) => {
    const { type, data, ud, script_version } = req.body;
    if (type !== 'encsign') {
        return res.status(400).json({ status: false, message: 'Invalid type' });
    }
    const result = generateEncSign(data, ud);
    res.json({ status: true, data: result });
});

// 接口2：nssig
app.post('/nssig', (req, res) => {
    const { type, path, data, salt, ud, device_id, script_version } = req.body;
    if (type !== 'nssig') {
        return res.status(400).json({ status: false, message: 'Invalid type' });
    }
    const result = generateNssig(path, data, salt, ud, device_id);
    res.json({ status: true, data: result });
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`签名服务运行在端口 ${PORT}`);
});
