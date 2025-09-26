///////// SCAFFOLD.
// 1. Importar librerías.
console.log(THREE);
console.log(gsap);

// 2. Configurar canvas.
const canvas = document.getElementById("lienzo");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 3. Configurar escena 3D.
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(canvas.width, canvas.height);
renderer.setClearColor("#0a0c2c");
const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);

// 3.1 Configurar mesh.
//const geo = new THREE.TorusKnotGeometry(1, 0.35, 128, 5, 2);
 const geo = new THREE.TorusGeometry( 1, 0.35, 80, 160 ); 

const material = new THREE.MeshStandardMaterial({
    color: "#ffffff",
 //   wireframe: true,
});
const mesh = new THREE.Mesh(geo, material);
scene.add(mesh);
mesh.position.z = -7;

// 3.2 Crear luces.
const frontLight = new THREE.PointLight("#ffffff", 300, 100);
frontLight.position.set(7, 3, 3);
scene.add(frontLight);

const rimLight = new THREE.PointLight("#0066ff", 50, 100);
rimLight.position.set(-7, -3, -7);
scene.add(rimLight);



///////// EN CLASE.

//// A) Cargar múltiples texturas.
// 1. "Loading manager".
const manager = new THREE.LoadingManager();

manager.onStart = function (url, itemsLoaded, itemsTotal) {
   console.log(`Iniciando carga de: ${url} (${itemsLoaded + 1}/${itemsTotal})`);
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
   console.log(`Cargando: ${url} (${itemsLoaded}/${itemsTotal})`);
};

manager.onLoad = function () {
   console.log('✅ ¡Todas las texturas cargadas!');
   createMaterial();
};

manager.onError = function (url) {
   console.error(`❌ Error al cargar: ${url}`);
};

// 2. "Texture loader" para nuestros assets.
const loader = new THREE.TextureLoader(manager);

// 3. Cargamos texturas guardadas en el folder del proyecto.

const iceTexture = {
   albedo: loader.load('./assets/texturas/ice/rock-snow-ice1-2k_Albedo.png'),
   ao: loader.load('./assets/texturas/ice/rock-snow-ice1-2k_AO.png'),
   metalness: loader.load('./assets/texturas/ice/rock-snow-ice1-2k_Metallic.png'),
   normal: loader.load('./assets/texturas/ice/rock-snow-ice1-2k_Normal-ogl.png'),
   roughness: loader.load('./assets/texturas/ice/rock-snow-ice1-2k_Roughness.png'),
   displacement: loader.load('./assets/texturas/ice/rock-snow-ice1-2k_Height.png'),
};

const paperTexture = {
   albedo: loader.load('./assets/texturas/paper/wrinkled-paper-albedo.png'),
   ao: loader.load('./assets/texturas/paper/wrinkled-paper-ao.png'),
   metalness: loader.load('./assets/texturas/paper/wrinkled-paper-metalness.png'),
   normal: loader.load('./assets/texturas/paper/wrinkled-paper-normal-ogl.png'),
   roughness: loader.load('./assets/texturas/paper/wrinkled-paper-roughness.png'),
   displacement: loader.load('./assets/texturas/paper/wrinkled-paper-height.png'),
};

/*
const tex = {
   albedo: loader.load('./assets/texturas/Grid/vented-metal-panel1_albedo.png'),
   ao: loader.load('./assets/texturas/Grid/vented-metal-panel1_ao.png'),
   metalness: loader.load('./assets/texturas/Grid/vented-metal-panel1_metallic.png'),
   normal: loader.load('./assets/texturas/Grid/vented-metal-panel1_normal-ogl.png'),
   //roughness: loader.load('./assets/texturas/Grid/vented-metal-panel1_roughness.png'),
   displacement: loader.load('./assets/texturas/Grid/vented-metal-panel1_height.png'),
};

const alienTexture = {
   albedo: loader.load('./assets/texturas/alien/alien-carniverous-plant_albedo.png'),
   ao: loader.load('./assets/texturas/alien/alien-carniverous-plant_ao.png'),
   metalness: loader.load('./assets/texturas/alien/alien-carniverous-plant_metallic.png'),
   normal: loader.load('./assets/texturas/alien/alien-carniverous-plant_normal-ogl.png'),
   roughness: loader.load('./assets/texturas/alien/alien-carniverous-plant_roughness.png'),
   displacement: loader.load('./assets/texturas/alien/alien-carniverous-plant_height.png'),
};
*/

// 4. Definimos variables y la función que va a crear el material al cargar las texturas.
var iceMaterial;

function createMaterial() {
   iceMaterial = new THREE.MeshStandardMaterial({
       map: iceTexture.albedo,
       aoMap: iceTexture.ao,
       metalnessMap: iceTexture.metalness,
       normalMap: iceTexture.normal,
       roughnessMap: iceTexture.roughness,
       displacementMap: iceTexture.displacement,
       displacementScale: 0.5,
       side: THREE.FrontSide,
       //wireframe: true,
   });

   mesh.material = iceMaterial;
}

//// B) Rotación al scrollear.
// 1. Crear un objeto con la data referente al SCROLL para ocuparla en todos lados.
var scroll = {
   y: 0,
   lerpedY: 0,
   speed: 0.005,
   cof: 0.07
};

// 2. Escuchar el evento scroll y actualizar el valor del scroll.
function updateScrollData(eventData) {
   scroll.y += eventData.deltaY * scroll.speed;
}

window.addEventListener("wheel", updateScrollData);

// 3. Aplicar el valor del scroll a la rotación del mesh. (en el loop de animación)
function updateMeshRotation() {
   mesh.rotation.y = scroll.lerpedY;
}

// 5. Vamos a suavizar un poco el valor de rotación para que los cambios de dirección sean menos bruscos.
function lerpScrollY() {
   scroll.lerpedY += (scroll.y - scroll.lerpedY) * scroll.cof;
}


//// C) Movimiento de cámara con mouse (fricción) aka "Gaze Camera".
// 1. Crear un objeto con la data referente al MOUSE para ocuparla en todos lados.
var mouse = {
   x: 0,
   y: 0,
   normalOffset: {
       x: 0,
       y: 0
   },
   lerpNormalOffset: {
       x: 0,
       y: 0
   },

   cof: 0.07,
   gazeRange: {
       x: 15,
       y: 3
   }
}
// 2. Leer posición del mouse y calcular distancia del mouse al centro.
function updateMouseData(eventData) {
   updateMousePosition(eventData);
   calculateNormalOffset();
}
function updateMousePosition(eventData) {
   mouse.x = eventData.clientX;
   mouse.y = eventData.clientY;
}
function calculateNormalOffset() {
   let windowCenter = {
       x: canvas.width / 2,
       y: canvas.height / 2,
   }
   mouse.normalOffset.x = ( (mouse.x - windowCenter.x) / canvas.width ) * 2;
   mouse.normalOffset.y = ( (mouse.y - windowCenter.y) / canvas.height ) * 2;
}


// a) Suavizar movimiento de cámara.
// 1. Incrementar gradualmente el valor de la distancia que vamos a usar para animar y lo guardamos en otro atributo. (en el loop de animación)

function lerpDistanceToCenter() {
   mouse.lerpNormalOffset.x += (mouse.normalOffset.x - mouse.lerpNormalOffset.x) * mouse.cof;
   mouse.lerpNormalOffset.y += (mouse.normalOffset.y - mouse.lerpNormalOffset.y) * mouse.cof;
}

window.addEventListener("mousemove", updateMouseData);

// 3. Aplicar valor calculado a la posición de la cámara. (en el loop de animación)
function updateCameraPosition() {
   camera.position.x = mouse.lerpNormalOffset.x * mouse.gazeRange.x;
   camera.position.y = -mouse.lerpNormalOffset.y * mouse.gazeRange.y;
}
///////// FIN DE LA CLASE.


/////////
// Final. Crear loop de animación para renderizar constantemente la escena.
function animate() {
    requestAnimationFrame(animate);

    //mesh.rotation.x -= 0.005;
    lerpScrollY();
    updateMeshRotation();

   lerpDistanceToCenter();
    updateCameraPosition();
  camera.lookAt(mesh.position);
      renderer.render(scene, camera);
}

animate();

canvas.addEventListener("click", () => {
    gsap.to(mesh.scale, {
        x: mesh.scale.x + 0.3,
        y: mesh.scale.y + 0.3,
        z: mesh.scale.z + 0.3,
        duration: 1.2,
        ease: "bounce.out"
    });
});