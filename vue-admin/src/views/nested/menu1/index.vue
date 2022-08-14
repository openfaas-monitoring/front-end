<!-- 服务器模块（后面根据需求再改路由的配置 -->

<!--容器模块-->
<template>
  <el-row class="container" :gutter="20">
    <el-col :span="8" style="margin-top=20px; height:800px;">
      <el-card>
        <el-table
          ref="singleTable"
          :data="podList"
          highlight-current-row
          @current-change="handleCurrentChange"
          style="width: 100%; ">

          <el-table-column
            property="name"
            label="服务器列表"
            >
            <template slot-scope="scope">
              {{ scope.row.pod_name}}
            </template>
          </el-table-column>
      </el-table>
      </el-card>
    </el-col>

    <el-col :span="16">
      <el-card>
        <el-descriptions class="server" direction="vertical" :column="2" border>
          <el-descriptions-item label="所在服务器">
            {{ currentNode }}
          </el-descriptions-item>
        </el-descriptions>        
      </el-card>

      <el-card style="height:500px;" :span="3">
        <div  style="height:250px" ref="cpuLine"></div>
        <div  style="height:250px" ref="memLine"></div>        
      </el-card>

    </el-col>

  </el-row>



</template>

<script>
import {getContainerList,getNode,getCpuMemRate} from '@/api/container'
import * as echarts from 'echarts'
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

export default {
  data() {
    return {
      podList: [],
      currentPod: null,
      currentNode:null,
      cpuData:null,
      memData:null,
      keyArray:['cpu占用率','内存占用率']
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    getRate(){
      let param = {pod_name:this.currentPod}
      // 查询cpu和内存占用率 - 一次请求版本
      getCpuMemRate(param).then(res => {
        console.log(res)
        console.log("cpu_mem_rate",res)
        this.cpuData = res.cpuRate
        this.memData = res.memRate
      })
    },
    drawLine(){
      this.getRate()
              
        let series = []
        let time = null
        let commonTime = null
        
        series.push({
            name:this.keyArray[0],
            data:this.cpuData.map(item => item[1]),
            type:'line'
          })
        series.push({
            name:this.keyArray[1],
            data:this.memData.map(item => item[1]),
            type:'line'
          })
        let timeSerise = []
        this.cpuData.forEach(data => {
          time = data[0]
          commonTime = new Date(time*1000).Format("yyyy-MM-dd hh:mm:ss")
          timeSerise.push(commonTime)
        });
        
        const option = {
          xAxis:{
            data:timeSerise
          },
          yAxis:{},
          legend:{
            data:this.keyArray
          },
          series
        }
        
        const cpuLine  = echarts.init(this.$refs.cpuLine)
        cpuLine.setOption(option)
    },
    handleCurrentChange(val) {
      this.currentPod = val.pod_name // 获得当前容器
      this.currentNode = val.node//当前容器所在结点
      this.drawLine()
    },
    fetchData() {
      this.listLoading = true
      getContainerList().then(response => {
        console.log("containerList",response)
        this.podList = response.pods
        this.listLoading = false
      })
    }
  }
}
</script>
