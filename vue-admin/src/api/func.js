import request from "./axiosConfig";
// 获取所有的pods列表
export const getFuncList = (param) =>{
	return request({
		url:'/global/functions',
		method:'get',
		param
	})
}
export const getGlobalNodes = (param) => {
	return request({
		url:'/global/nodes',
		method:'get',
		param
	})
}
export const getLog =(param) =>{
	return request({
		url:'/logs',
		method:'get',
		param
	})
}
