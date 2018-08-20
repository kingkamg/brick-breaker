import SDKBase from './sdkBase'

const PostMsgType = {
  ShowRank: 'showRank',
  TouchStart: 'touchStart',
  TouchMove: 'touchMove',
  TouchEnd: 'touchEnd',
  ShowNearbyFriend: 'showNearbyFriend',
  ShowTopFriend: 'showTopFriend',
  UpdateRankData: 'UpdateRankData',
  HKShowRank: 'HKshowRank',
  HKShowNearbyFriend: 'HKshowNearbyFriend',
  HKShowTopFriend: 'HKshowTopFriend',
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

const canvasSize = 50

var sdkWechat = cc.Class({
  extends: SDKBase,

  properties: {
  },

  statics : {
    _instance: null,

    getInstance: function () {
      if (this._instance === null) {
        this._instance = new sdkWechat()
      }
      return this._instance
    },
  },

  _postMessageToShareData: function (msgType, data) {
    let msg = {msgType: msgType, data: data}
    let openDataContext = wx.getOpenDataContext()
    openDataContext.postMessage(msg)
  },

  // 每0.1秒获取离屏canvas数据（如果有任务）
  _checkSharedCanvas: function () {
    if (this.wxhkResolver === null) {
      return
    }

    this.renderTexture.initWithSize(canvasSize, canvasSize)
    this.renderTexture.initWithElement(wx.getOpenDataContext().canvas)
    let data = new Uint8Array(canvasSize * canvasSize * 4)
    this.renderTexture.readPixels(data, 0, 0, canvasSize, canvasSize)

    const dataMsgId = (data[0] << 16) | (data[1] << 8) | (data[2])
    if (dataMsgId < this.wxhkTaskID) {
      return
    } else if (dataMsgId < this.wxhkTaskID) {
      this.wxhkRejector("WXHK: 数据任务ID大于当前进度")
      this.wxhkResolver = null
      this.wxhkRejector = null
      return
    }

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
        this.wxhkResolver(obj.data)
      } else {
        this.wxhkRejector("WXHK: 通讯正常，但是wx接口获取数据失败，原因: " + obj.reason)
      }
    } catch(e) {
      this.wxhkRejector("WXHK: 数据损坏: " + stringBuffer)
    }
    this.wxhkResolver = null
    this.wxhkRejector = null
  },

  ctor : function () {
    wx.showShareMenu({
      withShareTicket:true,
      success: function () {
        console.log('wx.showShareMenu================success>>>>>>>>>>>>>')
      },
      fail: function () {
        console.log('wx.showShareMenu================fail<<<<<<<<<<<<<<<<')
      }
    })

    // 每0.1秒获取离屏canvas数据（如果有任务）
    this.wxhkTaskID = 0
    this.renderTexture = new cc.RenderTexture()
    this.wxhkResolver = null
    this.wxhkRejector = null
    setInterval(this._checkSharedCanvas.bind(this), 100)
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
    return false
  },

  // 是否支付插屏广告
  supportInsertAd: function () {
    return false
  },

  // 是否支付视频广告
  supportVideoAd: function () {
    return false
  },

  // 是否支持排行榜
  supportRanking: function () {
    return true
  },

  // 更新排行榜信息
  updateRankInfo: function (data, orderKey, isReverse = false, showInWx = false) {
    let params = {
      data: data,
      orderKey: orderKey,
      isReverse: isReverse,
      showInWx: showInWx
    }
    this._postMessageToShareData(PostMsgType.UpdateRankData, params)
  },

  // 设置获取分享信息的回调接口
  setShareInfoCallback:function (callback) {
    wx.onShareAppMessage(() => {
      let {title,imageUrl,query} = callback()
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
    if (this.wxhkResolver !== null || this.wxhkRejector !== null) {
      this.wxhkRejector("WXHK: 被新任务覆盖")
      this.wxhkResolver = null
      this.wxhkRejector = null
    }
    this.wxhkTaskID ++
    wx.getOpenDataContext().postMessage({
      msgType: PostMsgType.HKShowRank,
      msgId: this.wxhkTaskID,
      data: {
        rankType: rankType,
        params: {
          keyList: [whichBoard],
        }
      }
    })
    return new Promise((resolve, reject) => {
      this.wxhkResolver = resolve
      this.wxhkRejector = reject
    })
  },

});

module.export = sdkWechat