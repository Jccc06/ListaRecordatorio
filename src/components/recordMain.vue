<script setup>
import "../assets/main.css"
import { computed, ref } from 'vue';
import { useCollection } from 'vuefire';
import { 
  addDoc, collection, getFirestore, query, where,
  deleteDoc, doc, updateDoc, getDocs
} from 'firebase/firestore';
import { signOut, getAuth,
  onAuthStateChanged
} from "firebase/auth";
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase';


var archivo = null;


function adjuntarArchivo(e){
   archivo = e.target.files[0] || null;
}

const auth = getAuth();
const db = getFirestore();
const router = useRouter();
const admin = "admin@gmail.com";
const admininit = ref(false);
const logueado = ref(false);
const nombreUsuario = ref("");
const imgUsuario = ref("");
const idUsuario = ref("");
const texto = ref('');
const editado = ref('');
const prio = ref(["baja", "normal", "alta"]);

let recordatorios = useCollection(collection(db, "recordatorios"));

// AUTH
onAuthStateChanged(auth, (user) => {
  if (user) {
    logueado.value = true;
    nombreUsuario.value = user.displayName || user.email || "Usuario";
    imgUsuario.value = user.photoURL || "";
    idUsuario.value = user.uid;
     if(user.email == admin){
      admininit.value = true;
      console.log("Bienvenido admin");
      recordatorios = useCollection(collection(db, "recordatorios"));
    }
    else{
    const refRecordatorios = collection(db, "recordatorios");
    const q = query(refRecordatorios, where("usuario", "==", idUsuario.value));
    recordatorios = useCollection(q);
    }

  } else {
    logueado.value = false;
    nombreUsuario.value = "";
    imgUsuario.value = "";
  }
});

// LOGOUT
function cerrarSesion() {
  signOut(auth).then(() => {
    router.push({ name: 'Inicio' });
  });
}

var datosArchivo = "";
var errorSup = false;

// AÑADIR
async function anadirRecordatorio() {

   if (archivo){

        const {data, error} = await supabase.storage.from('ArchivosAdjuntos').upload(archivo.name, archivo)
        const nombre = archivo.name;
        if(error){
          errorSup = true;
        }  
        else{      
        const { data } = supabase.storage.from('ArchivosAdjuntos').getPublicUrl(nombre);
         datosArchivo = data.publicUrl;
        }
    }
    if(!archivo || !errorSup){
    
        const textoLimpio = texto.value.trim();
        if (!textoLimpio) return;

        await addDoc(collection(db, "recordatorios"), {
          textoRecordatorio: textoLimpio,
          completado: false,
          edicion: false,
          usuario: idUsuario.value,
          img: datosArchivo,
          prioridad: "normal"
        });

        texto.value = '';
    }
}

//CAMBIAR PRIORIDAD
async function cambiarPrio(prio,item) {
  item.prioridad = prio;
  await updateDoc(doc(db,"recordatorios", item.id),{
    prioridad: item.prioridad
    });
}
// BORRAR UNO
async function borrarRecordatorio(item) {
  if (!confirm('¿Eliminar recordatorio?')) return;

  await deleteDoc(doc(db, "recordatorios", item.id));
}

// BORRAR TODOS
async function borrarTodos() {
  if (!confirm('¿Eliminar todos los completados?')) return;

  const snapshot = await getDocs(collection(db, "recordatorios"));

  
  snapshot.forEach(async (docItem) => {
    const data = docItem.data();
    if (data.usuario === idUsuario.value && data.completado === true) {
      await deleteDoc(docItem.ref);
    }
  });
  }
  


async function tareaComp(item){
  item.completado = true;
  await updateDoc(doc(db,"recordatorios", item.id),{
    completado: item.completado
  });
}

// EDITAR
function modoEdicion(item) {
  editado.value = item.textoRecordatorio;
  item.edicion = true;
}

async function confirmarModoEdicion(item) {
  const nuevo = editado.value.trim();
  if (!nuevo) return;

  await updateDoc(doc(db, "recordatorios", item.id), {
    textoRecordatorio: nuevo
  });

  item.edicion = false;
  editado.value = '';
}

function cancelarModoEdicion(item) {
  item.edicion = false;
  editado.value = '';
}

// COMPUTED
const prioridadOrden = {
  alta: 1,
  normal: 2,
  baja: 3
};

//ORDENAR RECORDATORIOS

const recordatoriosOrdenados = computed(() => {
  return [...recordatorios.value].sort((a, b) => {
    return (prioridadOrden[a.prioridad] || prioridadOrden.normal) - //devuelve el numero dependiendo de la prioridad que tenga
      (prioridadOrden[b.prioridad] || prioridadOrden.normal);
  });
});

const pendientes = computed(() => {
  return recordatorios.value.filter(r => !r.completado).length;
});


</script>

<template>
  <div class="app">
    <div class="card">

      <!-- INFO USUARIO -->
      <div v-if="logueado" class="usuario-info">
        <img :src="imgUsuario" alt="foto de perfil" class="avatar" />
        <p class="bienvenida">Bienvenid@ {{ nombreUsuario }}</p>

        <button @click="cerrarSesion" class="btn btn-logout">
          Cerrar sesión
        </button>
      </div>

      <h1>Recordatorios</h1>

      <!-- INPUT -->
      <div class="formulario">
        <form @submit.prevent="">  
          <input
            v-model="texto"
            @keyup.enter="anadirRecordatorio"
            type="text"
            placeholder="Introduce un recordatorio"
            class="input-texto"
          />
          <input type="file" @change="adjuntarArchivo">
          <button @click="anadirRecordatorio" class="btn">
            Añadir
          </button>
        </form>
      </div>

      <!-- LISTA VACÍA -->
      <p v-if="recordatorios.length === 0" class="vacia">
        No hay recordatorios.
      </p>

      <!-- LISTA -->
      <TransitionGroup v-else tag="ul" name="recordatorio" class="lista">
        <li v-for="item in recordatoriosOrdenados" :key="item.id" class="item">

          <div class="item-superior">
            <div class="item-info">
              <input type="checkbox" v-model="item.completado" @change="tareaComp(item)" />

              <span :class="{ tachado: item.completado }" class="nombre">
                {{ item.textoRecordatorio }}
              </span>
            </div>

            <div class="acciones">
              <button @click="modoEdicion(item)" class="btn">
                Editar
              </button>

              <button @click="borrarRecordatorio(item)" class="btn btn-peligro">
                Eliminar
              </button>
              
              <div v-for="prioridad in prio" :key="prioridad">
                <button
                  @click="cambiarPrio(prioridad, item)"
                  :class="['btn-prioridad', `prioridad-${prioridad}`, { activa: item.prioridad === prioridad }]"
                >
                  {{ prioridad }}
                </button>
              </div>

            </div>
          </div>

          <!-- EDICIÓN -->
          <div v-if="item.edicion" class="editor">
            <input
              v-model="editado"
              type="text"
              :placeholder="item.textoRecordatorio"
              class="input-texto"
            />
            <button @click="confirmarModoEdicion(item)" class="btn">
              Confirmar
            </button>
            <button @click="cancelarModoEdicion(item)" class="btn">
              Cancelar
            </button>
          </div>
        </li>
      </TransitionGroup>

      <!-- RESUMEN -->
      <p class="resumen">
        Hay {{ recordatorios.length }} recordatorios ({{ pendientes }} pendientes)
      </p>

      <!-- BORRAR TODO -->
      <button @click="borrarTodos" class="btn btn-full btn-peligro">
        Borrar Completados
      </button>
    </div>
  </div>
</template>
