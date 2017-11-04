<template>
  <div id="map-box">
  </div>
</template>

<script>
import TXMap from '@/utils/TXMap'

export default {
  data () {
    return {
      lastZoom: 10, // 记录地图的缩放级别
      districtUrl: 'https://ajax.lianjia.com/ajax/mapsearch/area/district?&&city_id=440300&callback=handleDistrict',
      bizcircleUrl: 'https://ajax.lianjia.com/ajax/mapsearch/area/bizcircle?&&city_id=440300&callback=handleDistrict'
    }
  },
  methods: {
    handleDile (bounds, zoom) {
      // 缩放级别需要与 TXMap 中匹配
      console.log('dile 事件触发了，可以根据 bound, zoom 参数再作处理')
      if (this.lastZoom >=13 && zoom < 13) { // 从第二层缩小回到第一层
        this.getData(this.districtUrl)
      } else if (this.lastZoom < 13 && zoom >= 13) { // 从第一层方法到第二层
        this.getData(this.bizcircleUrl)
      }
      this.lastZoom = zoom
    },
    handleDistrict (res) {
      let _this = this
      if (res.status === 0) {
        TXMap.drawOverlay({
          containerId: 'map-box',
          data: res.data,
          callback: _this.handleDile
        })
      } else {
        alert('获取数据失败')
      }
    },
    getData (src) {
      // 获取链家数据
      let script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = src
      document.body.appendChild(script)
    }
  },
  mounted () {
    this.getData(this.districtUrl)

    window.handleDistrict = this.handleDistrict
  }
}
</script>

<style>

  body, p{
    margin: 0;
    padding: 0;
  }

  #map-box {
    width: 100%;
    height: 100vh;
  }

  .my-overlay{
    position: absolute;
    width: 60px;
    height: 46px;
    background-color: #0778dc;
    padding: 3px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: bold;
    text-align: center;
    box-sizing: border-box;
    box-shadow: 2px 10px 20px 0 rgba(0, 0, 0, .2);
  }
  .my-overlay::after{
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-top: 7px solid #0778dc;
    border-right: 4px solid transparent;
    border-left: 4px solid transparent;
    position: absolute;
    bottom: -7px;
    left: 26px;
  }
  .my-overlay span{
    font-size: 10px;
    font-weight: normal;
    color: #999;
  }
  .my-overlay .count{
    border-radius: 3px 3px 0 0;
    color: #0778dc;
    background: #fff;
  }
  .my-overlay .name{
    color: #fff;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

</style>
