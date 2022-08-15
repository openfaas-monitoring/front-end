import request from "./axiosConfig";
// 获取所有的pods列表
export const getGlobalNodes = (param) => {
	return request({
		url:'/global/nodes',
		method:'get',
		param
	})
}
