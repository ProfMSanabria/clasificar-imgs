// Carga local del modelo de Teachable Machine y clasificación en vivo
let model, webcam, labelContainer, maxPredictions, rafId;


// Ruta local al modelo exportado (ajusta si usas otra carpeta)
//const LOCAL_URL = "model/"; // debe contener model.json, metadata.json y weights.bin
const URL = "https://teachablemachine.withgoogle.com/models/iNvMcp_6k/"; 
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // Cargar modelo y metadatos
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Configurar webcam (flip = true para vista tipo espejo)
  const flip = true;
  webcam = new tmImage.Webcam(224, 224, flip);
  await webcam.setup();
  await webcam.play();

  // Preparar DOM
  const webcamContainer = document.getElementById("webcam-container");
  webcamContainer.innerHTML = "";
  webcamContainer.appendChild(webcam.canvas);

  labelContainer = document.getElementById("label-container");
  labelContainer.innerHTML = "";

  // Filas para cada clase con barra de progreso
  const labels = model.getClassLabels?.() || [];
  for (let i = 0; i < maxPredictions; i++) {
    const row = document.createElement("div");
    row.className = "row";

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = labels[i] ?? `Clase ${i + 1}`;

    const bar = document.createElement("div");
    bar.className = "progress";
    const fill = document.createElement("span");
    bar.appendChild(fill);

    row.appendChild(name);
    row.appendChild(bar);
    labelContainer.appendChild(row);
  }

  // Iniciar bucle
  cancelAnimationFrame(rafId);
  loop();
}

async function loop() {
  await webcam.update();
  await predict();
  rafId = requestAnimationFrame(loop);
}

// Ejecutar predicción cuadro a cuadro
async function predict() {
  if (!model || !webcam) return;
  const predictions = await model.predict(webcam.canvas);

  predictions.forEach((p, i) => {
    const row = labelContainer.children[i];
    if (!row) return;
    const name = row.querySelector(".name");
    const fill = row.querySelector(".progress > span");

    // Mostrar nombre de clase y actualizar barra
    name.textContent = p.className;
    const pct = Math.round(p.probability * 100);
    fill.style.width = `${pct}%`;
    fill.title = `${pct}%`;
  });
}

function stop() {
  cancelAnimationFrame(rafId);
  if (webcam) webcam.stop();
}

// Botones
document.getElementById("startBtn").addEventListener("click", init);
document.getElementById("stopBtn").addEventListener("click", stop);
