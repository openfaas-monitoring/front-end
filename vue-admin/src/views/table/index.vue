<template>
<div class="mixin-components-container">
  
        <div slot="header" class="clearfix">
          <h3>please select a function</h3>
        </div>
  <br/>
  <el-button 
  type="success"
    v-for="item in allFunctionList"
    :key="item"
    
    effect="dark"
    v-on:click="onClick(item)">
    {{ item +"  "}}
  </el-button>

<div class = "description">
    <br/>
      <br/>
<el-table
    :data="tableData"
    stripe
    style="width: 100%">
    <el-table-column
      prop="loc"
      label="镜像位置"
      width="180">
    </el-table-column>
    <el-table-column
      prop="success"
      label="调用成功次数"
      width="180">
        </el-table-column>
       <el-table-column
      prop="error"
      label="调用失败次数"
      width="180">
    </el-table-column>
    <el-table-column
      prop="copyNum"
      label="副本个数">
    </el-table-column>
     <el-table-column
      prop="ft"
      label="平均运行时间">
    </el-table-column>
     <el-table-column
      prop="rt"
      label="平均响应时间">
    </el-table-column>
    <el-table-column
      prop="nod"
      label="所在node">
    </el-table-column>
  </el-table>
  </div>
  <!-- <br/>
  <br/>
  <br/> -->
  <div>
    <!-- <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :v-bind:char-data="funcY" />
    </el-row>
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :v-if="flag" :v-bind:chart-data="lineChartData" />
    </el-row> -->

  <template>
  <el-row class="container" :gutter="20"  style="padding-top:30px">
    <el-col :span="8" style="margin-top=20px; height:800px;">
      <!-- <el-card>
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
      </el-card> -->

      <el-card>
        <el-table
          ref="logTable"
          style="width: 100%;margin-top:20px; ">

          <el-table-column
            property="name"
            label="日志"
            >

          </el-table-column>
      </el-table>
      </el-card>
    </el-col>

    <!-- <el-col :span="16"> -->
      <!-- <el-card>
        <el-descriptions class="server" direction="vertical" border>
          <el-descriptions-item label="所在服务器">
            {{ "所在服务器："+currentNode }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card> -->

      <el-card style="height:500px;margin-top:0px;" :span="3">
        <div  style="height:250px" ref="cpuLine"></div>
        <div  style="height:250px" ref="memLine"></div>        
      </el-card>

    <!-- </el-col> -->

  </el-row>
</template>
  </div>
</div>
</template>

<script>
import axios from 'axios'
import LineChart from './components/LineChart'
import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
import PanelGroup from './components/PanelGroup'
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
// const lineChartData = {
//   newVisitis: {
//     expectedData: [100, 120, 161, 134, 105, 160, 165],
//     actualData: [120, 82, 91, 154, 162, 140, 145]
//   },
//   messages: {
//     expectedData: [200, 192, 120, 144, 160, 130, 140],
//     actualData: [180, 160, 151, 106, 145, 150, 130]
//   },
//   purchases: {
//     expectedData: [80, 100, 121, 104, 105, 90, 100],
//     actualData: [120, 90, 100, 138, 142, 130, 130]
//   },
//   shoppings: {
//     expectedData: [130, 140, 141, 142, 145, 150, 160],
//     actualData: [120, 82, 91, 154, 162, 140, 130]
//   }
// }
  export default {
  created() {
    this.fetchData()
    this.getAllFunction()
    this.getFunctionInfo('add')
    this.getFunctionInfo('errlog')
    this.getFunctionInfo('nodeinfo')
    this.getFunctionInfo('test')
  },
    components: {
    LineChart,
    RaddarChart,
    PieChart,
    BarChart,
  },
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
        flag:false,
        funcY: {},
        lineChartData:{},
        allFunctionList:null,
        allFunctionMap:null,
        funcInfo:null,
        curFuc:null,
        dynamicFuncInfo:null,
          items: [
          { type: '', label: '标签一' },
          { type: 'success', label: '标签二' },
          { type: 'info', label: '标签三' },
          { type: 'danger', label: '标签四' },
          { type: 'warning', label: '标签五' }
        ],
          tableData: [{
          loc: '',
          success: '',
          error: '',
          copyNum:null,
          ft:'',
          rt:'',
          nod:''
        }]
      
       
      }
    },
    mounted () {
      this.initChart()
    axios
      .get('http://10.60.150.24:8000/static/function?func=add')
      .then(response => (this.info = response))
      .catch(function (error) { // 请求失败处理
        console.log(error);
      });
    axios
      .get('http://10.60.150.24:8000/global/functions')
      .then(response => (this.functionList = response.data.func))
      .catch(function (error) { // 请求失败处理
        console.log(error);
      });
  },
   destroyed(){
    clearTimeout(this.updateST)
  },
    methods: {
      getFuncY(){
        var cpuR = []
        var memR = []
        for(var i =0;i<this.dynamicFuncInfo.get(this.curFuc).cpuRate.length;i++){
          cpuR[i] = this.dynamicFuncInfo.get(this.curFuc).cpuRate[i][0]
          memR[i] = this.dynamicFuncInfo.get(this.curFuc).memRate[i][0]
        }
        this.funcY.cpuR = cpuR
        this.funcY.memR = memR
        this.flag = true
        
      },
      getTabelData(){
        this.tableData[0].loc = this.allFunctionMap.get(this.curFuc).image
        this.tableData[0].success = this.allFunctionMap.get(this.curFuc).invocations.success
        this.tableData[0].error= this.allFunctionMap.get(this.curFuc).invocations.error
        this.tableData[0].copyNum = this.allFunctionMap.get(this.curFuc).replicas
        this.tableData[0].ft = this.dynamicFuncInfo.get(this.curFuc).func_time
        this.tableData[0].rt = this.dynamicFuncInfo.get(this.curFuc).request_time
        this.tableData[0].nod = this.dynamicFuncInfo.get(this.curFuc).nod
      },
      onClick(item){
        this.curFuc = item
        this.getTabelData()
        this.getFuncY()
        this.currentPod = item // 获得当前容器
        this.currentNode = this.dynamicFuncInfo.get(this.curFuc).nod//当前容器所在结点
        const param = {pod_name:this.currentPod}
        clearTimeout(this.updateST)
        this.startInterval(param)
      },
  
    async getAllFunction(){
        this.allFunctionMap = new Map()
        this.dynamicFuncInfo = new Map()
      axios
      .get('http://10.60.150.24:8000/global/functions')
      .then(async response => {this.allFunctionList = response.data.func
      })
      .catch(function (error) { // 请求失败处理
        console.log(error);
      });

      
    },
     getFunctionInfo(funcName){
     axios
      .get('http://10.60.150.24:8000/static/function?func='+funcName)
      .then(async response => {
       this.allFunctionMap.set(funcName,response.data)
      
      })
      .catch(function (error) { // 请求失败处理
        console.log(error);
      });
       axios
      .get('http://10.60.150.24:8000/dynamic/function?func='+funcName)
      .then(async response => {
       this.dynamicFuncInfo.set(funcName,response.data)
      
      })
      .catch(function (error) { // 请求失败处理
        console.log(error);
      });
       axios
      .get('http://10.60.150.24:8000/static/pod?pod='+funcName)
      .then(async response => {
       this.dynamicFuncInfo.get(funcName).nod = response.data.node
      })
      .catch(function (error) { // 请求失败处理
        console.log(error);
      });
      axios
      .get('http://10.60.150.24:8000/dynamic/pod?pod='+funcName)
      .then(async response => {
       this.dynamicFuncInfo.get(funcName).cpuRate = response.data.cpuRate
      this.dynamicFuncInfo.get(funcName).memRate = response.data.memRate

      })
      .catch(function (error) { // 请求失败处理
        console.log(error);
      });
      
        
      
 
    },
    handleEdit(index, row) {
        console.log(index, row);
      },
      handleDelete(index, row) {
        console.log(index, row);
      },
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
    },
   
  }
</script>
<style>
.el-button{
  margin-left: 15px;
}
.mixin-components-container {
  background-color: #f0f2f5;
  padding: 30px;
  min-height: calc(100vh - 84px);
}
.component-item{
  min-height: 100px;
}
.chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>

