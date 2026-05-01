<script setup>
import { RouterView } from 'vue-router';
import "./assets/main.css"


</script>

<template>

<RouterLink to="/landingPage">Inicio</RouterLink>

 
  <RouterLink to="/recordMain">Recordatorios</RouterLink>
 
  <RouterLink to="/iniciarSesion">Iniciar Sesion</RouterLink>
 


<RouterView/>

</template>

<style scoped>



</style>
