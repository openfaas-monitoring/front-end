<template>


      <div id="funcgraph" style='max-width: 900px; overflow-x: auto; padding: 0px; margin: 0px;'></div>


</template>

<script>

import {getFuncList,getSource} from '@/api/func';
import * as d3 from 'd3';


export default {

    data() {
      return {
        funcConfig:null,
        funcSource:null,
        funcGraphData:{},
      }
    },
    created(){

    },
    mounted () {
      this.testFetchData("looptest")
 
  },
    methods: {

     testFetchData(funcName){
        // 获取函数调用图信息
      getSource(funcName).then(response =>{
        console.log("获取指定函数的内容")
        this.funcSource = response.source_code
        this.funcConfig = response.config
        this.mapFuncData()
        this.drawFunction()     
      })
      .catch(function (error) { // 请求失败处理
        console.log(error)
      });
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

      function _margin(){return(
      {top: 30, right: 80, bottom: 5, left: 5}
      )}

      function _width(margin){return(
      890 - margin.left - margin.right
      )}

      function _height(margin){return(
      800 - margin.top - margin.bottom
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
        .attr('refX',23) // x coordinate for the reference point of the marker. If circle is bigger, this need to be bigger.
        .attr('refY',0)
        .attr('orient','auto')
            .attr('markerWidth',13)
            .attr('markerHeight',13)
            .attr('xoverflow','visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        .style('stroke','none')

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
                .attr('fill-opacity',0)
                .attr('stroke-opacity',0)
                .attr('id', (d,i) => {return 'edgepath'+i})
                .style("pointer-events","none")

        const edgelabels = svg.selectAll(".edgelabel")
        .data(dataset.links)
        .enter()
        .append('text')
        .style("pointer-events", "none")
        .attr('class', 'edgelabel')
        .attr('id', function (d, i) {return 'edgelabel' + i})
        .attr('font-size', 20)
        .attr('fill', '#aaa')

        // 画边的标签
        edgelabels.append('textPath') //To render text along the shape of a <path>, enclose the text in a <textPath> element that has an href attribute with a reference to the <path> element.
              .attr('xlink:href', function (d, i) {return '#edgepath' + i})
              .style("text-anchor", "middle")
              .style("pointer-events", "none")
              .attr("startOffset", "50%")
              .text(d => d.type)
  
      // Initialize the nodes 让结点能被拖拽
      const node = svg.selectAll(".nodes")
          .data(dataset.nodes)
          .enter()
          .append("g")
          .attr("class", "nodes")
          .call(d3.drag() //sets the event listener for the specified typenames and returns the drag behavior.
              .on("start", dragstarted) //start - after a new pointer becomes active (on mousedown or touchstart).
              .on("drag", dragged)      //drag - after an active pointer moves (on mousemove or touchmove).
              //.on("end", dragended)     //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
          )

      node.append("circle")
          .attr("r", d=>18)
          .style("stroke-opacity",0)
          .style("stroke-width", 20)
          .style("fill", d => colorScale(d.group))

      node.append("title")
          .text(d => d.id + ": " + d.label + " - ")

      node.append("text")
          .attr("dy", 4)
          .attr("dx", -15)
          .attr("font-size",20)
          .text(d => d.name)
  
      
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

.links { 
stroke: #999; 
stroke-opacity: 0.6; 
stroke-width: 1px; 
}

text {
pointer-events: none;
fill: #000;
font: 10px sans-serif;
}

</style>

