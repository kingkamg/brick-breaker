import SDKBase from './sdkBase'

const PostMsgType = {
  TouchStart: 'touchStart',
  TouchMove: 'touchMove',
  TouchEnd: 'touchEnd',
  ShowNearbyFriend: 'showNearbyFriend',
  ShowTopFriend: 'showTopFriend',
  UpdateRankData: 'UpdateRankData',
  HKDone: "HKDone",
  HKShowRank: 'HKshowRank',
  HKGetUserInfo: 'HKGetUserInfo',
  HKShowNearbyFriend: 'HKshowNearbyFriend',
  HKShowTopFriend: 'HKshowTopFriend',

  ShowRank: 'showRank',
  HideRank: 'hideRank',
  UpdateRankData: 'UpdateRankData'
}

const RankType = {
  /**
   * 好友，调用wx.getFriendCloudStorage(Object object)
   */
  Friend: 0,
  /**
   * 群组，调用wx.getGroupCloudStorage(Object object)
   */
  Group: 1,
  /**
   * 自己，调用wx.getUserCloudStorage(Object object)
   */
  Self: 2,
}

const WXHK = {
  /**
   * 离屏画布的边长，数据最大长度为该值的平方 * 1.5
   */
  canvasSize: 100,
  /**
   * 检查离屏画布的时间间隔，单位：毫秒
   */
  tick: 100,
  tasks: [],
  idInc: 0,
  renderer: new cc.RenderTexture(),
}
const USE_CANVAS_DATA = true

const canvasSize = 50

const BANNERAD_NAME_UNITIDS = {
  GAME_BANNER: 'adunit-333bfde44fe6c8ce',
}

const VIDEOAD_NAME_UNITIDS = {
}

var sdkWechat = cc.Class({
  extends: SDKBase,

  properties: {
    _loadedBannerAds: null,
    _videoAdInstance: null,
  },

  statics : {
    _instance: null,

    getInstance: function () {
      if (this._instance === null) {
        this._instance = new sdkWechat()
        window.sdk = this._instance
      }
      return this._instance
    },
  },

  _postMessageToShareData: function (msgType, data) {
    let msg = {msgType: msgType, data: data}
    let openDataContext = wx.getOpenDataContext()
    console.log('wx.openDataContext.postMessage================', msg)
    openDataContext.postMessage(msg)
  },

  // 每0.1秒获取离屏canvas数据（如果有任务）
  _checkSharedCanvas: function () {
    if (WXHK.tasks.length === 0) {
      return
    }

    WXHK.renderer.initWithSize(WXHK.canvasSize, WXHK.canvasSize)
    WXHK.renderer.initWithElement(wx.getOpenDataContext().canvas)
    let data = new Uint8Array(WXHK.canvasSize * WXHK.canvasSize * 4)
    WXHK.renderer.readPixels(data, 0, 0, WXHK.canvasSize, WXHK.canvasSize)

    const dataMsgId = (data[0] << 16) | (data[1] << 8) | (data[2])

    let index
    for (index = 0; index < WXHK.tasks.length; index++) {
      if (dataMsgId === WXHK.tasks[index].id) {
        break
      }
    }
    if (index >= WXHK.tasks.length) {
      return
    }

    const task = WXHK.tasks.splice(index, 1)[0]
    const buf = []
    let stringBuffer = ""
    let eof = false

    const dequeue = (num) => {
      buf.push(num)
      if (buf.length === 2) {
        if (buf[0] === 0 && buf[1] === 0) {
          buf.length = 0
          eof = true
        } else {
          stringBuffer += String.fromCharCode(buf[0] * 256 + buf[1])
          buf.length = 0
        }
      }
    }

    for (let i = 4; i < data.length && eof === false; i += 4) {
      dequeue(data[i])
      dequeue(data[i + 1])
      dequeue(data[i + 2])
    }

    try {
      let obj = JSON.parse(stringBuffer)
      if (obj.status === 200) {
        console.log("wxhk: resolve 成功返回数据, msgId", task.id)
        task.resolve(obj.data)
      } else {
        task.reject("wxhk: reject 读画布成功 msgId", task.id, "但是wx接口获取数据失败，原因: " + obj.reason)
      }
    } catch(e) {
      task.reject("wxhk: reject 数据损坏 msgId", task.id, "结果", stringBuffer)
    }
    wx.getOpenDataContext().postMessage({
      msgType: PostMsgType.HKDone,
    })
  },

  _checkSDKVersion (version) {
    let info = wx.getSystemInfoSync()
    return info && this._parseVersionToCode(info.SDKVersion) >= this._parseVersionToCode(version)
  },

  _parseVersionToCode (version) {
    let vs = version.split('.')
    let rate = 100
    let code = 0
    let level = 0
    while(vs.length > 0) {
      level++
      code += parseInt(vs.pop()) * Math.pow(rate, level)
    }
    return code
  },

/**
 * 检测新版本更新
 */
  _checkUpdate(callback) {
    if (typeof callback !== 'function') {
      callback = () => {
      }
    }
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      callback({
        fName: 'onCheckForUpdate',
        value: res.hasUpdate
      })
    })

    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '提示',
        content: '发现新版本，是否重启更新？',
        showCancel: false,
        confirmText: '确定',
        success: (res) => {
          callback({
            fName: 'onUpdateReady',
            value: 'success'
          })
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        },
        fail: () => {
          callback({
            fName: 'onUpdateReady',
            value: 'fail'
          })
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      callback({
        fName: 'onUpdateFailed',
        value: 'showModal'
      })
    })
  },

  _convertToWechatRect (rect, style) {
    let info = wx.getSystemInfoSync()
    let dirty = style.width != rect.width || style.height != rect.height || style.left != rect.x || style.top != info.screenHeight - rect.y
    style.width  = rect.width
    style.height = rect.height
    style.left   = rect.x
    style.top    = info.screenHeight - rect.y
    console.log('_convertToWechatRect======================', rect, style)
    return dirty
  },

  _loadBannerAd (adId, rect) {
    let {bannerAd, style} = this._loadedBannerAds[adId] || {}
    style = style || {top:0, left: 0, width: 0, height: 0}
    let dirty = this._convertToWechatRect(rect, style)
    if (bannerAd) {
      if (dirty) {
        bannerAd.style.left   = style.left
        bannerAd.style.top    = style.top
        bannerAd.style.width  = style.width
        bannerAd.style.height = style.height
      }
      return bannerAd
    }
    bannerAd = wx.createBannerAd({
      adUnitId: adId,
      style: {
        left   : style.left,
        top    : style.top,
        width  : style.width,
        height : style.height,
      },
    })
    bannerAd.onResize((res)=>{
      console.log('wx.bannerAd.onResize================>>>>>>>>>>>>>', res)
      bannerAd.style.top = style.top - res.height - 2
      if (style.height && res.height > style.height && res.width > 300) {
        bannerAd.style.top = style.top - style.height - 2
        let targetWidth = Math.max(300, res.width / res.height * style.height)
        bannerAd.style.left   = style.left + (style.width - targetWidth) / 2
        bannerAd.style.width  = targetWidth
        bannerAd.style.height = style.height
      }
    })
    bannerAd.onError((errMsg, errCode)=>{
      console.log('wx.bannerAd.onError================>>>>>>>>>>>>>', errMsg, errCode)
    })
    this._loadedBannerAds[adId] = {bannerAd, style}
    return bannerAd
  },

  ctor : function () {
    console.log('wx.init================', wx.getSystemInfoSync())
    this._loadedBannerAds = {}
    wx.showShareMenu({
      withShareTicket:true,
      success: function () {
        console.log('wx.showShareMenu================success>>>>>>>>>>>>>')
      },
      fail: function () {
        console.log('wx.showShareMenu================fail<<<<<<<<<<<<<<<<')
      }
    })

    // check update
    this._checkUpdate()

    if (USE_CANVAS_DATA) {
      // 每0.1秒获取离屏canvas数据（如果有任务）
      this.wxhkTaskID = 0
      this.renderTexture = new cc.RenderTexture()
      this.wxhkResolver = null
      this.wxhkRejector = null
      setInterval(this._checkSharedCanvas.bind(this), 100)
    }
  },

  destroy () {
    super.destroy();
    for (let key in this._loadedBannerAds) {
      let {bannerAd, style} = this._loadedBannerAds[key]
      bannerAd.destroy()
    }
  },

  // 获取支持登陆的所有SDK名称
  getLoginTypes: function () {
    return []
  },

  // 获取支持登陆的单个SDK名称（优先初始化的SDK）
  getLoginType: function () {
    return null
  },

  // 调用指定SDK的登陆方法
  loginWithType: function (loginType, callback = null, failcall = null) {
  },

  // 获取所有支持支付的SDK名称
  getPayTypes: function () {
    return []
  },

  // 获取支持支付的单个SDK名称（优先初始化的SDK）
  getPayType: function () {
    return null
  },

  // 调用指定SDK的支付方法
  payWithType: function (payType, amount, price, name, desc = null, extra = null, successcall = null, failcall = null) {

  },

  // 调用优选支付SDK的支付方法
  pay: function (price, amount, name, desc = null, extra = null, successcall = null, failcall = null) {
    return this.payWithType(this.getPayType(), price, amount, name, desc, extra, successcall, failcall)
  },

  // 是否支付Banner广告
  supportBannerAd: function () {
    return this._checkSDKVersion('2.0.4')
  },

  // 是否支付插屏广告
  supportInsertAd: function () {
    return false
  },

  // 是否支付视频广告
  supportVideoAd: function () {
    return this._checkSDKVersion('2.0.4')
  },

  // 是否支持排行榜
  supportRanking: function () {
    return true
  },

  supportMoregames: function () {
    return this._checkSDKVersion('2.2.0')
  },

  /**
   * 是否支持分享
   * @returns {boolean}
   */
  supportShare () {
    return true
  },

  // 更新排行榜信息
  updateRankInfo: function (data, orderKey, isReverse = false, timeMode = 0) {
    let params = {
      data: data,
      orderKey: orderKey,
      isReverse: isReverse,
      timeMode: timeMode
    }
    this._postMessageToShareData(PostMsgType.UpdateRankData, params)
  },

  // 设置获取分享信息的回调接口
  setShareInfoCallback:function (callback) {
    wx.onShareAppMessage(() => {
      let {title,imageUrl,query} = callback()
      console.log("=================",title,imageUrl,query)
      return {
        title: title,
        imageUrl: imageUrl,
        query: query,
      }
   })
  },

  // 微信数据(特殊)

  /**
   * 更新玩家在排行榜上的分数
   * @param {string} whichBoard 排行榜名称，KVData里面的Key
   * @param {number} score 玩家分数，注意，该方法不判断“低分不能覆盖高分”的逻辑
   * @override
   */
  updateLeaderboardScore(whichBoard, score) {
    return new Promise((resolve, reject) => {
      const scoreEntry = {
        wxgame: {
          score: score,
          update_time: new Date().valueOf(),
        }
      }
      const upkv = []
      upkv.push()
      wx.setUserCloudStorage({
        KVDataList: [{
          key: whichBoard,
          value: JSON.stringify(scoreEntry),
        }],
        success: () => resolve(),
        fail: () => reject("wx.setUserCloudStorage failed")
      })
    })
  },

  /**
   * 获取排行榜数据
   * @param {string} whichBoard 排行榜名称，KVData里面的Key
   * @param {RankType} rankType 排行榜类型
   * @override
   */
  fetchLeaderboardData(whichBoard, rankType) {
    WXHK.idInc ++
    wx.getOpenDataContext().postMessage({
      msgType: PostMsgType.HKShowRank,
      msgId: WXHK.idInc,
      data: {
        rankType: rankType,
        params: {
          keyList: [whichBoard],
        }
      }
    })
    return new Promise((resolve, reject) => {
      WXHK.tasks.push({
        id: WXHK.idInc,
        resolve: resolve,
        reject: reject,
      })
    })
  },

  fetchUserInfo() {
    WXHK.idInc ++
    wx.getOpenDataContext().postMessage({
      msgType: PostMsgType.HKGetUserInfo,
      msgId: WXHK.idInc,
      data: {
        params: {
          openIdList: ["selfOpenId"]
        }
      }
    })
    return new Promise((resolve, reject) => {
      WXHK.tasks.push({
        id: WXHK.idInc,
        resolve: resolve,
        reject: reject,
      })
    })
  },

  showRanking (type, keyList, titles, timeMode = 0) {
    let params = {
      type: type,
      keyList: keyList,
      titles: titles,
      timeMode: timeMode
    }
    this._postMessageToShareData(PostMsgType.ShowRank, params)
  },

  hideRanking () {
    this._postMessageToShareData(PostMsgType.HideRank, {})
  },

  showMoreGames () {
    wx.navigateToMiniProgram({
      appId: "wxe653759d1db46e02",
      path: "pages/index/index",
      extraData: {},
      fail: (err)=>{
        console.log('wx.navigateToMiniProgram=================== fail', err)
      }
    })
  },

  /**
   * 显示广告
   * @param name 显示广告名称
   */
  showBannerAd (name, rect) {
    let adUnitId = BANNERAD_NAME_UNITIDS[name]
    this.hideAllBannerAds(adUnitId)
    let bannerAd = this._loadBannerAd(adUnitId, rect)
    bannerAd.show().then().catch((err)=>{
      console.log('show banner ad failed', err)
      bannerAd.destroy()
      delete this._loadedBannerAds[adUnitId]
      this.showBannerAd(name, rect)
    })
    // bannerAd.onLoad(()=>{
    //   bannerAd.show()
    // })
  },

  /**
   * 隐藏广告
   * @param name 隐藏广告名称
   */
  hideBannerAd (name) {
    let adUnitId = BANNERAD_NAME_UNITIDS[name]
    let {bannerAd, style} = this._loadedBannerAds[adUnitId] || {}
    if (bannerAd) {
      bannerAd.hide()
      // bannerAd.offLoad()
    }
  },

  /**
   * 隐藏所有广告
   */
  hideAllBannerAds (skip=null) {
    for (let key in this._loadedBannerAds) {
      if (skip === key) continue
      let {bannerAd, style} = this._loadedBannerAds[key]
      bannerAd.hide()
    }
  },

  /**
   * @param name         广告标识名称
   * @param successcall  加载成功回调
   * @param failcall     加载失败回调
   */
  loadVideoAd (name, successcall = null, failcall = null) {
    let adUnitId = VIDEOAD_NAME_UNITIDS[name]
    if (!adUnitId) return failcall && failcall()
    this._videoAdInstance = wx.createRewardedVideoAd({ adUnitId: adUnitId })
    this._videoAdInstance.load().then(()=>{
      successcall && successcall()
      console.log('loadVideoAd success=================', adUnitId)
    }).catch((err)=>{
      this._videoAdInstance = null
      failcall && failcall()
      console.log('loadVideoAd fail=================', adUnitId, err)
    })
  },

  /**
   * @param successcall  完成成功回调
   * @param failcall     未完成回调
   */
  showVideoAd (successcall = null, failcall = null) {
    if (!this._videoAdInstance) {
      return failcall && failcall()
    }
    this._videoAdInstance.offClose()
    this._videoAdInstance.onClose ((res)=>{
      // 微信基础库 < 2.1.0 的用户没有关闭广告按钮，返回值为 undefined
      if (res === undefined || res.isEnded === true) {
        successcall && successcall()
      } else {
        failcall && failcall()
      }
    })
    this._videoAdInstance.show().then(()=>{
      console.log('showVideoAd success=================')
    }).catch((err)=>{
      failcall && failcall()
      console.log('showVideoAd fail=================', err)
    })
  },

  /**
   * 分享
   * @param {string} title
   * @param {string} imageUrl
   * @param {string} [query=null]
   * @param {Function} [successcall=null]
   * @param {Function} [failcall=null]
   */
  shareInfo (title, imageUrl, query=null, successcall=null, failcall=null) {
    let shareObj = {
      title: title,
      imageUrl:imageUrl,
      query:query || undefined,
    }
    if (this._checkSDKVersion('2.0.8')) {
      successcall && successcall()
    } else {
      shareObj['success'] = function(res) {
        successcall && successcall()
      }
      shareObj['fail'] = function() {
        failcall && failcall()
      }
    }
    wx.shareAppMessage(shareObj)
  },

});

module.export = sdkWechat
