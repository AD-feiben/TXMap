const TXMap = {
  map: undefined, // 地图对象
  overlays: [], // 所有覆盖物
  sourceData: [], // 原始数据
  listener: undefined, // idle事件监听

  // 异步加载获取api
  getApi (funName) {
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `http://map.qq.com/api/js?v=2.exp&callback=${funName}`
    document.body.appendChild(script)
  },
  drawOverlay (options) {
    let _this = this
    this.sourceData = options.data || []
    // 绘制覆盖物之前，清理之前绘制的覆盖物
    this.clearOverlays()
    // 如果 initMap 方法已经实现，那么我们可以直接调用，否则需要进行定义
    if (window.initMap === undefined) {
      // 如果地图对象还不存在，则需要初始化，避免多次初始化地图对象
      window.initMap = function () {
        if (_this.map === undefined) {
          // 地图对象为undefined时, 需要进行地图的绘制
          _this.map = new window.qq.maps.Map(document.getElementById(options.containerId), {
            // 初始化地图中心
            center: new window.qq.maps.LatLng(options.lat || 22.702, options.lng || 114.09),
            // 初始化缩放级别
            zoom: options.zoom || 10,
            // 地图最小缩放级别
            minZoom: 10,
            // 停用缩放控件
            zoomControl: false,
            // 停用地图类型控件
            mapTypeControl: false
          })
          // idle 事件, 地图缩放或平移之后触发该事件
          _this.listener = window.qq.maps.event.addListener(_this.map, 'idle', () => {
            // 获取当前地图可视范围的最大最小经纬度
            let bounds = _this.map.getBounds()
            // 获取当前地图的缩放级别
            let zoom = _this.map.getZoom()
            // 调用 Vue 组件对 idle 事件的处理函数
            options.callback && options.callback(bounds, zoom)
          })
        }

        // 自定义覆盖物
        if (window.CustomOverlay === undefined) {
          window.CustomOverlay = function (lat, lng, name, houseCount) {
            // 调用地图 api 计算出覆盖物的位置
            this.position = new window.qq.maps.LatLng(lat, lng)
            this.name = name // 区域名
            this.houseCount = houseCount // 房源数量
          }
          // 继承 Overlay
          window.CustomOverlay.prototype = new window.qq.maps.Overlay()
          // 自定义覆盖物构造函数，定义覆盖为的 DOM 结构
          window.CustomOverlay.prototype.construct = function () {
            let div = this.div = document.createElement('div')
            div.className = 'my-overlay' // 覆盖物类名
            // 覆盖物 html 结构
            this.div.innerHTML = `<p class="count" >${this.houseCount}<span>套</span></p><p class="name">${this.name}</p>`
            //将dom添加到覆盖物层，overlayMouseTarget的顺序容器 5，此容器包含透明的鼠标相应元素，用于接收Marker的鼠标事件
            this.getPanes().overlayMouseTarget.appendChild(div)
            // 将 div 添加到 overlays,可以用以后续处理
            _this.overlays.push(div)
            // 定义覆盖物的点击事件
            let center = this.position
            this.div.onclick = function () {
              // 点击之后对地图进行缩放以及平移
              let zoom = _this.map.getZoom()
              if (zoom < 13) {
                _this.map.setCenter(center)
                _this.map.setZoom(13)
              } else if (zoom >= 13 && zoom < 15) {
                _this.map.setCenter(center)
                _this.map.setZoom(15)
              }
            }
          }

          // 实现 draw 接口来绘制 DOM 元素
          window.CustomOverlay.prototype.draw = function () {
            let overlayProjection = this.getProjection()
            // 获取覆盖物容器的相对像素坐标
            let pixel = overlayProjection.fromLatLngToDivPixel(this.position)
            let divStyle = this.div.style
            // 根据 DOM 元素调整定位的位置
            divStyle.top = pixel.y - 53 + 'px'
            divStyle.left = pixel.x - 30 + 'px'
          }
        }

        // 根据接口数据绘制覆盖物
        if (_this.sourceData.length > 0) {
          _this.sourceData.map(item => {
            let customOverlay = new window.CustomOverlay(item.latitude, item.longitude, item.name, item.house_count)
            customOverlay.setMap(_this.map)
          })
        }
      }
      // 地图 api 如果没有引入则调用 getApi 方法，否则直接调用 initMap ()
      window.qq === undefined ? this.getApi('initMap') : window.initMap()
    } else {
      window.initMap()
    }
  },
  // 清除自定义覆盖物
  clearOverlays () {
    let overlay
    while (overlay = this.overlays.pop()) {
      overlay.onclick = null // 移除点击事件
      overlay.parentNode.removeChild(overlay) // 移除 dom 元素
    }
  },
  // 在 Vue 组件的 beforeDestroy 调用，重置地图，移除时间为监听，避免内存泄漏
  clearMap () {
    this.map = undefined
    if (this.listener) {
      window.qq.maps.event.removeListener(this.listener)
    }
  }
}

export default TXMap
