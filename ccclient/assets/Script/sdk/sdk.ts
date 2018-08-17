import SDKBase from "./sdkBase"

declare const require: any

let sdk: SDKBase = null
if (cc.sys.platform === cc.sys.WECHAT_GAME) {
  let sdkWechat = require('./sdkwechat')
  sdk = sdkWechat.getInstance()
} else {
  sdk = new SDKBase()
}

export default sdk