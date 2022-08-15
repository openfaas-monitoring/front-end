<!-- 服务器模块 -->
<template>
  <el-row class="container" :gutter="13" style="padding-top:30px">
    <el-col :span="4" style="margin-top=80px;height:800px;">
      <el-card  style="height:617px;">
        <el-table
          ref="nodeTable"
          :data="nodeList"
          :v-loading="loading"
          highlight-current-row
          @current-change="handleCurrentChange"
          style="width: 100%; ">

          <el-table-column
            property="name"
            label="服务器列表"
            prop="nodeList"
            >
            <template slot-scope="scope" >
              {{scope.row.node}}
            </template>
          </el-table-column>
      </el-table>
      </el-card>
    </el-col>

    <el-col :span="4" style="height:800px;">
      <el-card style="height:617px;">
        <el-table
          class="containerTable"
          :data="podList"
          :v-loading="loading"
          element-loading-text="Loading"
          style="width: 100%; ">

          <el-table-column
            label="内部容器列表"
            prop="podList"
            >
            <template slot-scope="scope" >
              <span v-for="(item,index) in scope.row" :key="index">{{item}}</span>
            </template>
          </el-table-column>
      </el-table>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card style="height:300px;" id="cpuLine" >
        <div  style="height:300px;" ref="cpuLine"></div>
      </el-card>
      <el-card style=" height:300px;" id="memLine" >
        <div  style="height:300px" ref="memLine"></div>
      </el-card>
    </el-col>
    <el-col :span="8">
      <el-card style="height:300px;"  id="IOLine">
        <div  style="height:300px" ref="IOLine"></div>
      </el-card>
      <el-card style=" height:300px;"  id="netLine">
        <div  style="height:300px" ref="netLine"></div>
      </el-card>
    </el-col>

  </el-row>



</template>

<script>
import {getNodeList,getNodeContainers,getNodeRate} from '@/api/container'
import * as echarts from 'echarts'


export default {
  data() {
    return {
      nodeList:['No data'],
      podList: [],
      currentPod: null,
      currentNode:null,
      cpuData:[[]],
      memData:[[]],
      diskRead:[[]],
      diskWrite:[[]],
      netDown:[[]],
      netUp:[[]],
      keyArray:['cpu占用率','内存占用率','磁盘读速率','磁盘写速率','网络下载速率','网络上传速率']
    }
  },
  created() {
    this.fetchData()
    this.getRate()
    this.drawDoubleLine("IO")
    this.drawDoubleLine("network")
    this.setSingleLine()
  },
  methods: {
    getRate(){
      let param = {node:this.currentNode}

      // 查询各类速率 - 一次请求版本
      getNodeRate(param).then(res => {
        this.cpuData = res.cpuRate
        this.memData = res.memRate
        this.diskRead = res.diskRead
        this.diskWrite = res.diskWrite
        this.netDown = res.networkDown
        this.netUp = res.networkUp
        console.log("readRate finished")
      })
    },


    drawDoubleLine(type){
              
        let series = []
        let A_data,B_data,A_label,B_label
        let Line
        if(type === 'IO'){
          A_data = this.diskRead
          A_label = this.keyArray[2]
          B_data = this.diskWrite
          B_label = this.keyArray[3]
          Line  = echarts.init(this.$refs.IOLine)
        }
        else{
          A_data = this.netDown
          A_label = this.keyArray[4]
          B_data = this.netUp
          B_label = this.keyArray[5]
          Line  = echarts.init(this.$refs.netLine)
        }

        series.push({
            name:A_label,
            data:A_data,
            type:'line',
            areaStyle:{},

          })
        series.push({
            name:B_label,
            data:B_data,
            type:'line',
            areaStyle:{},

          })
        
        let option = {
          xAxis:{
            type:'time'
          },
          yAxis:{
            name:'%',
            min:0,
            max:100
          },
          legend:{
            data:[A_label,B_label]
          },
          tooltip:{
            show:true,
          },
          series
        }
        
      
        Line.setOption(option)
    },
    drawSingleLine(label,mydata,Line){
        let series = []
        series.push({
            name:label,
            smooth:true,
            type:'line',
            data:mydata,
            areaStyle:{},
            
          })
        
        let option = {
          xAxis:{
            type:'time',
            areaStyle:{},
            data:[0,60],
            position:'center'
          },
          yAxis:{
            type:'value',
            name:'%',
            min:0,
            max:100
          },
          legend:{
            data:[label]
          },
          tooltip:{
            show:true
          },
          series
        }
        
      
        Line.setOption(option)
    },    
    setSingleLine(){
        let line = echarts.init(this.$refs.cpuLine)
        this.drawSingleLine(this.keyArray[0],this.cpuData,line)
        let newLine =  echarts.init(this.$refs.memLine)
        this.drawSingleLine(this.keyArray[1],this.memData,newLine)
    },
    handleCurrentChange(val) {
      this.currentNode = val.node//当前容器所在结点
      let param = {node:this.currentNode}
      getNodeContainers(param).then(response => {
        this.podList = response.pod_name
      })
      this.getRate()
      this.drawDoubleLine("IO")
      this.drawDoubleLine("network")
      this.setSingleLine()
          //成功回调函数停止加载

    },
    fetchData() {
      this.listLoading = true
      getNodeList().then(response => {
        this.nodeList = response.nodes
        this.currentNode = this.nodeList[0].node
        this.$refs.nodeTable.setCurrentRow(this.nodeList[0]);
      })
      this.listLoading = false
    }
  }
}
</script>
