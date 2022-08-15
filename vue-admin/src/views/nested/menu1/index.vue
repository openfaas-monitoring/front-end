<!-- 服务器模块（后面根据需求再改路由的配置 -->

<!--容器模块-->
<template>
  <el-row class="container" :gutter="20">
    <el-col :span="8" style="margin-top=20px; height:800px;">
      <el-card>
        <el-table
          ref="nodeTable"
          :data="nodeList"
          highlight-current-row
          @current-change="handleCurrentChange"
          style="width: 100%; ">

          <el-table-column
            property="name"
            label="服务器列表"
            >
            <template slot-scope="scope">
              {{ scope.row.node}}
            </template>
          </el-table-column>
      </el-table>
      </el-card>
    </el-col>

    <el-col :span="8" style="margin-top=20px; height:800px;">
      <el-card>
        <el-table
          class="containerTable"
          :data="podList"
          highlight-current-row
          style="width: 100%; ">

          <el-table-column
            property="name"
            label="内部容器列表"
            >

          </el-table-column>
      </el-table>
      </el-card>
    </el-col>

    <el-col :span="16">

      <el-card style="height:500px;" :span="3">
        <div  style="height:250px" ref="cpuLine"></div>
        <div  style="height:250px" ref="memLine"></div>        
        <div  style="height:250px" ref="IOLine"></div>    
        <div  style="height:250px" ref="netLine"></div>    
      </el-card>

    </el-col>

  </el-row>



</template>

<script>
import {getNodeList,getCpuMemRate} from '@/api/container'
import * as echarts from 'echarts'

export default {
  data() {
    return {
      nodeList:['No data'],
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
      this.currentNode = val.node//当前容器所在结点
      let param = {node:this.currentNode}
      getNodeContainers(param).then(response => {
        this.podList = response.pod_name
      })
      //this.drawLine()
    },
    fetchData() {
      this.listLoading = true
      getNodeList().then(response => {
        console.log("getNodeList",response)
        this.nodeList = response.nodes
        this.listLoading = false
      })
    }
  }
}
</script>
