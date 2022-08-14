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
  <br/>
  <br/>
  <br/>
  <div>
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :v-bind:char-data="funcY" />
    </el-row>
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :v-if="flag" :v-bind:chart-data="lineChartData" />
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <raddar-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row>
  </div>
</div>
</template>

<script>
import axios from 'axios'
import LineChart from './components/LineChart'
import RaddarChart from './components/RaddarChart'
import PieChart from './components/PieChart'
import BarChart from './components/BarChart'
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

