<!--容器模块-->
<template>
  <el-row class="container" :gutter="20"  style="padding-top:20px; margin:0 auto">
    <el-col :span="6" style="margin-top=10px; height:800px;">
      <el-card style="height:617px;">
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
              {{ scope.row.pod_real_name}}
            </template>
          </el-table-column>
      </el-table>
      </el-card>

    </el-col>

    <el-col :span="8">
      <el-card>
        <el-descriptions class="server" direction="vertical" border>
          <el-descriptions-item label="所在服务器">
            {{ "所在服务器："+currentNode }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
      
      <el-card style="height:500px;margin-top:10px;" :span="3">

        <div  style="height:250px; width:100%" ref="cpuLine"></div>
        <div  style="height:250px" ref="memLine"></div>        
      </el-card>

    </el-col >

    <el-col :span="10">
      
      <el-card>
        <div id="funcgraph" style='overflow-x: auto; overflow-y:auto;'></div>
      </el-card>

      <el-card >
          <pre v-highlightjs="funcSource"><code class="python" style="overflow-x: auto;"></code></pre>
      </el-card>

    </el-col>
  </el-row>
</template>

<script>
import {getContainerList,getCpuMemRate} from '@/api/container'
import {getSource} from '@/api/func'
import * as d3 from 'd3'
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
      funcConfig:null,
      funcSource:null,
      funcGraphData:{},
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
        // 数据处理
        this.cpuData = res.cpuRate
        this.memData = res.memRate

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
      this.getFuncSource(param)
    },
    // 初始化列表数据
    fetchData() {
      this.listLoading = true
      getContainerList().then(response => {
        this.podList = response.pods
        this.$refs.podTable.setCurrentRow(this.podList[1])
        this.currentPod = this.podList[0]
        this.getFuncSource(this.currentPod.pod_name)
        this.listLoading = false
      })
    },

    getFuncSource(funcName){
            // 获取函数调用图信息
      getSource(funcName).then(response =>{
        console.log("获取函数调用图信息")
        this.funcSource = response.source_code
        this.funcConfig = response.config
        this.mapFuncData()
        this.drawFunction()     
      })
      .catch(function (error) { // 请求失败处理
        console.log(error)
      })
    },



          // 调用图数据处理
    mapFuncData(){
      let n_idx = 0
      let nodes = [],links=[]
      this.funcConfig.forEach((item,index) => {
        
        if(index === 0){
           n_idx = n_idx + 1
            let node_1 = {
            id: n_idx,
            name:item[0],
            label:item[0],
            group:"User 0",
            runtime:20
            }
           nodes.push(node_1)
         
        }

        let inFlag = nodes.find(value  => {
            return value.name === item[1]
        })
        
        if(inFlag === undefined){
            
            n_idx = n_idx + 1
            
            let node_2 = {
                id: n_idx,
                name:item[1],
                label:item[1],
                group:"User 0",
                runtime:30
            }
            nodes.push(node_2)
        }

        let s_idx,e_idx

        nodes.find((value) => {
            if(value.name === item[0]){
                s_idx = value.id
            }
            if(value.name === item[1]){
                e_idx = value.id
            }
        })
        let link = {
          source:s_idx,
          target:e_idx,
          type:item[2]
        }
        links.push(link)

      })
      this.funcGraphData['nodes'] = nodes
      this.funcGraphData['links'] = links

    console.log("函数调用数据转化完成",this.funcGraphData)

    },
    // 绘制函数调用图
    drawFunction(){
        // 保证此时数据已经拿到
        console.log("开始画图")
        console.log(this.funcGraphData.links)
        // 计算弦的弧度
        function linkArc(d) {
            const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
            return `
                M${d.source.x},${d.source.y}
                A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
            `;
        }
      function _margin(){return(
      {top: 30, right: 50, bottom: 5, left: 5}
      )}

      function _width(margin){return(
      300 - margin.left - margin.right
      )}

      function _height(margin){return(
      300 - margin.top - margin.bottom
      )}

      function ticked() {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y)
        
        node.attr("transform", d=> `translate(${d.x},${d.y})`)

         edgepaths.attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y)
      }
        //When the drag gesture starts, the targeted node is fixed to the pointer
        //The simulation is temporarily “heated” during interaction by setting the target alpha to a non-zero value.
        function dragstarted(d) {
              if (!d3.event.active) simulation.alphaTarget(0.3).restart()//sets the current target alpha to the specified number in the range [0,1].
              d.fy = d.y //fx - the node’s fixed x-position. Original is null.
              d.fx = d.x //fy - the node’s fixed y-position. Original is null.
        }

        //When the drag gesture starts, the targeted node is fixed to the pointer
        function dragged(d) {
          d.fx = d3.event.x
          d.fy = d3.event.y
        }

      function drag(simulation){
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
            
            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }
            
            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
            
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
            }

      let margin = _margin()
      let height = _height(margin)
      let width = _width(margin)

      console.log("drawFunction is called")
      console.log("margin,height,width",margin,height,width)


      // 获取div
      const svg = d3.select("#funcgraph")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

      svg.append('defs').append('marker')
        .attr("id",'arrowhead')
        .attr('viewBox','-0 -5 10 10') //the bound of the SVG viewport for the current SVG fragment. defines a coordinate system 10 wide and 10 high starting on (0,-5)
        .attr('refX',10) // x coordinate for the reference point of the marker. If circle is bigger, this need to be bigger.
        .attr('refY',0)
        .attr('orient','auto')
            .attr('markerWidth',5)
            .attr('markerHeight',5)
            .attr('xoverflow','visible')
            .attr('yoverflow','visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        

        let dataset = this.funcGraphData

        // 颜色
        let colorScale = d3.scaleOrdinal() //=d3.scaleOrdinal(d3.schemeSet2)
          .domain(["Team A"])
          .range(['#ff9e6d'])

        // 初始化边
        const link = svg.selectAll(".links")
                .data(dataset.links)
                .enter()
                .append("line")
                .attr("class", "links")
                .attr("stroke-width",3)
                .attr('marker-end','url(#arrowhead)') //The marker-end attribute defines the arrowhead or polymarker that will be drawn at the final vertex of the given shape.
           
        
        // 下面这个是，会以xx方式展示
        link.append("title")
            .text(d => d.type) 
        
        // 画边
        const edgepaths = svg.selectAll(".edgepath")
                .data(dataset.links) 
                .enter()
                .append('path')
                .attr('class','edgepath')
                .attr('fill-opacity',1)
                .attr('stroke-opacity',1)
                .attr('id', (d,i) => {return 'edgepath'+i})
                .style("pointer-events","none")

        const edgelabels = svg.selectAll(".edgelabel")
        .data(dataset.links)
        .enter()
        .append('text')
        .style("pointer-events", "none")
        .attr('class', 'edgelabel')
        .attr('id', function (d, i) {return 'edgelabel' + i})
        .attr('font-size', 13)
        .attr('fill', '#aaa')

        // 画边的标签
        edgelabels.append('textPath') //To render text along the shape of a <path>, enclose the text in a <textPath> element that has an href attribute with a reference to the <path> element.
              .attr('xlink:href', function (d, i) {return '#edgepath' + i})
              .style("text-anchor", "middle")
              .style("pointer-events", "none")
              .attr("startOffset", "50%")
              .text(d => d.type)
  
    //  Initialize the nodes 让结点能被拖拽
      const node = svg.selectAll(".nodes")
          .data(dataset.nodes)
          .enter()
          .append("g")
          .attr("class", "nodes")
         .call(drag(simulation));

      node.append("circle")
          .attr("r", d=>4)
          .style("stroke-opacity",0)
          .style("stroke-width", 1.5)
          .style("fill", d => colorScale(d.group))

        node.append("text")
            .attr("x", 8)
            .attr("y", "0.31em")
            .text(d => d.name)
            .clone(true).lower()
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 3);

      // simulation
      let simulation = d3.forceSimulation()
              .force("link", d3.forceLink() // This force provides links between nodes
                              .id(d => d.id) // This sets the node id accessor to the specified function. If not specified, will default to the index of a node.
                              .distance(120)
              ) 
              
              .force("charge", d3.forceManyBody().strength(-700)) // This adds repulsion (if it's negative) between nodes. 
              .force("center", d3.forceCenter(width / 2, height / 2))
       simulation
        .nodes(dataset.nodes)
        .on("tick", ticked)

        simulation.force("link")
                .links(dataset.links)
                      


        //drawing the legend
        const legend_g = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g") 
        .attr("transform", (d, i) => `translate(${width},${i * 20})`)

        legend_g.append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 5)
          .attr("fill", colorScale)

        legend_g.append("text")
          .attr("x", 10)
          .attr("y", 5)
          .text(d => d)
      
    },










  }
}
</script>
