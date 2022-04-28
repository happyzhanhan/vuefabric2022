import Vue from 'vue';
import Router from 'vue-router';
import index from '@/examples/index';
import index2 from '@/examples/index2';
import demo001 from '@/examples/ruler-test001';
import testv001 from '@/examples/testv001';
import testv002 from '@/examples/testv002';
import demo003 from '@/examples/ruler-test003';
import testIndex from '@/examples/test2';
import test3 from '@/examples/test3';
import demoIndex from '@/examples/demo'
import testY from '@/examples/testY'


/*const Index = () => import('../examples/index.vue');
const PCIndex = () => import('../examples/index-pc.vue');*/

function isMobile() {
  if( navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/webOS/i)
  || navigator.userAgent.match(/iPhone/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/iPod/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/Windows Phone/i)
  ){
      return true;
  }
  else {
      return false;
  }
}


Vue.use(Router);

const router= new Router({
  mode:'history',
  routes: [
    {
      path: '/',
      name: 'index',
      component: index      //首页
    },
      {
          path: '/index2',
          name: 'index2',
          component: index2      //测试画布
      },
    {
      path: '/demo001',
      name: 'demo001',
      component: demo001      //直接调用引入的标尺组件
    },{
      path: '/testv001',
      name: 'testv001',
      component: testv001     //有画布 有组件间辅助线 的组件 v0.0.1 对应fabric_bak
    },
    {
      path: '/testv002',
      name: 'testv002',
      component: testv002    //有画布 有标尺 有辅助线 （但是标尺不固定） 的组件 v0.0.2
    },
    {
      path: '/demo003',
      name: 'demo003',
      component: demo003        // 调用标尺组件的测试 组件使用ruler-component 和画布结合尝试
    },{
      path: '/testY',
      name: 'testY',
      component: testY        // 调用右键组件测试 组件使用contextmenu-component 和画布结合尝试
    },
    {
      path: '/test',
      name: 'test',
      component: testIndex
    },
    {
      path: '/test3',
      name: 'test3',
      component: test3
    },
    {
      path: '/demo',
      name: 'demo',
      component: demoIndex
    }
  ]
});

router.beforeEach((to, from, next) => {
  //console.log(isMobile());
  next();
  // if (isMobile()) {
  //   if (to.name !== 'home') {
  //     next({ name: 'home' });
  //   } else {
  //     next();
  //   }
  // } else {
  //   if (to.name !== 'index') {
  //      next({ path: '/' });
  //   }else{
  //     next();
  //   }
  // }
});

export default router;
