import SDKBase from './sdkBase'

const PostMsgType = {
  ShowRank: 'showRank',
  TouchStart: 'touchStart',
  TouchMove: 'touchMove',
  TouchEnd: 'touchEnd',
  ShowNearbyFriend: 'showNearbyFriend',
  ShowTopFriend: 'showTopFriend',
  UpdateRankData: 'UpdateRankData'
}

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
});

module.export = sdkWechat