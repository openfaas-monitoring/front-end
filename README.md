# 基于openfaas的监控平台-前端
基于vue+element-ui

## Build Setup

```bash
# clone the project
git clone https://github.com/openfaas-monitoring/front-end.git

# enter the project directory
cd vue-admin

# install dependency
npm install

# develop
npm run dev
```

This will automatically open http://localhost:9528

## preview the release environment effect + static resource analysis

npm run preview -- --report

## code format check

npm run lint

## code format check and auto fix
npm run lint -- --fix
```


```

## Code Framework

- `src`
  - `api`：请求配置与请求函数
  - `views`
    - `container`：容器模块；展示函数的动态信息：cpu占用率、内存占用率和实时函数调用图。并展示函数的源代码。
    - `node`：服务器模块；展示服务器的动态信息：cpu占用率、内存占用率、磁盘读写速率和网络上传下载速率。

## Code annotation

### request

对`axios`进行二次封装，代码位于`api/axiosConfig.js`

```javascript
/* 对axios进行二次封装 */
import axios from "axios";
// 引入进度条 start 进度条开始  done进度条结束
import nprogress from "nprogress";
//引入 进度条样式
import "nprogress/nprogress.css"

//1. 利用axios对象的方法create方法去创建一个axios实例
// request就是axios,只不过稍微配置一下
const request = axios.create({
    // 基础路径：发请求的时候，路径中会带有api
    baseURL:'http://10.60.150.24:8000',
    //代表请求超时的时间为5s
    timeout:5000,
})

// 配置请求拦截器,在请求发出去之前，拦截器可以监测到，可以在请求发出之前做一些事情
 request.interceptors.request.use((config)=>{
    //config 是一个配置对象，对象里有一个属性很重要，就是header请求头
    nprogress.start();
    return config;
 })

 // 响应拦截器
 request.interceptors.response.use((res)=>{
    //响应成功的回调函数，服务器响应数据回来以后，可以做一些事情
    nprogress.done();
    return res.data;
 },(error)=>{
    //响应失败的回调函数
    return error.msg
 })

export default request;

```

### container

容器模块由四类元素构成：`el-table`、`echarts`和`d3`力导图与源代码。代码位于：`views/container/index.vue`

![image-20220829101254499](D:\university\BigData\openfaas\front-end\image-20220829101254499.png)

其中，以折线图的形式展示左侧表格中选中函数的cpu占用率与内存占用率，以有向图的形式展示函数的调用关系图。右下方为当前选中函数的源代码。

折线图的代码实现逻辑：

```javascript
initChart(){
    //初始化cpuLine和memLine
}// 初始化图表
updateSingleChart(){
    // 配置series与option
}
updateChart()//更新两个图表

startInterval(param){// 轮询方法
	getCpuMemRate(param).then(res => {

    	this.cpuData = res.cpuRate
        this.memData = res.memRate

        this.updateChart()
        
        /* 更新计时器updateST，以递归方式实现1
        s间隔的轮询方法 */ 
        this.updateST = setTimeout(() =>{
          clearTimeout(this.updateST)
          this.startInterval(param)
        },1000)
      }).catch(function (error) { 
        console.log(error)
      })
    },
}
```

函数调用图的实现引入了`d3.js`库中的力导图。轮询方法的实现机制与上文相似，函数调用图的配置如下：

- 将结点和边的数据格式调整为

  ```javascript
  nodes:[
  	id: // 结点编号
  	name: // 结点名称
  	group: // 结点运行状态："running"或"stop"
  ]
  links:[
      source: // 起始结点编号
      target: // 终止结点编号
      name: //边标签
  ]
  ```

- 力导图的绘制需要配置以下元素：

  - 功能配置项

    - `svg`
    - `marker`： 约定图中边以箭头结束，配置箭头位置与大小

  - 功能配置项：

    - `colorScale`
    - `simulation`：进行力模拟，并通过绑定`ticked`函数更新node的位置和link的起点和终点

      ```javascript
      let simulation = d3.forceSimulation()
                  .force("link", d3.forceLink() 
                                  .id(d => d.id)
                                  .distance(60)
                  ) 
                  .force("charge", d3.forceManyBody().strength(-20)) // 负值表示在结点间增加反作用力 
                  .force("center", d3.forceCenter(width / 2, height / 2))
                  .force('collide',d3.forceCollide().radius(65).iterations(2));// 避免结点互相重叠
      ```

  - 数据绑定配置项

    - `link`：绑定边数据

    - `edgepaths`：配置边路径

    - `edgelabels`：绘制边标签

    - `node`：绑定结点数据

### node

容器模块由两类元素构成：`el-table`、`echarts`。代码位于：`views/node/index.vue`。折线图的实现方法与容器模块完全相同。

![image-20220829104005074](D:\university\BigData\openfaas\front-end\image-20220829104005074.png)
