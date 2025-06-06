const qs = require('qs');
const crypto = require('crypto-js');
const kuaiShosignCore = require('./kuaiShoSignCore.js');

// 快手平台签名
class KwaiSign {
  exports = {};

  constructor() {
    const obj = {
      exports: {},
      id: 75407,
      loaded: true,
    };
    kuaiShosignCore.default[75407](obj);
    this.exports = obj.exports;
  }

  /**
   * 输入：
   * sign({
   *   url: '/rest/cp/creator/comment/report/menu',
   *   type: 'json',
   *   json: {
   *     'kuaishou.web.cp.api_ph': '19af6d5b24cb170a03331ce9254b1204154c',
   *   },
   * })
   * 输出：
   * /rest/cp/creator/comment/report/menu?__NS_sig3=4656112138efc7727e1b18193ee992f9c3278f63070705050a0b0812
   * @param params
   */
  sign(params) {
    return new Promise(async (resolve, reject) => {
      const { url } = params;
      const md5 = this.md5(params);

      this.exports.realm.global['$encode'](md5, {
        suc(s) {
          resolve(`${url}?__NS_sig3=${s}`);
        },
        err(e) {
          console.error('签名失败：', e);
          reject(e);
        },
      });
    });
  }

  md5({ json, type }) {
    let str = '';
    if (type === 'form-data') {
      str = qs.stringify(json);
    } else {
      str = JSON.stringify(json);
    }
    return crypto.MD5(str).toString();
  }
}
const kwaiSign = new KwaiSign();
kwaiSign.sign({
  url: '/rest/cp/creator/comment/report/menu',
  type: 'json',
  json: {
    'kuaishou.web.cp.api_ph': '19af6d5b24cb170a03331ce9254b1204154c',
  },
}).then(r => {
  console.log(`签名：${r}`);
});