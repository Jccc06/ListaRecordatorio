<script setup>
import { supabase } from '@/supabase';
import { ref } from 'vue';


var archivo;
var textoRecordatorio = ref("");
var errorSub = ref(false);

function adjuntarArchivo(e){
   archivo = e.target.files[0];
   console.log(archivo.name);
}


async function subirArchivo() {

    if (archivo){

        const { data, error } = await supabase.storage.from('ArchivosAdjuntos').upload(archivo.name, archivo)
        if (error) {
            console.log("ERROR!");    
            errorSub = true;
        } else {
            console.log("Ha funcionado correctamente.");
            errorSub = false
        }

    }
    if(archivo || !errorSub){
        const {data} = supabase.storage.from('ArchivosAdjuntos').getPublicUrl(archivo.name)
        console.log(data.publicUrl)

        //SUBIR A BD
    }
}
</script>

<template>
    <form @submit.prevent="subirArchivo">
        <label>Texto del recordatorio: </label>
        <input v-model="textoRecordatorio" type="text">

        <input type="file" @change="adjuntarArchivo">
        <button type="sumbit">Enviar</button>
    </form>

</template>

<style>

</style>