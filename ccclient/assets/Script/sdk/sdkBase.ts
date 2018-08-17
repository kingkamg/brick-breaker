export default class SDKBase {
  // 初始化以完成事件监听
  public init (): void {
    if (!this.supportBackExit()) return
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this._keyDown, this)
  }

  // 析构以完成事件监听取消
  public destroy (): void {
    if (!this.supportBackExit()) return
    cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this._keyDown, this)
  }

  // 支持按钮操作
  public supportKeyboardMode (): boolean {
    return false
  }

  // 是否支持登陆
  public supportLogin (): boolean {
    return this.getLoginTypes().length > 0
  }

  // 是否支持支付
  public supportPay (): boolean {
    return this.getPayTypes().length > 0
  }

  // 是否支持返回键退出
  public supportBackExit (): boolean {
    return false
  }

  private _keyDown (event): void {
    if (event.keyCode === cc.KEY.back) {
      this.onBackPressed()
    }
  }

  // to override
  // 获取支持登陆的所有SDK名称
  public getLoginTypes (): string[] {
    return []
  }

  // 获取支持登陆的单个SDK名称（优先初始化的SDK）
  public getLoginType (): string {
    return null
  }

  // 调用指定SDK的登陆方法
  public loginWithType (loginType: string, callback: Function = null) {
  }

  // 调用优选登陆SDK的登陆方法
  public login (callback: Function = null) {
    return this.loginWithType(this.getLoginType(), callback)
  }

  // 获取所有支持支付的SDK名称
  public getPayTypes (): string [] {
    return []
  }

  // 获取支持支付的单个SDK名称（优先初始化的SDK）
  public getPayType (): string {
    return null
  }

  // 调用指定SDK的支付方法
  public payWithType (payType: string, amount: number, price: number, name: string, desc: string = null, extra: string = null, successcall:Function = null, failcall: Function = null): void {

  }

  // 调用优选支付SDK的支付方法
  public pay (price: number, amount: number, name: string, desc: string = null, extra: string = null, successcall:Function = null, failcall: Function = null): void {
    return this.payWithType(this.getPayType(), price, amount, name, desc, extra, successcall, failcall)
  }

  // 按下返回键的回调，Cocos由于GL的原因监听不到原生的onBackPressed事件，需要以这里处理
  public onBackPressed (): void {
  }

  // 是否支付Banner广告
  public supportBannerAd (): boolean {
    return false
  }

  // 是否支付插屏广告
  public supportInsertAd (): boolean {
    return false
  }

  // 是否支付视频广告
  public supportVideoAd (): boolean {
    return false
  }

  // 是否支持BUGLY错误收集
  public supportBugly (): boolean {
    return false
  }

  // 是否支持信息收集
  public supportCollection (): boolean {
    return false
  }

  // 是否支持信息收集
  public supportRanking (): boolean {
    return false
  }

  // 设置BUGLY收集唯一ID
  public setBuglyID (id: string) {
  }

  // 设置BUGLY收集场景TAG标识
  public setBuglyTag (tag: number) {
  }

  // 设置BUGLY附加数据MAP
  public setBuglyMap (map: Object) {
  }

  // 添加BUGLY附加数据MAP
  public addBuglyMap (map: Object) {
  }

  // 测试BUGLY
  public testBugly () {
  }

  // 玩家无登陆
  public onUserNoLogin () {

  }

  // 玩家登陆成功
  public onUserLogin (accountId: String ,accountname: String, level: number = null, gameServer: string = null, age: number = null, gender: number = null) {
  }

  // 获取奖励
  public onCollectionReward (reward: number, reson: string = null) {
  }

  // 玩家消耗货币
  public onCollectionPurchase (itemName: string, itemCount: number, cost: number) {

  }

  // 玩家消耗道具
  public onCollectionUse (itemName: string, itemCount: number) {

  }

  // 玩家开始任务
  public onCollectionMissionStart (missionName: string) {

  }

  // 玩家完成任务
  public onCollectionMissionComplete (missionName: string) {

  }

  // 玩家任务失败
  public onCollectionMissionFail (missionName: string, reson: string = null) {

  }

  // 自定义消息
  public onCollectionEvent (eventId: string, params: Object) {

  }

  // 更新玩家排行榜信息
  public updateRankInfo(data: Object, orderKey: string, isReverse: boolean = false, showInWx: boolean = false) {

  }

  // 设置获取分享信息的回调接口
  public setShareInfoCallback (callback:()=>{title,imageUrl,query}) {

  }
}
