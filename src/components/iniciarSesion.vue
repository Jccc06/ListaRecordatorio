<script setup>
import "../assets/main.css"
import { ref } from 'vue';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  browserSessionPersistence,
  setPersistence
} from "firebase/auth";
import { useRouter } from 'vue-router';

import { getFirestore} from "firebase/firestore";

const db = getFirestore();
const auth = getAuth();
const provider = new GoogleAuthProvider();

const logueado = ref(false);
const nombreUsuario = ref("");
const imgUsuario = ref("");
const idUsuario = ref("");

const email = ref('');
const password = ref('');

const router = useRouter();

// DETECTAR SESIÓN
onAuthStateChanged(auth, (user) => {
  if (user) {
    logueado.value = true;
    nombreUsuario.value = user.displayName || user.email || "Usuario";
    imgUsuario.value = user.photoURL || "";
    idUsuario.value = user.uid; 
   
  } else {
    logueado.value = false;
    nombreUsuario.value = "";
    imgUsuario.value = "";
  }
});

// PERSISTENCIA
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    return signInWithEmailAndPassword(auth, email.value, password.value);
  })
  .catch(() => {});

// REGISTRO
function registro() {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      router.push({ name: 'Recordatorio' });
    })
    .catch(() => {});
}

// LOGIN EMAIL
function iniciaSesionEmailPassword() {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then(() => {
      router.push({ name: 'Recordatorio' });
    })
    .catch(() => {});
}

// LOGIN GOOGLE
function iniciaSesion() {
  signInWithPopup(auth, provider)
    .then(() => {
      router.push({ name: 'Recordatorio' });
    })
    .catch(() => {});
}
</script>

<template>
  <div class="app">
    
    <!-- USUARIO LOGUEADO -->
    <div v-if="logueado" class="usuario">
      <img v-if="imgUsuario" :src="imgUsuario" class="avatar" />
      <h2>Bienvenid@ {{ nombreUsuario }}</h2>

      <button class="btn" @click="$router.push({ name: 'Recordatorio' })">
        Ir a mis recordatorios
      </button>
    </div>

    <!-- LOGIN / REGISTRO -->
    <div v-else class="landing">
      <h2>Accede a tus recordatorios</h2>

      <form @submit.prevent="registro" class="formulario">
        
        <label>Email</label>
        <input 
          type="email" 
          v-model="email" 
          placeholder="Introduce tu email"
          class="input-texto"
        />

        <label>Contraseña</label>
        <input 
          type="password" 
          v-model="password" 
          placeholder="Introduce tu contraseña"
          class="input-texto"
        />

        <button type="submit" class="btn">
          Crear cuenta
        </button>

        <p>¿Ya tienes cuenta?</p>

        <button 
          type="button" 
          @click="iniciaSesionEmailPassword" 
          class="btn"
        >
          Iniciar sesión
        </button>

      </form>

      <div class="social">
        <p>O continúa con:</p>

        <button @click="iniciaSesion" class="btn btn-google">
          Google
        </button>
      </div>
    </div>

  </div>
</template>