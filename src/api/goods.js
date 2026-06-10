import request from '@/utils/request'

export function getGoodsList(data) {
  return request({
    url: '/mall/goods/list',
    method: 'post',
    data
  })
}

export function getGoodsDetail(id) {
  return request({
    url: `/mall/goods/${id}`,
    method: 'get'
  })
}

export function updateGoods(data) {
  return request({
    url: '/mall/goods',
    method: 'put',
    data
  })
}

export function exportGoods(data) {
  return request({
    url: '/mall/goods/export',
    method: 'post',
    data,
    responseType: 'blob'
  })
}
