import './assets/main.css'
import { getAuth } from "firebase/auth";
import { createApp } from 'vue'
import App from './App.vue'
import {createRouter,createWebHistory} from 'vue-router';
import { initializeApp } from "firebase/app";
import { VueFire } from 'vuefire';
import IniciarSesion from './components/iniciarSesion.vue';
import LandingPage from './components/LandingPage.vue';
import RecordMain from './components/recordMain.vue';
import supabaseStorage from './components/supabaseStorage.vue';


const routes = [ 
  { path: '/iniciarSesion', component: IniciarSesion },

  { path: '/landingPage', name: 'Inicio', component: LandingPage },

  { 
    path: '/recordMain',
    name: 'Recordatorio',
    component: RecordMain,
    meta: { requiresAuth: true } 
  }
]




const firebaseConfig = {
  apiKey: "AIzaSyCD97rhISMBs70dtoLaPeWoN7xViWfpbh0",
  authDomain: "listarecordatorios.firebaseapp.com",
  projectId: "listarecordatorios",
  storageBucket: "listarecordatorios.firebasestorage.app",
  messagingSenderId: "275425947322",
  appId: "1:275425947322:web:5df5d1dfd1bb759d305c83"
};

const firebaseApp = initializeApp(firebaseConfig);

const app = createApp(App)

export const router = createRouter({
    history: createWebHistory(),
    routes,
})

//app.initializeApp(firebaseConfig);
app.use(router)

app.use( VueFire, {
    firebaseApp,
    modules: [],
});
app.mount('#app')

router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (to.meta.requiresAuth && !user) {
    next('/iniciarSesion'); 
  } else {
    next(); 
  }
});


