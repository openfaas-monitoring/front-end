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
      this.testFetchData("paralleltest")
 
  },
    methods: {

     testFetchData(funcName){
        // 获取函数调用图信息
      getSource(funcName).then(response =>{
        console.log("获取指定函数的内容")
        console.log(response)
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
      let that = this
      that.funcGraphData = {}
      let n_idx = 0
      let nodes = [],links=[]
      that.funcConfig.forEach((item,index) => {
        let inFlag_1 = nodes.find(value  => {
            return value.name === item[0]
        })
        if(index === 0 || inFlag_1 === undefined){
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
        let inFlag_2 = nodes.find(value  => {
            return value.name === item[1]
        })
        
        if(inFlag_2 === undefined){
            
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
      that.funcGraphData['nodes'] = nodes
      that.funcGraphData['links'] = links

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
                .attr("stroke-width",1.5)
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
               .attr("x", 0)
              .attr("y", 0)
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

    // 另一种画图的方式 - 更新
    mapFuncData_2(){
      let nodes = [],links=[]
      this.funcConfig.forEach((item,index) => {
        
        if(index === 0){

            let node_1 = {
            id: item[0],
            }
           nodes.push(node_1)
         
        }

        let inFlag = nodes.find(value  => {
            return value.name === item[1]
        })
        
        if(inFlag === undefined){
            
            let node_2 = {
                id: item[1],
            }
            nodes.push(node_2)
        }
        let link = {
          source:item[0],
          target:item[1],
          type:item[2]
        }
        links.push(link)

      })
      this.funcGraphData['nodes'] = nodes
      this.funcGraphData['links'] = links
    },

    drawFunction_2(){
        const data = this.funcGraphData
        const types = ['User 0']
        // 定义颜色
        const color = d3.scaleOrdinal(types, d3.schemeCategory10)
        // 计算弦的弧度
        function linkArc(d) {
            const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
            return `
                M${d.source.x},${d.source.y}
                A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
            `;
        }
        // 定义拖拽函数
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

        const links = data.links.map(d => Object.create(d));
        const nodes = data.nodes.map(d => Object.create(d));

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        let height = 600, width = 600
        const svg = d3.select("#funcgraph")
            .append("svg")
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .style("font", "12px sans-serif");

        // Per-type markers, as they don't inherit styles.
        svg.append("defs").selectAll("marker")
            .data(types)
            .join("marker")
            .attr("id", d => `arrow-${d}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -0.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", '#999')
            .attr("d", "M0,-5L10,0L0,5");

        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-width", 10)
            .selectAll("path")
            .data(links)
            .join("path")
            .attr("stroke", d => color(d.type))
            .attr("marker-end", d =>  `url(${new URL(`#arrow-${d.type}`, location)})`);

        const node = svg.append("g")
            .attr("fill", "currentColor")
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(drag(simulation));

        node.append("circle")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("r", 4);

        node.append("text")
            .attr("x", 8)
            .attr("y", "0.31em")
            .text(d => d.id)
            .clone(true).lower()
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 3);

        simulation.on("tick", () => {
            link.attr("d", linkArc);
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        invalidation.then(() => simulation.stop());

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

