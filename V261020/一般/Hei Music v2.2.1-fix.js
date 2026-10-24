/**
 * @name Hei Music聚合源
 * @description 聚合自公开接口 Q群516649104
 * @version v2.2.1-fix
 * @author Compile by CatXiaolan
 */
;(function() {


const { EVENT_NAMES, request, on, send } = globalThis.lx

// ========== 统计上报配置 ==========
// 上报地址以混淆字节形式存储于 _0xa3b1.report_url，由 PANEL_REPORT_URL 运行时解码获得，避免明文暴露
// 为空字符串则不上报（PANEL_REPORT_URL 定义见下方解码函数之后）

// ========== 混淆层：字符串编码/解码 ==========
// 将敏感URL和密钥以编码形式存储，运行时解码使用
var _0x4e8f = function(arr, key) {
  var result = []
  for (var i = 0; i < arr.length; i++) {
    result.push(String.fromCharCode(arr[i] ^ key.charCodeAt(i % key.length)))
  }
  return result.join('')
}

// 编码后的API URL密钥表（XOR with key "HeiMusic"）
var _0xa3b1 = {
  nianxin_kw: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x25,0x6,0x19,0x63,0x1b,0x1a,0x8,0xd,0x30,0xc,0x7,0x35,0xf,0x5d,0xa,0xc,0x25,0x4a,0x1a,0x25,0x14,0x1,0xc,0x4c,0x2b,0x0,0x1a,0x25,0x1c,0x5c,0x2,0x14,0x66,0x15,0x1,0x3d],
  gdstudio: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x25,0x10,0x1a,0x24,0x16,0x5e,0x8,0x13,0x21,0x4b,0xe,0x29,0x6,0x7,0x1c,0x7,0x21,0xa,0x47,0x35,0xc,0x9,0x46,0x2,0x38,0xc,0x47,0x3d,0x1d,0x3],
  qq_vkey: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x3d,0x11,0x47,0x34,0x5b,0x2,0x18,0x4d,0x2b,0xa,0x4,0x62,0x16,0x14,0x0,0x4e,0x2a,0xc,0x7,0x62,0x18,0x6,0x1a,0xa,0x2b,0x10,0x47,0x2b,0x16,0x14],
  qq_cdn: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x2c,0x9,0x47,0x3e,0x1,0x1,0xc,0x2,0x25,0x4b,0x18,0x3c,0x18,0x6,0x1a,0xa,0x2b,0x4b,0x18,0x3c,0x5b,0x10,0x6,0xe,0x67],
  ynx_tx: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x60,0x3,0x41,0x47,0x1a,0x3d,0x4,0xf,0x28,0x1b,0x14,0x47,0x0,0x26,0x4a,0x28,0x1d,0x3c,0x5c,0x18,0x12,0x25,0x10,0x1a,0x24,0x16,0x5d,0x19,0xb,0x38],
  ynx_tx2: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x3c,0x4,0x7,0x2a,0x5b,0x12,0x19,0xa,0x66,0x16,0x59,0x7c,0x6,0x5d,0xa,0xd,0x67,0x8,0x1c,0x3e,0x1c,0x10,0x36,0xc,0x38,0x0,0x7,0x12,0x14,0x3,0x0,0x4d,0x38,0xd,0x19],
  nianxin_wy: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x25,0x6,0x19,0x63,0x1b,0x1a,0x8,0xd,0x30,0xc,0x7,0x35,0xf,0x5d,0xa,0xc,0x25,0x4a,0x1a,0x25,0x14,0x1,0xc,0x4c,0x2b,0x0,0x1a,0x25,0x1c,0x5c,0x1e,0x1a,0x66,0x15,0x1,0x3d],
  ynx_apikey: [0x7b,0x3,0xf,0x7f,0x46,0x46,0x5b,0x50,0x2d,0x51,0x5e,0x79,0x43,0x46,0x5b,0x51,0x7c,0x4,0x5a,0x2b,0x41,0x4b,0x5c,0x54,0x71,0x4,0xa,0x2b,0x41,0x42,0xf,0x51,0x7c,0x54,0x5c,0x79,0x45,0x10,0xc,0x53,0x7c,0x7,0x5f,0x2e,0x16,0x43,0xb,0x5a,0x7c,0x54,0x5f,0x79,0x13,0x40,0x5e,0x2,0x7d,0x7,0x5f,0x7f,0x4c,0x4a,0xd,0x56],
  // v1.1.9 新增源
  nianxin_tx: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x25,0x6,0x19,0x63,0x1b,0x1a,0x8,0xd,0x30,0xc,0x7,0x35,0xf,0x5d,0xa,0xc,0x25,0x4a,0x1a,0x25,0x14,0x1,0xc,0x4c,0x2b,0x0,0x1a,0x25,0x1c,0x5c,0x1d,0x1b,0x66,0x15,0x1,0x3d],
  nianxin_kg: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x25,0x6,0x19,0x63,0x1b,0x1a,0x8,0xd,0x30,0xc,0x7,0x35,0xf,0x5d,0xa,0xc,0x25,0x4a,0x1a,0x25,0x14,0x1,0xc,0x4c,0x2b,0x0,0x1a,0x25,0x1c,0x5c,0x2,0x4,0x66,0x15,0x1,0x3d],
  // v1.3.0 新增源
  xinghai: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x31,0x1c,0x47,0x37,0x11,0x17,0x10,0x11,0x66,0x11,0x6,0x3d,0x5a,0x1f,0x11,0x4c,0x29,0x15,0x0,0x62],
  shouji_tx: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x2b,0x1c,0x8,0x3d,0x1c,0x5d,0x1d,0xc,0x38,0x4a,0x28,0x1d,0x3c,0x5c,0x18,0x12,0x17,0x8,0x1c,0x3e,0x1c,0x10,0x47,0x13,0x20,0x15,0x56,0x2c,0x5,0x1a,0x2,0x6,0x31,0x58,0x58,0x2b,0x13,0x17,0xf,0x56,0x7f,0x56,0x5a,0x2b,0x40,0x17,0x5c,0x50,0x70,0x52,0x5f,0x7d,0x10,0x45,0x5a,0x7,0x7f,0x0,0x5d,0x7b,0x17,0x12,0x58,0x54,0x7c,0x56,0x51,0x29,0x4c,0x15,0x5e,0x1,0x71,0x1,0xf,0x2e,0x44,0x4b,0xa,0x56,0x79,0x7,0xc,0x7c,0x44,0x43,0x50,0x50,0x70,0x53,0xf,0x29,0x42,0x47,0xa,0x50,0x29,0x54,0x4f,0x39,0xc,0x3,0xc,0x5e,0x22,0x16,0x6,0x23],
  // v2.1.1 新增源
  wwwweb: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x2b,0x4b,0x1e,0x3a,0x2,0x4,0xc,0x1,0x66,0x11,0x6,0x3d,0x5a,0x1e,0x1c,0x10,0x21,0x6,0x46,0x38,0x7,0x1f],
  cenguigui_wy: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x16,0x16,0x7,0x4,0x3d,0xc,0xe,0x38,0x1c,0x5d,0xa,0xd,0x67,0x4,0x19,0x24,0x5a,0x1d,0xc,0x17,0x2d,0x4,0x1a,0x28,0x5a,0x1e,0x1c,0x10,0x21,0x6,0x36,0x3b,0x44,0x5d,0x19,0xb,0x38],
  // v2.1.2 新增可用源（腾讯直链 / 咪咕搜索播放）
  vkeys_tx: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x3,0x18,0xc,0x1a,0x3b,0x4b,0xa,0x23,0x5a,0x1e,0x1c,0x10,0x21,0x6,0x46,0x39,0x10,0x1d,0xa,0x6,0x26,0x11,0x46,0x3e,0x1a,0x1d,0xe,0x4c,0x24,0xc,0x7,0x26],
  haitangw: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x25,0x10,0x1a,0x24,0x16,0x0,0xc,0x11,0x3e,0x0,0x1b,0x63,0x1d,0x12,0x0,0x17,0x29,0xb,0xe,0x3a,0x5b,0x10,0xa,0x4c,0x3e,0x54,0x46,0x20,0x0,0x0,0x0,0x0,0x67,0x17,0xc,0x3e,0x1a,0x1f,0x1f,0x6,0x65,0x10,0x1b,0x21],
  migu_search: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x19,0x63,0x0,0x5d,0x7,0x5,0x66,0x8,0x0,0x2a,0x0,0x5d,0xa,0xd,0x67,0x15,0xa,0x62,0x7,0x16,0x1a,0xc,0x3d,0x17,0xa,0x28,0x5a,0x0,0x6,0xd,0x2f,0x4a,0x1a,0x28,0x14,0x1,0xa,0xb,0x67,0x13,0x58,0x63,0x45],
  migu_listen: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x19,0x63,0x16,0x5d,0x7,0x5,0x66,0x8,0x0,0x2a,0x0,0x5d,0xa,0xd,0x67,0x28,0x20,0xa,0x20,0x3e,0x5b,0x4d,0x78,0x4a,0x1f,0x7c,0x5b,0x43,0x46,0x0,0x27,0xb,0x1d,0x28,0x1b,0x7,0x46,0x10,0x3d,0x7,0x46,0x21,0x1c,0x0,0x1d,0x6,0x26,0x36,0x6,0x23,0x12,0x5d,0xd,0xc],
  // v2.2.0 新增可用源（HYW公益 / vkeys v2 / aa.cab搜索 / oiapi咪咕 / 酷我官方mobi）
  hyw_free_api: [0x20,0x11,0x1d,0x3d,0x4f,0x5c,0x46,0x52,0x78,0x56,0x47,0x7a,0x4c,0x5d,0x58,0x5b,0x7c,0x4b,0x50,0x7a,0x5a,0x12,0x19,0xa,0x67,0x8,0x1c,0x3e,0x1c,0x10,0x46,0x16,0x3a,0x9],
  hyw_free_key: [0x7e,0x26,0x58,0xb,0x58,0x46,0x5a,0x34,0x78,0x48,0x2e,0x1f,0x3e,0x3a,0x44,0x26,0x1e,0x23,0x2e],
  vkeys_tx_v2: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x15,0x0,0x63,0x3,0x18,0xc,0x1a,0x3b,0x4b,0xa,0x23,0x5a,0x5,0x5b,0x4c,0x25,0x10,0x1a,0x24,0x16,0x5c,0x1d,0x6,0x26,0x6,0xc,0x23,0x1,0x5c,0xe,0x6,0x3c,0x10,0x1b,0x21],
  aa_cab_tx: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x29,0x4b,0x8,0x2c,0x5b,0x10,0x8,0x1,0x67,0x14,0x18,0x63,0x18,0x6,0x1a,0xa,0x2b],
  oiapi_migu: [0x20,0x11,0x1d,0x3d,0x6,0x49,0x46,0x4c,0x27,0xc,0x8,0x3d,0x1c,0x5d,0x7,0x6,0x3c,0x4a,0x8,0x3d,0x1c,0x5c,0x24,0xa,0xf,0x10,0x36,0x0,0x0,0x0,0x0,0x0],
  kw_mobi: [0x20,0x11,0x1d,0x3d,0x4f,0x5c,0x46,0xd,0x25,0xa,0xb,0x24,0x5b,0x18,0x1c,0x14,0x27,0x4b,0xa,0x23,0x5a,0x1e,0x6,0x1,0x21,0x4b,0x1a],
  // 统计上报地址（混淆存储，密钥 HeiMusic）
  report_url: [0x20,0x11,0x1d,0x3d,0x4f,0x5c,0x46,0x5b,0x66,0x54,0x5a,0x7a,0x5b,0x4b,0x50,0x4d,0x79,0x55,0x5a,0x77,0x44,0x43,0x59,0x53,0x7c,0x4a,0x1b,0x28,0x5,0x1c,0x1b,0x17,0x66,0x15,0x1,0x3d],
}

// 运行时解码URL
var _dec = function(name) {
  return _0x4e8f(_0xa3b1[name], 'HeiMusic')
}

// 上报地址（解码获得，避免明文；为空则不上报）
var PANEL_REPORT_URL = _dec('report_url')

// ========== 第二层混淆：字符串表（XOR 编码 + 索引取值） ==========
var _0x2c7a = [[29633,23524,29168],[24509,24486,58,27,60,35],[24509,24486,61,21],[62,14,12,52,6,33037,35782],[62,14,12,52,6,33037,35782,21,122],[24509,24486,34,10],[38199,38711,27934,26797],[24509,24486,30,52],[43,0,7,42,0,26,14,22,33,58,30,52],[63,18,30,58,16,17],[47,1,26,57,0,23,0,12],[25,52,38810,19997,30337,36781],[21730,21744,25717,32111],[26199,27922,38810,19997,28389],[25982,38563,32819,21573],[0,60,62,20769,30399],[41,4,71,46,20,17],[39,12,8,61,28,21721,21756],[37183,25204,4,34,23,26],[24509,24486,58,27,60,35,83,67,27396,26263,32,9,20088,23339,22337],[24509,24486,58,27,60,35,83,67,20037,25930,25448,35752,24070,21379],[24509,24486,61,21,79,83,20140,25932,25417,69,29,53],[24509,24486,61,21,79,83,27429,26257,1,33,20068,23317,22365],[24509,24486,34,10,79,83,20140,25932,25417,69,2,42],[24509,24486,34,10,79,83,27429,26257,1,33,20068,23317,22365],[47,1,26,57,0,23,0,12,114,69,20068,25954,25460,35734,24090,21395],[47,1,26,57,0,23,0,12,114,69,27429,26303,60,55,20068,23355,22368],[47,1,26,57,0,23,0,12,104,33746,21439,22908,36176],[25,52,38810,19997,30337,36781,73,20134,25959,25444,73,57,13],[25,52,38810,19997,30337,36781,83,67,27396,26263,32,9,20088,23339,22337],[25,52,38810,19997,30337,36781,83,67,26466,36785,22199,26436,25917,38029,25548],[29633,23524,29168,109,20144,25948,25448,67,60,29],[29633,23524,29168,119,85,27455,26267,42,12,20072,23345,22373],[29633,23524,29168,119,85,38784,36161,38446,32495],[29633,23524,29168,119,85,26457,36797,22205,26433,25901,38039,25576],[24509,24486,30,52,85,20150,25926,25442,104,18,16],[24509,24486,30,52,79,83,27429,26257,1,33,20068,23317,22365],[63,18,30,58,16,17,83,67,20109,25930,25448,109,2,10,70,8,63],[63,18,30,58,16,17,83,67,27396,26263,32,9,20088,23339,22337],[38199,38711,27934,26797,79,83,20068,25932,25417,35712,24090,21437],[38199,38711,27934,26797,79,83,27429,26257,1,33,20068,23317,22365],[43,0,7,42,0,26,14,22,33,58,30,52,85,20150,25926,25442,104,18,16],[43,0,7,42,0,26,14,22,33,58,30,52,79,83,27429,26257,1,33,20068,23317,22365],[62,14,12,52,6,33037,35782,89,104,20128,25926,25420,85,7,17],[62,14,12,52,6,33037,35782,89,104,27433,26267,4,49,20094,23345,22347],[21730,21744,25717,32111,79,83,20140,25932,25417,69,4,42],[21730,21744,25717,32111,79,83,32595,23666,27396,26263,21604],[21730,21744,25717,32111,79,83,26435,25117,21112,27433,26267],[21730,21744,25717,32111,79,83,26435,33748,21406,21077,10,34,27,7,12,13,60,44,13],[26199,27922,38810,19997,28389,73,73,20078,25959,25444,35724,24126,21381],[26199,27922,38810,19997,28389,73,73,27439,26298,44,45,20032,23341,22363],[25982,38563,32819,21573,79,83,20140,25932,25417,69,29,53],[25982,38563,32819,21573,79,83,27429,26257,1,33,20068,23317,22365],[25982,38563,32819,21573,79,83,26435,36791,22166,26476,25889,38067,25552],[0,60,62,20769,30399,73,73,27439,26298,44,45,20032,23341,22363],[62,14,12,52,6,33037,35782,21,122,95,73,20104,25946,25458,73,23,48],[62,14,12,52,6,33037,35782,21,122,95,73,27393,26247,58,45,20078,23312,22349],[41,4,71,46,20,17,83,67,20109,25930,25448,109,1,11],[41,4,71,46,20,17,83,67,32626,23668,27429,26303,21624],[41,4,71,46,20,17,83,67,26466,36785,22199,26436,25917,38029,25548],[39,12,8,61,28,21721,21756,89,104,20128,25926,25420,85,30,14],[39,12,8,61,28,21721,21756,89,104,32607,23672,27393,26247,21630],[39,12,8,61,28,21721,21756,89,104,26447,36797,22163,26492,25915,38039,25542],[37183,25204,4,34,23,26,83,67,20109,25930,25448,109,30,4],[37183,25204,4,34,23,26,83,67,27396,26263,32,9,20088,23339,22337],[26024,21386,30017,28381],[24347,21032,29217,26465,23943,35032,20533,30027,65348,35730,26269,26109,38790,28387],[32626,23668,27429,26303,20372,24604],[41,6,29,36,26,29,73,13,39,17,73,62,0,3,25,12,58,17],[35775,27687,36332,26043,93],[24509,24486,30,52,79,83],[63,18,30,58,16,17,83,67],[38199,38711,27934,26797,79,83],[43,0,7,42,0,26,14,22,33,58,30,52,79,83],[62,14,12,52,6,33037,35782,89,104],[21730,21744,83,109],[26199,27922,38810,19997,28389,73,73],[0,60,62,20769,30399,73,73],[62,14,12,52,6,33037,35782,21,122,95,73],[37183,25204,4,34,23,26,83,67],[25096,26476,40,29,60,28387,22318,22866,36205,95,99],[26024,21386,30017,28381,25946,25458,24090,21395,114,69],[26024,25930,25448,30409,38790,20003,24090,21395,114,69],[103,4,25,36,91,3,1,19,119,4,10,57,28,28,7,94,43,13,12,46,30,44,28,19,44,4,29,40],[56,9,8,57,19,28,27,14,117],[110,4,25,36,72],[110,22,28,46,22,22,26,16,117],[110,17,0,32,16,78],[110,16,26,40,7,44,0,7,117],[110,6,5,36,16,29,29,60,60,28,25,40,72],[110,23,12,42,28,28,7,94],[110,20,28,44,25,26,29,26,117],[110,6,5,36,16,29,29,60,33,21,84],[41,6,29,36,26,29,84,5,41,12,5,40,17],[110,23,12,60,0,22,26,23,23,12,13,112],[110,4,25,36,6,78],[110,4,29,57,16,30,25,23,23,6,6,56,27,7,84],[32,17,29,61,6,73,70,76,41,21,0,99,28,3,0,5,49,75,6,63,18,76,15,12,58,8,8,57,72,25,26,12,38],[37,16,26,36,22,38,27,15],[35,2],[60,29],[37,2],[63,28],[35,18]]
var _0x8d40 = {}
var _g = function(i) {
  if (_0x8d40[i] === undefined) _0x8d40[i] = _0x4e8f(_0x2c7a[i], 'HeiMusic')
  return _0x8d40[i]
}

// 安全日志封装：移动版引擎宿主 API 极少，console 可能不存在，
// 直接使用 console.log 在初始化/请求阶段抛错会导致脚本初始化失败或请求异常
var _0x6b0f = function() {
  try {
    if (typeof console !== 'undefined' && console.log) console.log.apply(console, arguments)
  } catch (e) {}
}
var _0x6b0e = function() {
  try {
    if (typeof console !== 'undefined' && console.error) console.error.apply(console, arguments)
  } catch (e) {}
}

const _0x6a02 = (url, options) => {
  let abortFn = null
  const p = new Promise((resolve, reject) => {
    try {
      const opts = options || {}
      // 默认超时：竞速超时或调用方超时后，底层请求会在限期内自动终止，避免悬挂连接
      if (!opts.timeout) opts.timeout = 5000
      abortFn = request(url, opts, (err, resp) => {
        if (err) return reject(err)
        resolve(resp.body)
      })
    } catch (e) {
      reject(e)
    }
  })
  // 暴露中止能力，供竞速超时时取消底层请求
  p.abort = () => { try { if (typeof abortFn === 'function') abortFn() } catch (e) {} }
  return p
}

// 带响应头的请求封装：部分接口（如咪咕 listenSong）通过 302 返回真实直链，
// 需读取 Location 头才能拿到可播放地址
const _0x6a01 = (url, options) => {
  let abortFn = null
  const p = new Promise((resolve, reject) => {
    try {
      const opts = options || {}
      if (!opts.timeout) opts.timeout = 5000
      abortFn = request(url, opts, (err, resp) => {
        if (err) return reject(err)
        resolve({
          body: resp && resp.body,
          headers: (resp && resp.headers) || {},
          statusCode: resp && resp.statusCode,
        })
      })
    } catch (e) {
      reject(e)
    }
  })
  p.abort = () => { try { if (typeof abortFn === 'function') abortFn() } catch (e) {} }
  return p
}

// 带超时的请求封装，避免慢速API阻塞并发竞速
// 超时优先中止底层 HTTP 请求（若封装链暴露了 abort），减少悬挂连接与无效上报
const _0x6a03 = function(promise, ms) {
  var timer = null
  var timeout = new Promise(function(_, reject) {
    timer = setTimeout(function() {
      try {
        if (promise && typeof promise.abort === 'function') promise.abort()
      } catch (e) {}
      reject(new Error(_g(69) + ms + 'ms)'))
    }, ms)
  })
  return Promise.race([promise, timeout]).then(function(v) {
    clearTimeout(timer)
    return v
  }, function(e) {
    clearTimeout(timer)
    throw e
  })
}

const _0x6a04 = function(url) {
  if (!url || typeof url !== 'string') return false
  if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) return false
  if (url.indexOf('panspace.kuwo.cn') !== -1) return false
  return true
}

// 统计上报：异步发送调用数据到控制面板，不阻塞主流程
// 使用随机生成的用户ID区分用户，代替IP识别
var _cachedClientIp = ''
var _userId = ''
var _clientType = ''

// 检测客户端类型（轻量 UA 嗅探，兼容无 navigator 的环境）
var _0x6b07 = function() {
  try {
    var ua = (globalThis && globalThis.navigator && globalThis.navigator.userAgent) || ''
    if (/android/i.test(ua)) _clientType = 'Android'
    else if (/iphone|ipad|ios/i.test(ua)) _clientType = 'iOS'
    else if (/windows/i.test(ua)) _clientType = 'Windows'
    else if (/macintosh|mac os/i.test(ua)) _clientType = 'macOS'
    else if (/linux/i.test(ua)) _clientType = 'Linux'
  } catch(e) {}
}

var _0x6b06 = function() {
  // 生成随机用户ID（格式: U + 12位随机十六进制）
  var chars = '0123456789abcdef'
  var id = 'U'
  for (var i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * 16)]
  }
  _userId = id
}

var _0x6b08 = function() {
  if (_cachedClientIp) return
  _0x6a02(_g(97), { method: 'GET', timeout: 3000 }).then(function(body) {
    if (body && body.ip) {
      _cachedClientIp = body.ip
    }
  }).catch(function() {})
}

var _0x6b04 = function(platform, apiName, success, responseTime, quality) {
  if (!PANEL_REPORT_URL) return
  try {
    var q = String(quality || '')
    var body = _g(84) + encodeURIComponent(platform)
      + _g(85) + encodeURIComponent(apiName)
      + _g(86) + (success ? 1 : 0)
      + _g(87) + encodeURIComponent(String(responseTime))
      + _g(88) + encodeURIComponent(_userId)
      + _g(89) + encodeURIComponent(_clientType)
      + _g(90)
    if (q !== '') body += _g(91) + encodeURIComponent(q)
    if (_cachedClientIp) body += _g(92) + encodeURIComponent(_cachedClientIp)
    request(PANEL_REPORT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }, function() {})
  } catch(e) {}
}

// 失效播放聚合上报：整首歌曲所有接口均失败时触发一次，按 request_id 去重合并
var _0x6b05 = function(platform, quality, candidates) {
  if (!PANEL_REPORT_URL) return
  try {
    var _0x6b10 = []
    for (var i = 0; i < candidates.length; i++) _0x6b10.push(candidates[i].name)
    var reqId = 'R' + Math.random().toString(16).substring(2, 10) + Date.now().toString(16)
    var body = _g(93)
      + _g(94) + encodeURIComponent(reqId)
      + '&platform=' + encodeURIComponent(platform)
      + _g(88) + encodeURIComponent(_userId)
      + _g(91) + encodeURIComponent(String(quality || ''))
      + _g(95) + encodeURIComponent(JSON.stringify(_0x6b10))
      + _g(96) + candidates.length
    if (_cachedClientIp) body += _g(92) + encodeURIComponent(_cachedClientIp)
    request(PANEL_REPORT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }, function() {})
  } catch(e) {}
}

const _0x6a05 = function(musicInfo) {
  return musicInfo.hash || musicInfo.songmid || musicInfo.songId || musicInfo.id || musicInfo.rid || musicInfo.musicId || musicInfo.copyrightId || musicInfo.songid
}

const _0x6a06 = function(platform, musicInfo) {
  if (platform === _g(99)) return musicInfo.hash || musicInfo.songmid || musicInfo.id || musicInfo.rid || musicInfo.mid
  if (platform === _g(100)) return musicInfo.songmid || musicInfo.strMediaMid || musicInfo.mediaId || musicInfo.id
  if (platform === _g(101)) return musicInfo.copyrightId || musicInfo.songId || musicInfo.id || musicInfo.songmid
  return musicInfo.songmid || musicInfo.id || musicInfo.songId || musicInfo.rid || musicInfo.hash
}

const _0x6a07 = function(quality) {
  var q = String(quality || '128k').toLowerCase()
  if (q === 'jymaster' || q === 'jyeffect' || q === 'sky' || q === 'dolby' || q === 'atmos' || q === 'atmos_plus' || q === 'master') return 'lossless'
  if (q === 'flac' || q === 'flac24bit') return 'lossless'
  if (q === '320k' || q === '192k') return 'exhigh'
  return 'standard'
}

const _0x6a08 = function(musicInfo) {
  var name = musicInfo.name || musicInfo.songName || ''
  var singer = musicInfo.singer || musicInfo.artist || ''
  if (name && singer) return name + ' ' + singer
  return name
}

// ========== API 源获取函数 ==========

// 念心SVIP - kw (从混淆代码提取的真实URL)
var _0x6d01 = {
  [_g(103)]: _dec('nianxin_kw') + '?id={id}&level={level}&type=mp3',
}
const _0x6c02 = function(source, musicInfo, quality) {
  var songId = _0x6a06(source, musicInfo)
  if (!songId) return Promise.reject(new Error(_g(19)))
  var template = _0x6d01[source]
  if (!template) return Promise.reject(new Error(_g(20)))
  var level = _0x6a07(quality)
  var url = template.replace('{id}', encodeURIComponent(String(songId))).replace('{level}', encodeURIComponent(level))
  return Promise.resolve(url)
}

// 念心TX接口 - tx (mcp.nianxinxz.com/share/ceshi/tx.php，返回302直链)
var NIANXIN_TX_URL = _dec('nianxin_tx')
var _0x6c03 = function(source, musicInfo, quality) {
  if (source !== _g(100)) return Promise.reject(new Error(_g(21)))
  var songId = _0x6a06('tx', musicInfo)
  if (!songId) return Promise.reject(new Error(_g(22)))
  var level = _0x6a07(quality)
  // 该接口通过302重定向返回音频直链，直接返回接口地址交由播放器跟随跳转
  return Promise.resolve(NIANXIN_TX_URL + '?id=' + encodeURIComponent(String(songId)) + '&level=' + level + '&type=mp3')
}

// 念心KG接口 - kg (mcp.nianxinxz.com/share/ceshi/kg.php，返回302直链)
var NIANXIN_KG_URL = _dec('nianxin_kg')
var _0x6c06 = function(source, musicInfo, quality) {
  if (source !== _g(99)) return Promise.reject(new Error(_g(23)))
  var songId = _0x6a06('kg', musicInfo)
  if (!songId) return Promise.reject(new Error(_g(24)))
  var level = _0x6a07(quality)
  return Promise.resolve(NIANXIN_KG_URL + '?id=' + encodeURIComponent(String(songId)) + '&level=' + level + '&type=mp3')
}

// gdstudio - 多平台支持 (wy/tx/kg/kw/mg)
var GDSTUDIO_SOURCE_MAP = { 'wy': 'netease', 'tx': 'qq', 'kg': 'kugou', 'kw': 'kuwo', 'mg': 'migu' }
const _0x6c0b = function(source, musicInfo, quality) {
  var gdSource = GDSTUDIO_SOURCE_MAP[source]
  if (!gdSource) return Promise.reject(new Error(_g(25)))
  var songId = source === _g(102) ? _0x6a05(musicInfo) : _0x6a06(source, musicInfo)
  if (!songId) return Promise.reject(new Error(_g(26)))
  var brMap = { '128k': '128', '320k': '320', 'flac': '740', 'flac24bit': '999', 'jyeffect': '999', 'sky': '999', 'jymaster': '999', 'dolby': '999', 'atmos': '999', 'atmos_plus': '999', 'master': '999' }
  var br = brMap[quality] || '320'
  return _0x6a02(_dec('gdstudio') + '?types=url&source=' + gdSource + '&id=' + encodeURIComponent(String(songId)) + '&br=' + br, {
    method: 'GET',
  }).then(function(body) {
    if (body && body.url && _0x6a04(body.url)) return body.url
    throw new Error(_g(27))
  })
}

// QQ音乐直连vkey - tx (直接调用QQ音乐官方vkey接口，响应最快~0.13s)
// 支持dolby全景声音质
var QQ_VKEY_URL = _dec('qq_vkey')
var QQ_CDN_URL = _dec('qq_cdn')
var QQ_VKEY_GUID = '10000'

var _qqVkeyRequest = function(filename, songmid) {
  var payload = {
    comm: { ct: 19, cv: 0, guid: QQ_VKEY_GUID, tmeAppID: 'qqmusic', qq: '0' },
    hot: {
      method: 'CgiGetHotVkey',
      module: 'music.vkey.GetEVkey',
      param: { filename: [filename], songmid: [String(songmid)] }
    }
  }
  return _0x6a02(QQ_VKEY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).then(function(body) {
    if (body && body.code === 0 && body.hot && body.hot.code === 0 &&
        body.hot.data && body.hot.data.urls && body.hot.data.urls.length > 0) {
      var purl = body.hot.data.urls[0].purl
      if (purl) {
        var fullUrl = QQ_CDN_URL + purl
        if (_0x6a04(fullUrl)) return fullUrl
      }
    }
    return null
  })
}

var _0x6c0c = function(source, musicInfo, quality) {
  if (source !== _g(100)) return Promise.reject(new Error(_g(28)))
  var songmid = musicInfo.songmid || musicInfo.strMediaMid || musicInfo.id || ''
  var mediaMid = musicInfo.strMediaMid || songmid
  if (!songmid) return Promise.reject(new Error(_g(29)))
  // 音质格式映射，按优先级尝试
  // QQ音乐CDN前缀: C400=128k, M800=320k, F000=FLAC, D000=HiRes, Q000=全景声, A000=臻品母带
  var formatMap = {
    '128k': [{ prefix: 'C400', ext: 'm4a' }],
    '320k': [{ prefix: 'M800', ext: 'mp3' }, { prefix: 'C400', ext: 'm4a' }],
    'flac': [{ prefix: 'F000', ext: 'flac' }, { prefix: 'M800', ext: 'mp3' }],
    'flac24bit': [{ prefix: 'D000', ext: 'flac' }, { prefix: 'F000', ext: 'flac' }, { prefix: 'M800', ext: 'mp3' }],
    'dolby': [{ prefix: 'Q000', ext: 'm4a' }, { prefix: 'F000', ext: 'flac' }, { prefix: 'M800', ext: 'mp3' }],
    'atmos': [{ prefix: 'Q000', ext: 'm4a' }, { prefix: 'F000', ext: 'flac' }, { prefix: 'M800', ext: 'mp3' }],
    'atmos_plus': [{ prefix: 'Q000', ext: 'm4a' }, { prefix: 'F000', ext: 'flac' }, { prefix: 'M800', ext: 'mp3' }],
    'master': [{ prefix: 'A000', ext: 'flac' }, { prefix: 'F000', ext: 'flac' }, { prefix: 'M800', ext: 'mp3' }]
  }
  var formats = formatMap[quality] || formatMap['320k']
  // 依次尝试不同格式，第一个成功即返回
  var tryFormat = function(index) {
    if (index >= formats.length) {
      return Promise.reject(new Error(_g(30)))
    }
    var fmt = formats[index]
    var filename = fmt.prefix + mediaMid + '.' + fmt.ext
    return _qqVkeyRequest(filename, songmid).then(function(url) {
      if (url) return url
      return tryFormat(index + 1)
    })
  }
  return tryFormat(0)
}

// 玉宁熙tx主接口 - tx (api-v2.yuafeng.cn, 带APIKEY)
var YNX_TX_URL = _dec('ynx_tx')
var YNX_TX2_URL = _dec('ynx_tx2')
var YNX_APIKEY = _dec('ynx_apikey')

// 校验玉宁熙返回的URL是否匹配请求的音质，避免音质降级
var _checkYnxQuality = function(quality, url) {
  if (!url) return false
  var q = String(quality || '128k').toLowerCase()
  // 128k 不降级检查
  if (q === '128k') return true
  // 320k 不应返回 C400（128k m4a）
  if (q === '320k' || q === '192k') {
    return url.indexOf('C400') === -1
  }
  // 无损/全景声应包含 flac 或高品质标识，避免 C400
  if (q === 'flac' || q === 'flac24bit' || q === 'dolby') {
    return url.indexOf('C400') === -1
  }
  return true
}

var _0x6c01 = function(source, musicInfo, quality) {
  if (source !== _g(100)) return Promise.reject(new Error(_g(31)))
  var songmid = _0x6a06('tx', musicInfo)
  if (!songmid) return Promise.reject(new Error(_g(32)))
  // 音质映射为中文type参数
  // 臻品母带=master, 臻品全景声=atmos/dolby, SQ无损=flac, HQ高品质=320k, 低品质=128k
  var typeMap = { '128k': '低品质', '320k': 'HQ高品质', 'flac': 'SQ无损', 'flac24bit': '臻品全景声', 'dolby': '臻品全景声', 'atmos': '臻品全景声', 'atmos_plus': '臻品全景声', 'master': '臻品母带' }
  var type = encodeURIComponent(typeMap[quality] || 'HQ高品质')
  // 主接口: api-v2.yuafeng.cn
  return _0x6a02(YNX_TX_URL + '?type=' + type + '&mid=' + encodeURIComponent(String(songmid)) + '&apikey=' + YNX_APIKEY, {
    method: 'GET',
  }).then(function(body) {
    if (body && body.code === 0 && body.data && body.data.music) {
      var musicUrl = body.data.music
      if (_0x6a04(musicUrl)) {
        if (_checkYnxQuality(quality, musicUrl)) return musicUrl
        throw new Error(_g(33))
      }
    }
    // 主接口失败，尝试次接口
    return _0x6a02(YNX_TX2_URL + '?mid=' + encodeURIComponent(String(songmid)), {
      method: 'GET',
    }).then(function(body2) {
      if (body2) {
        // 按音质依次尝试字段
        var fields = ['song_play_url_hq', 'song_play_url_standard', 'song_play_url']
        if (quality === 'flac' || quality === 'flac24bit') {
          fields = ['song_play_url_pq', 'song_play_url_sq', 'song_play_url_hq', 'song_play_url_standard', 'song_play_url']
        } else if (quality === '128k') {
          fields = ['song_play_url_standard', 'song_play_url', 'song_play_url_fq']
        }
        for (var i = 0; i < fields.length; i++) {
          var url = body2[fields[i]]
          if (url && _0x6a04(url)) {
            if (_checkYnxQuality(quality, url)) return url
          }
        }
      }
      throw new Error(_g(34))
    })
  })
}

// 念心wy接口 - wy (mcp.nianxinxz.com/share/ceshi/wy.php)
var NIANXIN_WY_URL = _dec('nianxin_wy')

var _0x6c08 = function(source, musicInfo, quality) {
  if (source !== _g(102)) return Promise.reject(new Error(_g(35)))
  var songId = musicInfo.songId || musicInfo.musicId || musicInfo.id || ''
  if (!songId) return Promise.reject(new Error(_g(36)))
  var levelMap = { '128k': 'standard', '320k': 'exhigh', 'flac': 'lossless', 'flac24bit': 'hires', 'jyeffect': 'jyeffect', 'sky': 'sky', 'jymaster': 'jymaster', 'dolby': 'dolby', 'atmos': 'dolby', 'atmos_plus': 'dolby', 'master': 'jymaster' }
  var level = levelMap[quality] || 'exhigh'
  return _0x6a02(NIANXIN_WY_URL + '?id=' + encodeURIComponent(String(songId)) + '&level=' + level, {
    method: 'GET',
  }).then(function(body) {
    if (body && body.code === 200 && body.url && _0x6a04(body.url)) return body.url.trim()
    throw new Error(_g(70) + (body && body.msg ? body.msg : '未返回有效链接'))
  })
}

// wwwweb - wy/kw (c.wwwweb.top/music/url，POST JSON，返回真实直链)
var WWWWEB_URL = _dec('wwwweb')
var _0x6c0a = function(source, musicInfo, quality) {
  if (source !== _g(102) && source !== _g(103)) return Promise.reject(new Error(_g(37)))
  var songId = _0x6a06(source, musicInfo)
  if (!songId) return Promise.reject(new Error(_g(38)))
  return _0x6a02(WWWWEB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'lx-music-request/2.9.0' },
    body: JSON.stringify({ source: source, musicId: String(songId), quality: quality || '320k' }),
    timeout: 6000,
  }).then(function(body) {
    if (body && body.code === 200 && body.url && _0x6a04(body.url)) return body.url
    throw new Error(_g(71) + (body && body.message ? body.message : '未返回有效链接'))
  })
}

// 长青海棠 - kw/kg/tx/wy (musicserver.haitangw.cc/v1/music/resolve-url，POST JSON，返回真实直链)
var HAITANGW_URL = _dec('haitangw')
var HAITANGW_SOURCE_MAP = { kw: 'kw', kg: 'kg', tx: 'tx', wy: 'wy' }
var _0x6c07 = function(source, musicInfo, quality) {
  var hwSource = HAITANGW_SOURCE_MAP[source]
  if (!hwSource) return Promise.reject(new Error(_g(39)))
  var songId = _0x6a06(source, musicInfo)
  if (!songId) return Promise.reject(new Error(_g(40)))
  var level = _0x6a07(quality)
  return _0x6a02(HAITANGW_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    body: JSON.stringify({ source: hwSource, rid: String(songId), level: level }),
    timeout: 6000,
  }).then(function(body) {
    if (body && body.code === 0 && body.data && body.data.url && _0x6a04(body.data.url)) return body.data.url
    throw new Error(_g(72) + (body && (body.message || body.msg) ? (body.message || body.msg) : '未返回有效链接'))
  })
}

// cenguigui_wy - wy (api.cenguigui.cn/api/netease/music_v1.php，返回 data.url)
var CENGUIGUI_WY_URL = _dec('cenguigui_wy')
var _0x6c09 = function(source, musicInfo, quality) {
  if (source !== _g(102)) return Promise.reject(new Error(_g(41)))
  var songId = _0x6a06('wy', musicInfo)
  if (!songId) return Promise.reject(new Error(_g(42)))
  var levelMap = { '128k': 'standard', '320k': 'exhigh', 'flac': 'lossless', 'flac24bit': 'hires', 'jyeffect': 'jyeffect', 'sky': 'sky', 'jymaster': 'jymaster', 'dolby': 'dolby', 'atmos': 'dolby', 'atmos_plus': 'dolby', 'master': 'jymaster' }
  var level = levelMap[quality] || 'exhigh'
  return _0x6a02(CENGUIGUI_WY_URL + '?id=' + encodeURIComponent(String(songId)) + '&type=json&level=' + level, {
    method: 'GET',
    timeout: 6000,
  }).then(function(body) {
    var u = body && body.data && body.data.url
    if (_0x6a04(u)) return u
    if (body && body.url && _0x6a04(body.url)) return body.url
    throw new Error(_g(73) + (body && body.msg ? body.msg : '未返回有效链接'))
  })
}

// ========== vkeys 腾讯直链 - tx ==========
// GET /music/tencent/song/link?mid=<songmid> 直接返回腾讯官方可播放直链（多为FLAC）
var VKEYS_TX_URL = _dec('vkeys_tx')
var _0x6c04 = function(source, musicInfo, quality) {
  if (source !== _g(100)) return Promise.reject(new Error(_g(43)))
  var songId = _0x6a06('tx', musicInfo)
  if (!songId) return Promise.reject(new Error(_g(44)))
  return _0x6a02(VKEYS_TX_URL + '?mid=' + encodeURIComponent(String(songId)), {
    method: 'GET',
    timeout: 6000,
  }).then(function(body) {
    var u = body && body.data && (body.data.url || body.data.link)
    if (u && _0x6a04(u)) return u
    if (body && body.url && _0x6a04(body.url)) return body.url
    throw new Error(_g(74) + (body && body.message ? body.message : '未返回有效链接'))
  })
}

// ========== 咪咕搜索播放 - mg ==========
// 音乐软件传入的咪咕ID多为copyrightId，需先经搜索接口换取18位contentId，
// 再调用 listenSong.do（该接口302重定向到咪咕官方音频直链，免费曲目可用）
var MIGU_SEARCH_URL = _dec('migu_search')
var MIGU_LISTEN_URL = _dec('migu_listen')

var _isContentId = function(id) {
  return /^\d{18}$/.test(String(id || ''))
}

var _0x6c0d = function(source, musicInfo, quality) {
  if (source !== _g(101)) return Promise.reject(new Error(_g(45)))
  var toneMap = { '128k': 'PQ', '320k': 'HQ', 'flac': 'SQ', 'flac24bit': 'ZQ', 'atmos': 'ZQ', 'atmos_plus': 'ZQ', 'master': 'ZQ' }
  var toneFlag = toneMap[quality] || 'HQ'
  var rawId = _0x6a06('mg', musicInfo)

  var buildListen = function(contentId, copyrightId) {
    var u = MIGU_LISTEN_URL + '?toneFlag=' + toneFlag + '&contentId=' + encodeURIComponent(String(contentId))
    if (copyrightId) u += '&copyrightId=' + encodeURIComponent(String(copyrightId))
    return u + '&netType=01&resourceType=2&formatType=' + toneFlag + '&channel=014000D'
  }

  // 调用 listenSong.do：免费曲目返回 302 直链（读取 Location），VIP 曲目返回 JSON 提示
  var resolveListen = function(contentId, copyrightId) {
    var listenUrl = buildListen(contentId, copyrightId)
    return _0x6a01(listenUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Referer': 'https://app.c.nf.migu.cn/',
      },
      timeout: 6000,
    }).then(function(resp) {
      var h = resp.headers || {}
      var loc = h.location || h.Location
      if (loc && _0x6a04(loc)) return loc
      var body = resp.body
      if (body && body.data && body.data.url && _0x6a04(body.data.url)) return body.data.url
      if (body && body.url && _0x6a04(body.url)) return body.url
      // JSON 响应说明无试听地址（多为 VIP 曲目）；否则视为已重定向到音频，直接返回接口地址
      if (body && typeof body === 'object' && (body.info || body.msg || body.code)) {
        throw new Error(_g(75) + (body.info || body.msg || '无试听地址'))
      }
      return listenUrl
    })
  }

  // 同时拿到18位contentId与独立copyrightId时可直接解析；否则走搜索补齐参数
  var rawCrid = musicInfo.copyrightId ? String(musicInfo.copyrightId) : ''
  if (_isContentId(rawId) && rawCrid && !_isContentId(rawCrid)) {
    return resolveListen(rawId, rawCrid)
  }

  var keyword = _0x6a08(musicInfo)
  if (!keyword) return Promise.reject(new Error(_g(46)))
  return _0x6a02(MIGU_SEARCH_URL + '?keyword=' + encodeURIComponent(keyword) + '&pageNo=1&pageSize=5', {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
      'Referer': 'https://music.migu.cn/',
    },
    timeout: 6000,
  }).then(function(body) {
    var list = body && body.data
    if (!list || !list.length) throw new Error(_g(47))
    // 优先匹配同名同歌手，其次同名，最后取第一条
    var picked = null
    var wantName = String(musicInfo.name || musicInfo.songName || '')
    var wantSinger = String(musicInfo.singer || musicInfo.artist || '')
    for (var i = 0; i < list.length; i++) {
      var sameName = !wantName || String(list[i].songName || '') === wantName
      var sameSinger = !wantSinger || String(list[i].singer || '').indexOf(wantSinger) !== -1
      if (sameName && sameSinger) { picked = list[i]; break }
      if (!picked && sameName) picked = list[i]
    }
    if (!picked) picked = list[0]
    var contentId = picked.contentId || picked.songId || ''
    if (!contentId) throw new Error(_g(48))
    return resolveListen(contentId, picked.copyrightId || '')
  })
}

// ========== 星海音乐源后端 - 多平台支持 (tx/kg/kw/wy/mg) ==========
// 使用 yy.zddyr.top 后端，支持全平台高品质音源
var XINGHAI_SOURCE_MAP = { 'tx': 'qq', 'kg': 'kg', 'kw': 'kw', 'wy': 'netease', 'mg': 'migu' }
var XINGHAI_URL = _dec('xinghai')

var _0x6c0e = function(source, musicInfo, quality) {
  var xhSource = XINGHAI_SOURCE_MAP[source]
  if (!xhSource) return Promise.reject(new Error(_g(49)))
  var songId = source === _g(99) ? (musicInfo.hash || musicInfo.songmid || musicInfo.id || '') : _0x6a06(source, musicInfo)
  if (!songId) return Promise.reject(new Error(_g(50)))
  var params = 'source=' + encodeURIComponent(xhSource) + '&songmid=' + encodeURIComponent(String(songId)) + _g(91) + encodeURIComponent(quality || '320k')
  // 酷狗额外参数
  if (source === _g(99)) {
    if (musicInfo.hash) params += '&hash=' + encodeURIComponent(String(musicInfo.hash))
    if (musicInfo.albumId) params += '&albumId=' + encodeURIComponent(String(musicInfo.albumId))
  }
  // 网易云额外参数
  if (source === _g(102)) {
    if (musicInfo.name) params += '&name=' + encodeURIComponent(String(musicInfo.name))
    if (musicInfo.singer) params += '&singer=' + encodeURIComponent(String(musicInfo.singer))
  }
  return _0x6a02(XINGHAI_URL + '?' + params, { method: 'GET', timeout: 8000 }).then(function(body) {
    if (body && body.code === 200 && body.url && _0x6a04(body.url)) return body.url
    throw new Error(_g(76) + (body && body.msg ? body.msg : '获取失败'))
  })
}

// ========== 收集の聚合接口 (tx) ==========
var SHOUJI_TX_URL = _dec('shouji_tx')

var _0x6c0f = function(source, musicInfo, quality) {
  if (source !== _g(100)) return Promise.reject(new Error(_g(51)))
  var songmid = _0x6a06('tx', musicInfo) || _0x6a05(musicInfo)
  if (!songmid) return Promise.reject(new Error(_g(52)))
  return _0x6a02(SHOUJI_TX_URL + '&mid=' + encodeURIComponent(String(songmid)), {
    method: 'GET',
    timeout: 5000,
  }).then(function(body) {
    var u = body && (body.url || (body.data && body.data.url)) || ''
    if (_0x6a04(u)) return u
    throw new Error(_g(53))
  })
}
// ========== v2.2.0 新增可用源 ==========

// HYW公益 - 全平台 (103.79.184.97 卡密鉴权，query 携带 key + X-Card-Key 头)
var HYW_FREE_API = _dec('hyw_free_api')
var HYW_FREE_KEY = _dec('hyw_free_key')

var _0x6c10 = function(source, musicInfo, quality) {
  var songId = _0x6a06(source, musicInfo)
  if (!songId) return Promise.reject(new Error(_g(54)))
  // 该接口各平台仅开放 128k/320k/flac/flac24bit，其余音质映射到最接近档位
  var qMap = { '128k': '128k', '192k': '320k', '320k': '320k', 'flac': 'flac', 'flac24bit': 'flac24bit', 'hires': 'flac24bit', 'jyeffect': 'flac24bit', 'sky': 'flac24bit', 'dolby': 'flac24bit', 'atmos': 'flac24bit', 'atmos_plus': 'flac24bit', 'jymaster': 'flac24bit', 'master': 'flac24bit' }
  var q = qMap[quality] || '320k'
  return _0x6a02(HYW_FREE_API + '?source=' + encodeURIComponent(source) + '&songId=' + encodeURIComponent(String(songId)) + _g(91) + encodeURIComponent(q) + '&key=' + encodeURIComponent(HYW_FREE_KEY), {
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0', 'X-Card-Key': HYW_FREE_KEY },
    timeout: 5000,
  }).then(function(body) {
    var u = body && (body.url || (body.data && body.data.url)) || ''
    if (u && _0x6a04(u)) return u
    throw new Error(_g(77) + ((body && (body.msg || body.message)) || '获取失败'))
  })
}

// vkeys腾讯v2 - tx (api.vkeys.cn/v2/music/tencent/geturl?mid=&quality=)
var VKEYS_V2_URL = _dec('vkeys_tx_v2')

var _0x6c05 = function(source, musicInfo, quality) {
  if (source !== _g(100)) return Promise.reject(new Error(_g(55)))
  var songmid = _0x6a06('tx', musicInfo)
  if (!songmid) return Promise.reject(new Error(_g(56)))
  var qMap = { '128k': '6', '192k': '7', '320k': '8', 'flac': '10', 'flac24bit': '11', 'hires': '11', 'jyeffect': '11', 'sky': '13', 'dolby': '13', 'atmos': '13', 'atmos_plus': '13', 'jymaster': '14', 'master': '14' }
  var qc = qMap[quality] || '8'
  return _0x6a02(VKEYS_V2_URL + '?mid=' + encodeURIComponent(String(songmid)) + _g(91) + qc, {
    method: 'GET',
    timeout: 6000,
  }).then(function(body) {
    var u = body && body.data && (body.data.url || body.data.link)
    if (u && _0x6a04(u)) return u
    throw new Error(_g(78) + ((body && (body.message || body.msg)) || '未返回有效链接'))
  })
}

// aa.cab - tx 搜索式取链 (a.aa.cab/qq.music?msg=&n=1&type=)
var AACAB_TX_URL = _dec('aa_cab_tx')

var _0x6c11 = function(source, musicInfo, quality) {
  if (source !== _g(100)) return Promise.reject(new Error(_g(57)))
  var keyword = _0x6a08(musicInfo)
  if (!keyword) return Promise.reject(new Error(_g(58)))
  // type: 0=M500(128k) 1=M800(320k) 4=F000(FLAC) 5=母带
  var tMap = { '128k': '0', '192k': '1', '320k': '1', 'flac': '4', 'flac24bit': '4', 'hires': '4', 'jyeffect': '4', 'sky': '5', 'dolby': '5', 'atmos': '5', 'atmos_plus': '5', 'jymaster': '5', 'master': '5' }
  var t = tMap[quality] || '1'
  return _0x6a02(AACAB_TX_URL + '?msg=' + encodeURIComponent(keyword) + '&n=1&type=' + t, {
    method: 'GET',
    timeout: 6000,
  }).then(function(body) {
    if (body) {
      var u = (body.data && (body.data.music || body.data.url)) || body.playUrl || body.url
      if (u && _0x6a04(u)) return u
    }
    throw new Error(_g(59))
  })
}

// oiapi咪咕 - mg 搜索式取链 (oiapi.net/api/MiGu_Music?msg=&br=&n=)
var OIAPI_MIGU_URL = _dec('oiapi_migu')

var _0x6c12 = function(source, musicInfo, quality) {
  if (source !== _g(101)) return Promise.reject(new Error(_g(60)))
  var keyword = _0x6a08(musicInfo)
  if (!keyword) return Promise.reject(new Error(_g(61)))
  var brMap = { '128k': 'LQ', '192k': 'HQ', '320k': 'HQ', 'flac': 'SQ', 'flac24bit': 'SQ', 'hires': 'SQ', 'jyeffect': 'SQ', 'sky': 'SQ', 'dolby': 'SQ', 'atmos': 'SQ', 'atmos_plus': 'SQ', 'jymaster': 'SQ', 'master': 'SQ' }
  var br = brMap[quality] || 'HQ'
  return _0x6a02(OIAPI_MIGU_URL + '?msg=' + encodeURIComponent(keyword) + '&br=' + br + '&n=1', {
    method: 'GET',
    timeout: 6000,
  }).then(function(body) {
    var u = body && ((body.data && body.data.url) || body.url)
    if (u && _0x6a04(u)) return u
    throw new Error(_g(62))
  })
}

// 酷我官方mobi - kw (nmobi.kuwo.cn 官方接口，响应最快~0.1s)
var _0x6d02 = _dec('kw_mobi')

var _0x6c13 = function(source, musicInfo, quality) {
  if (source !== _g(103)) return Promise.reject(new Error(_g(63)))
  var rid = _0x6a06('kw', musicInfo)
  if (!rid) return Promise.reject(new Error(_g(64)))
  // 实测该接口 flac 参数返回 48k AAC，故 flac 及以上音质统一降级为 320kmp3
  var br = (quality === '128k') ? '128kmp3' : '320kmp3'
  return _0x6a02(_0x6d02 + '?f=web&user=0&source=kwplayerhd_ar_6.6.6.6_tianbao_T1A_qirui.apk&type=convert_url_with_sign&rid=' + encodeURIComponent(String(rid)) + '&br=' + br, {
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android) AppleWebKit/537.36' },
    timeout: 5000,
  }).then(function(body) {
    var u = body && body.data && body.data.url
    if (u && _0x6a04(u)) return u
    throw new Error(_g(79) + ((body && (body.msg || body.message)) || '获取失败'))
  })
}

// ========== API 源列表 ==========
// txTier: TX平台专用分层竞速优先级，1=优先层（真实音质、响应快），2=备用层
const _0x6b00 = [
  // 公网源
  { name: _g(0),       fetch: _0x6c01,       sources: [_g(100)], txTier: 2 },
  { name: _g(1),     fetch: _0x6c02,     sources: [_g(103)] },
  { name: _g(2),       fetch: _0x6c03,   sources: [_g(100)], txTier: 1 },
  { name: _g(3),    fetch: _0x6c04,     sources: [_g(100)], txTier: 1 },
  { name: _g(4),  fetch: _0x6c05,     sources: [_g(100)], txTier: 1 },
  { name: _g(5),       fetch: _0x6c06,   sources: [_g(99)] },
  { name: _g(6),     fetch: _0x6c07,    sources: [_g(103), _g(99), _g(100), _g(102)], txTier: 2 },
  { name: _g(7),        fetch: _0x6c08,   sources: [_g(102)] },
  { name: _g(8), fetch: _0x6c09, sources: [_g(102)] },
  { name: _g(9),       fetch: _0x6c0a,      sources: [_g(102), _g(103)] },
  { name: _g(10),     fetch: _0x6c0b,    sources: [_g(102), _g(100), _g(99), _g(103), _g(101)] },
  // v1.1.7 新增源
  { name: _g(11),   fetch: _0x6c0c,      sources: [_g(100)], txTier: 2 },
  { name: _g(12),     fetch: _0x6c0d,    sources: [_g(101)] },
  // v1.3.0 新增源 - 星海后端
  { name: _g(13),   fetch: _0x6c0e,     sources: [_g(100), _g(99), _g(103), _g(102), _g(101)], txTier: 2 },
  { name: _g(14),       fetch: _0x6c0f,    sources: [_g(100)], txTier: 2 },
  // v2.2.0 新增可用源 - HYW公益 / vkeys v2 / aa.cab / oiapi咪咕 / 酷我mobi
  { name: _g(15),      fetch: _0x6c10,     sources: [_g(100), _g(99), _g(103), _g(102)], txTier: 2 },
  { name: _g(16),       fetch: _0x6c11,     sources: [_g(100)], txTier: 2 },
  { name: _g(17),    fetch: _0x6c12,   sources: [_g(101)] },
  { name: _g(18),      fetch: _0x6c13,      sources: [_g(103)] },
]

// ========== 核心逻辑：并发竞速策略 ==========
// 对同一平台的所有可用源同时发起请求，取最快返回的有效URL
// 每个源设置4秒超时，避免慢速API阻塞；任一成功即返回
var RACE_TIMEOUT = 4000

// 并发竞速：所有候选源同时请求，任一成功即返回
var _0x6b02 = function(candidates, source, musicInfo, quality) {
  if (candidates.length === 0) {
    return Promise.reject(new Error(_g(65)))
  }
  // 单源直接返回（带超时）
  if (candidates.length === 1) {
    var t0 = Date.now()
    return _0x6a03(candidates[0].fetch(source, musicInfo, quality), RACE_TIMEOUT).then(function(url) {
      var elapsed = Date.now() - t0
      var ok = !!(url && _0x6a04(url))
      _0x6b04(source, candidates[0].name, ok, elapsed, quality)
      if (ok) return url
      return Promise.reject(new Error(candidates[0].name + ': 无效URL'))
    }).catch(function(e) {
      var elapsed = Date.now() - t0
      _0x6b04(source, candidates[0].name, false, elapsed, quality)
      _0x6b05(source, quality, candidates)
      throw e
    })
  }
  // 多源并发竞速
  var errors = []
  var resolved = false
  return new Promise(function(resolve, reject) {
    var pending = candidates.length
    var onSettled = function() {
      pending--
      if (pending === 0 && !resolved) {
        _0x6b05(source, quality, candidates)
        reject(new Error(_g(80) + errors.join('\n')))
      }
    }
    for (var i = 0; i < candidates.length; i++) {
      (function(apiSource) {
        var t0 = Date.now()
        _0x6a03(apiSource.fetch(source, musicInfo, quality), RACE_TIMEOUT).then(function(url) {
          if (resolved) return
          var elapsed = Date.now() - t0
          if (url && _0x6a04(url)) {
            _0x6b04(source, apiSource.name, true, elapsed, quality)
            resolved = true
            resolve(url)
          } else {
            _0x6b04(source, apiSource.name, false, elapsed, quality)
            errors.push(apiSource.name + ': 无效URL')
            onSettled()
          }
        }).catch(function(e) {
          if (resolved) return
          var elapsed = Date.now() - t0
          _0x6b04(source, apiSource.name, false, elapsed, quality)
          errors.push(apiSource.name + ': ' + (e.message || e))
          onSettled()
        })
      })(candidates[i])
    }
  })
}

// TX 平台延迟并发：优先层立即启动，备用层延迟500ms加入竞速
// 避免串行等待（原方案最坏12s），最坏情况仅需5s超时
var _0x6b03 = function(tier1, tier2, source, musicInfo, quality) {
  if (tier1.length === 0 && tier2.length === 0) {
    return Promise.reject(new Error(_g(65)))
  }
  if (tier2.length === 0) return _0x6b02(tier1, source, musicInfo, quality)
  if (tier1.length === 0) return _0x6b02(tier2, source, musicInfo, quality)

  var errors = []
  var resolved = false
  var pending = 0
  var allTier = tier1.concat(tier2)

  return new Promise(function(resolve, reject) {
    var onSettled = function() {
      pending--
      if (pending === 0 && !resolved) {
        _0x6b05(source, quality, allTier)
        reject(new Error(_g(80) + errors.join('\n')))
      }
    }
    var launch = function(apiSource) {
      pending++
      var t0 = Date.now()
      _0x6a03(apiSource.fetch(source, musicInfo, quality), RACE_TIMEOUT).then(function(url) {
        if (resolved) return
        var elapsed = Date.now() - t0
        if (url && _0x6a04(url)) {
          _0x6b04(source, apiSource.name, true, elapsed, quality)
          resolved = true
          resolve(url)
        } else {
          _0x6b04(source, apiSource.name, false, elapsed, quality)
          errors.push(apiSource.name + ': 无效URL')
          onSettled()
        }
      }).catch(function(e) {
        if (resolved) return
        var elapsed = Date.now() - t0
        _0x6b04(source, apiSource.name, false, elapsed, quality)
        errors.push(apiSource.name + ': ' + (e.message || e))
        onSettled()
      })
    }

    // 优先层立即启动
    for (var i = 0; i < tier1.length; i++) launch(tier1[i])
    // 备用层延迟300ms启动，给优先层先发优势
    setTimeout(function() {
      if (resolved) return
      for (var j = 0; j < tier2.length; j++) launch(tier2[j])
    }, 300)
  })
}

const _0x6b01 = function(source, musicInfo, quality) {
  // 版本被面板停用（精确清单/版本下限）时拒绝所有请求，与面板说明对齐
  if (_scriptDisabled) {
    return Promise.reject(new Error(_g(66)))
  }
  // 应用面板的最大音质限制：超出档位自动降级到允许的最高音质
  quality = _0x6b09(quality)
  // 筛选支持该平台的源
  var candidates = []
  for (var i = 0; i < _0x6b00.length; i++) {
    if (_0x6b00[i].sources.indexOf(source) !== -1) {
      candidates.push(_0x6b00[i])
    }
  }
  if (candidates.length === 0) {
    return Promise.reject(new Error(_g(81) + source))
  }
  // 按面板统计的请求速度（平均响应时间）重排优先级：快者先发
  candidates = _0x6b0a(candidates, source)
  // TX 平台使用延迟并发：优先层立即启动，备用层延迟300ms加入
  // 优先层为真实音质源（念心TX、vkeys腾讯/v2），备用层为玉宁熙、aa.cab 等
  if (source === _g(100)) {
    var tier1 = []
    var tier2 = []
    for (var j = 0; j < candidates.length; j++) {
      if (candidates[j].txTier === 1) tier1.push(candidates[j])
      else tier2.push(candidates[j])
    }
    return _0x6b03(tier1, tier2, source, musicInfo, quality)
  }
  return _0x6b02(candidates, source, musicInfo, quality)
}

// ========== _0x6b10 对象（对齐官方示例结构）==========
const _0x6b10 = {
  [_g(103)]: {
    [_g(98)]: function(musicInfo, quality) {
      return _0x6b01('kw', musicInfo, quality)
    },
  },
  [_g(99)]: {
    [_g(98)]: function(musicInfo, quality) {
      return _0x6b01('kg', musicInfo, quality)
    },
  },
  [_g(100)]: {
    [_g(98)]: function(musicInfo, quality) {
      return _0x6b01('tx', musicInfo, quality)
    },
  },
  [_g(102)]: {
    [_g(98)]: function(musicInfo, quality) {
      return _0x6b01('wy', musicInfo, quality)
    },
  },
  [_g(101)]: {
    [_g(98)]: function(musicInfo, quality) {
      return _0x6b01('mg', musicInfo, quality)
    },
  },
}

// 注册应用 API 请求事件
// 官方约定：回调必须返回 Promise；此处对平台缺失/参数缺失/同步异常全部兜底为 Promise.reject，
// 避免同步抛错掩盖真实原因（初始化与请求阶段的异常在部分宿主中会导致脚本判定失败）
on(EVENT_NAMES.request, function(params) {
  try {
    var source = params ? params.source : ''
    var action = params ? params.action : ''
    var info = (params && params.info) || {}
    switch (action) {
      case _g(98): {
        var api = _0x6b10[source]
        if (!api || typeof api[_g(98)] !== 'function') {
          return Promise.reject(new Error(_g(82) + source))
        }
        if (!info.musicInfo) {
          return Promise.reject(new Error(_g(67)))
        }
        return api[_g(98)](info.musicInfo, info.type).catch(function(err) {
          _0x6b0f(err)
          return Promise.reject(err)
        })
      }
      default:
        _0x6b0e('action(' + action + ') not support')
        return Promise.reject(new Error(_g(68)))
    }
  } catch (e) {
    return Promise.reject(e)
  }
})

// ========== 更新检查 ==========
// 脚本初始化时异步检查面板是否有新版本，若有则发送 updateAlert 事件
// 参考文档: https://www.lxmusic.cn/docs/music-source/
var SCRIPT_VERSION = 'v2.2.1-fix'

var _compareVersion = function(v1, v2) {
  var a = String(v1).replace(/^v/i, '').split('.')
  var b = String(v2).replace(/^v/i, '').split('.')
  var len = Math.max(a.length, b.length)
  for (var i = 0; i < len; i++) {
    var na = parseInt(a[i] || '0', 10)
    var nb = parseInt(b[i] || '0', 10)
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

// ========== 消息收集器 ==========
// LX 文档硬性限制：updateAlert 每次运行脚本只能调用一次（官方 preload 再次调用直接 reject）。
// 因此广播/定向通知/停用提示/更新日志/用户ID 全部先入队，最后合并为唯一一条弹窗。
var _pendingMsgs = []
var _0x6b0b = function(text) {
  if (!text) return
  _pendingMsgs.push(String(text))
}
// 合并收集到的全部消息并只发送一次 updateAlert（总量截断 1024 字符）
var _0x6b0c = function(updateUrl) {
  if (_pendingMsgs.length === 0) return
  var log = _pendingMsgs.join('\n\n')
  if (log.length > 1024) log = log.substring(0, 1024)
  _pendingMsgs = []
  try {
    var ret = send(EVENT_NAMES.updateAlert, { log: log, updateUrl: updateUrl || '' })
    // send 返回 Promise；官方环境重复调用等异常在此兜底，避免未处理 rejection
    if (ret && typeof ret.catch === 'function') ret.catch(function() {})
  } catch (e) {}
}

// ========== 最大音质限制（面板 check_update 下发，用户规则优先于全局规则）==========
var _maxQuality = ''
// 档位高低：standard <= 128k <= 320k <= flac <= flac24bit
var _qualityRank = { standard: 0, '128k': 1, '320k': 2, 'flac': 3, 'flac24bit': 4 }
var _0x6b09 = function(quality) {
  if (!_maxQuality) return quality
  var q = String(quality || '128k').toLowerCase()
  var cap = String(_maxQuality).toLowerCase()
  var rq = _qualityRank[q]
  var rc = _qualityRank[cap]
  // 未知档位不做降级，避免误伤应用新增的音质
  if (rq === undefined || rc === undefined || rq <= rc) return quality
  return cap
}

// ========== 版本停用 / 请求速度优先级（面板 check_update 下发）==========
// 停用标志：命中精确停用清单或版本低于下限时置真，后续所有请求直接拒绝
var _scriptDisabled = false
// 请求速度优先级：平台 => 按平均响应时间升序的接口名数组
var _sourcePriority = {}
// 按面板下发的速度优先级排序候选源（未记录的接口排尾；无数据保持原顺序）
var _0x6b0a = function(candidates, source) {
  var order = _sourcePriority ? _sourcePriority[source] : null
  if (!order || order.length === 0) return candidates
  var idx = {}
  for (var i = 0; i < order.length; i++) idx[order[i]] = i
  return candidates.slice().sort(function(a, b) {
    var ia = idx[a.name] !== undefined ? idx[a.name] : 9999
    var ib = idx[b.name] !== undefined ? idx[b.name] : 9999
    return ia - ib
  })
}

var _0x6b0d = function() {
  if (!PANEL_REPORT_URL) return
  // 从 report.php 地址推导出 api.php 地址
  var apiUrl = PANEL_REPORT_URL.replace(/\/report\.php.*$/, _g(83))
  if (apiUrl === PANEL_REPORT_URL) return
  // 附带用户标识，便于面板统计与定向下发
  apiUrl += _g(88) + encodeURIComponent(_userId || '')
  _0x6a02(apiUrl, { method: 'GET', timeout: 5000 }).then(function(body) {
    if (!body) return
    // 面板公告（广播）与定向通知 —— 先入队，最后统一弹出
    _0x6b0b(body.broadcast)
    _0x6b0b(body.notify)
    // 面板下发的最大音质限制，后续播放请求按此降级
    if (body.max_quality !== undefined) _maxQuality = String(body.max_quality || '')
    // 按请求速度排序的接口优先级（v2.2.1+）
    if (body.source_priority && typeof body.source_priority === 'object') {
      _sourcePriority = body.source_priority
    }
    // 版本停用判断：精确停用清单 + 版本下限（一键停用旧版本下发）
    var disabled = body.disabled_versions
    var isDisabled = Object.prototype.toString.call(disabled) === '[object Array]' && disabled.indexOf(SCRIPT_VERSION) !== -1
    var below = body.disabled_below ? String(body.disabled_below) : ''
    if (!isDisabled && below && _compareVersion(SCRIPT_VERSION, below) < 0) isDisabled = true
    if (isDisabled) {
      _scriptDisabled = true
      _0x6b0b('您当前使用的版本 ' + SCRIPT_VERSION + ' 已被停用，请升级到最新版本。')
    }
    // 更新日志（停用状态下不再提示更新，只提示升级）
    var updateUrl = ''
    if (!isDisabled && body.version && _compareVersion(body.version, SCRIPT_VERSION) > 0) {
      _0x6b0b(body.log || ('发现新版本 ' + body.version))
      updateUrl = body.updateUrl || ''
    }
    // 推送用户ID：随更新提示/公告内容一起弹出（v2.2.1+）
    if (body.push_user_id && _userId) {
      _0x6b0b('你的用户ID：' + _userId + '\n（可向管理员报备此ID，用于换取定向通知/白名单/音质权限，请勿泄露）')
    }
    // 唯一一次 updateAlert：合并广播/通知/停用/更新/用户ID
    _0x6b0c(updateUrl)
  }).catch(function(e) {
    // 更新检查失败不影响正常使用
  })
}

// 脚本初始化完成后发送 inited 事件告知应用
// 官方约定：send(inited) 之前任何异常都会导致脚本初始化失败，
// 因此将 inited 放在最前，用户标识/IP 检测与面板检查等非关键初始化放在其后并各自兜底
send(EVENT_NAMES.inited, {
  sources: {
    [_g(103)]: {
      name: '酷我音乐',
      type: 'music',
      actions: [_g(98)],
      qualitys: ['128k', '320k', 'flac', 'flac24bit'],
    },
    [_g(99)]: {
      name: '酷狗音乐',
      type: 'music',
      actions: [_g(98)],
      qualitys: ['128k', '320k', 'flac', 'flac24bit'],
    },
    [_g(100)]: {
      name: 'QQ音乐',
      type: 'music',
      actions: [_g(98)],
      // 仅声明文档有效音质（128k/320k/flac/flac24bit），非法值会被官方过滤且可能导致严格端校验失败
      qualitys: ['128k', '320k', 'flac', 'flac24bit'],
    },
    [_g(102)]: {
      name: '网易云音乐',
      type: 'music',
      actions: [_g(98)],
      qualitys: ['128k', '320k', 'flac', 'flac24bit'],
    },
    [_g(101)]: {
      name: '咪咕音乐',
      type: 'music',
      actions: [_g(98)],
      qualitys: ['128k', '320k', 'flac', 'flac24bit'],
    },
  },
})
try { _0x6b06() } catch (e) {}
try { _0x6b07() } catch (e) {}
try { _0x6b08() } catch (e) {}
try { _0x6b0d() } catch (e) {}

// ===== 测试钩子（仅沙箱回归测试显式开启；LX 环境不定义 __HM_TEST__，自动跳过） =====
if (typeof globalThis !== 'undefined' && globalThis.__HM_TEST__) {
  globalThis.__hm_test = {
    version: SCRIPT_VERSION,
    API_SOURCES: _0x6b00,
    isValidUrl: _0x6a04,
    handleGetMusicUrl: _0x6b01,
    fetchHywFree: _0x6c10,
    fetchVkeysV2: _0x6c05,
    fetchAaCabTx: _0x6c11,
    fetchOiapiMigu: _0x6c12,
    fetchKwMobi: _0x6c13,
    sortByPriority: function(c, s) { return _0x6b0a(c, s) },
    setPriority: function(p) { _sourcePriority = p },
    isDisabled: function() { return _scriptDisabled },
  }
}
})()
