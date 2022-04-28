import Vue from 'vue';
import App from './App';
import router from './router';
import VueI18n from 'vue-i18n'

import {FabricCanvas } from '../src/components';
import GeminiScrollbar from 'vue-gemini-scrollbar'
import JsBarcode from 'jsbarcode'
import jrQrcode from "jr-qrcode"

Vue.use(VueI18n) // 通过插件的形式挂载
Vue.use(GeminiScrollbar);
Vue.use(FabricCanvas);

/*Vue.use(JsBarcode)
Vue.use(jrQrcode)*/

Vue.config.productionTip = false;
const i18n = new VueI18n({
  locale: 'cn',    // 语言标识

  //this.$i18n.locale // 通过切换locale的值来实现语言切换
  messages: {
    'zh': require('./common/lang/zh'),   // 中文语言包
    'cn': require('./common/lang/cn'),   // 中文语言包
    'en': require('./common/lang/en'),   // 英文语言包
    'ja': require('./common/lang/ja'),   // 日语语言包
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  JsBarcode,
  jrQrcode,
  router,
  template: '<App/>',
  components: { App }
});
