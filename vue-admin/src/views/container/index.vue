<!--容器模块-->
<template>
  <el-row class="container" :gutter="20"  style="padding-top:30px">
    <el-col :span="8" style="margin-top=20px; height:800px;">
      <el-card>
        <el-table
          ref="podTable"
          :data="podList"
          highlight-current-row
          @current-change="handleCurrentChange"
          style="width: 100%; ">

          <el-table-column
            property="name"
            label="当前容器列表"
            >
            <template slot-scope="scope">
              {{ scope.row.pod_name}}
            </template>
          </el-table-column>
      </el-table>
      </el-card>

      <el-card>
        <el-table
          ref="logTable"
          style="width: 100%; ">

          <el-table-column
            property="name"
            label="日志"
            >

          </el-table-column>
      </el-table>
      </el-card>
    </el-col>

    <el-col :span="16">
      <el-card>
        <el-descriptions class="server" direction="vertical" border>
          <el-descriptions-item label="所在服务器">
            {{ "所在服务器："+currentNode }}
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
import {getContainerList,getCpuMemRate} from '@/api/container'
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
      cpuLine:null,
      memLine:null,
      keyArray:['cpu占用率','内存占用率'],
      updateST:null,//轮询计时对象
    }
  },
  created() {
    this.fetchData()
  },
  mounted(){
    this.initChart()
  },
  destroyed(){
    clearTimeout(this.updateST)
  },
  methods: {

    // 初始化图表
    initChart(){
      this.cpuLine  = echarts.init(this.$refs.cpuLine)
      this.memLine = echarts.init(this.$refs.memLine)
    },
    // 更新单个图表
    updateSingleChart(myLabel,mydata,myLine){
        let series = []

        series.push({
            name:myLabel,
            data:mydata,
            type:'line',
            smooth:"true",
            areaStyle:{}
          })

        // let timeSerise = []
        // this.cpuData.forEach(data => {
        //   time = data[0]
        //   commonTime = new Date(time*1000).Format("yyyy-MM-dd hh:mm:ss")
        //   timeSerise.push(commonTime)
        // });
        
        const option = {
          xAxis:{
            type:"time",
          },
          yAxis:{
            min:0,
            max:100
          },
          legend:{
            data:[myLabel]
          },
          tooltip:{
            show:true
          },
          series
        }
        myLine.setOption(option)
    },
    // 更新两个图表
    updateChart(){
      this.updateSingleChart(this.keyArray[0],this.cpuData,this.cpuLine)
      this.updateSingleChart(this.keyArray[1],this.memData,this.memLine)
    },

    // 轮询方法
    startInterval(param){
      getCpuMemRate(param).then(res => {
        // 数据处理 - 每个值*100
        this.cpuData = res.cpuRate.map(item =>{
          return [item[0],item[1]*100]
        })
        this.memData = res.memRate.map(item =>{
          return [item[0],item[1]*100]
        })
        this.updateChart()
        this.updateST = setTimeout(() =>{
          clearTimeout(this.updateST)
          this.startInterval(param)
        },1000)
      })
    },
    // 处理更改列表的选项
    handleCurrentChange(val) {
      this.currentPod = val.pod_name // 获得当前容器
      this.currentNode = val.node//当前容器所在结点
      const param = {pod_name:this.currentPod}
      clearTimeout(this.updateST)
      this.startInterval(param)
    },
    // 初始化列表数据
    fetchData() {
      this.listLoading = true
      getContainerList().then(response => {
        this.podList = response.pods
        this.$refs.podTable.setCurrentRow(this.podList[1])
        this.listLoading = false
      })
     
    }
  }
}
</script>
