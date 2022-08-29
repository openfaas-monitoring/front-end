# openfaas课设-前端
基于vue+element-ui

## Code Framework
- build                       构建相关  

- config                      配置相关

- src                         源代码
    - api                     所有请求
    - assets                  主题 字体等
静态资源

    - components              全局公用组件



    - filtres                 全局 filter

    - icons                   项目所有 svg icons


    - router                  路由

    - store                   全局 store管理

    - styles                  全局样式

    - utils               全局公用方法

    - views                    视图

    - App.vue                 入口页面

    - main.js                 入口 加载组件 初始化等

    - permission.js           权限管理

- static                      第三方不打包资源

    - Tinymce                 富文本

- .babelrc                   babel-loader 配置

- eslintrc.js                 eslint 配置项

- .gitignore                  git 忽略项

- favicon.ico                 favicon图标

- index.html                  html

- package.json                package.json



## Build Setup

```bash
# clone the project
git clone https:github.com/openfaas-monitoring/front-end.git

# enter the project directory
cd vue-admin

# install dependency
npm install

# develop
npm run dev
```

This will automatically open http:localhost:9528


# preview the release environment effect + static resource analysis
npm run preview -- --report

# code format check
npm run lint

# code format check and auto fix
npm run lint -- --fix
```

